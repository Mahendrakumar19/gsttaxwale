// =============================================================================
// REFERRAL CONTROLLER - Handle referral system, points, and rewards
// =============================================================================

const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const configUtil = require('../utils/config');

const WalletService = require('../services/walletService');
const ReferralService = require('../services/referralService');

/**
 * Get user's referral information
 */
async function getReferralInfo(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);

    const [user] = await db.query(
      'SELECT email, referral_code, points_wallet FROM User WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Get ledger-based balance (source of truth)
    const ledgerBalance = await WalletService.getBalance(userId);

    // Get count of referrals where this user is the referrer
    const [referralCount] = await db.query(
      'SELECT COUNT(*) as count FROM Referral WHERE referrerId = ?',
      [userId]
    );

    // Get total redeemed points from ledger
    const redemptionResult = await db.query(
      "SELECT SUM(points) as total FROM wallet_transactions WHERE user_id = ? AND type = 'debit' AND source = 'redemption' AND status = 'approved'",
      [userId]
    );
    const totalRedeemed = redemptionResult[0].total || 0;

    const isEnabled = await configUtil.getSetting('ENABLE_REFERRAL', true);

    const referrals = await db.query(
      'SELECT id, refereeEmail, refereePhone, referralStatus, commissionAmount, createdAt FROM Referral WHERE referrerId = ? ORDER BY createdAt DESC',
      [userId]
    );

    const [commissionSum] = await db.query(
      'SELECT SUM(commissionAmount) as sum FROM Referral WHERE referrerId = ?',
      [userId]
    );
    const totalCommission = commissionSum?.sum || 0;

    return res.status(200).json(
      successResponse('Referral information retrieved', {
        enabled: isEnabled,
        referralCode: user.referral_code,
        balance: ledgerBalance,
        pointsRedeemed: totalRedeemed,
        totalReferrals: referralCount.count || 0,
        earned: ledgerBalance + totalRedeemed,
        referrals,
        totalCommission,
        count: referralCount.count || 0
      })
    );

  } catch (error) {
    console.error('❌ Error fetching referral info:', error);
    return res.status(500).json(errorResponse('Failed to fetch referral information: ' + error.message));
  }
}

/**
 * Create a referral (user refers someone)
 */
async function createReferral(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const { refereeEmail, refereePhone } = req.body;

    if (!refereeEmail) {
      return res.status(400).json(errorResponse('Referee email is required'));
    }

    // Create referral record in existing table for compatibility
    const [result] = await db.query(
      `INSERT INTO Referral (referrerId, refereeEmail, refereePhone, referralStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
      [userId, refereeEmail, refereePhone || null]
    );

    // Track Event
    await ReferralService.trackEvent(userId, null, 'signup', { 
      action: 'manual_referral_create',
      refereeEmail 
    });

    console.log(`✅ Referral created: ${refereeEmail} referred by user ${userId}`);

    return res.status(200).json(
      successResponse('Referral created successfully', {
        referralId: result.insertId,
        refereeEmail,
      })
    );
  } catch (error) {
    console.error('❌ Error creating referral:', error);
    return res.status(500).json(errorResponse('Failed to create referral'));
  }
}

/**
 * Get referral link for sharing
 */
async function getReferralLink(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);

    const [user] = await db.query(
      'SELECT referral_code FROM User WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://gsttaxwale.com';
    const referralLink = `${baseUrl}/?ref=${user.referral_code}`;

    return res.status(200).json(
      successResponse('Referral link generated', {
        referralLink,
        referralCode: user.referral_code,
      })
    );
  } catch (error) {
    console.error('❌ Error generating referral link:', error);
    return res.status(500).json(errorResponse('Failed to generate referral link'));
  }
}

/**
 * Register a referred user (called during signup with ?ref=code)
 */
async function registerReferral(req, res) {
  try {
    const { referralCode, email } = req.body;

    if (!referralCode) {
      return res.status(200).json(successResponse('No referral code provided'));
    }

    const [referrer] = await db.query(
      'SELECT id, email FROM User WHERE referral_code = ?',
      [referralCode]
    );

    if (!referrer) {
      return res.status(200).json(
        successResponse('Referral code invalid (will not block signup)')
      );
    }

    // Insert into existing Referral table
    await db.query(
      `INSERT INTO Referral (referrerId, refereeEmail, referralStatus, createdAt, updatedAt)
       VALUES (?, ?, 'pending', NOW(), NOW())
       ON DUPLICATE KEY UPDATE referralStatus = 'pending', updatedAt = NOW()`,
      [referrer.id, email]
    );

    // Track Event
    await ReferralService.trackEvent(referrer.id, null, 'click', { 
      action: 'signup_link_used',
      refereeEmail: email,
      referralCode 
    });

    console.log(`✅ Referral registered: ${email} referred by code ${referralCode}`);

    return res.status(200).json(
      successResponse('Referral registered', {
        referrerId: referrer.id,
      })
    );
  } catch (error) {
    console.error('❌ Error registering referral:', error);
    return res.status(500).json(errorResponse('Failed to register referral'));
  }
}

/**
 * Track referral conversion (user made a purchase)
 */
async function trackReferralConversion(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id); // The referee
    const { orderId, amount, serviceId } = req.body;

    // 1. Get User email
    const [user] = await db.query('SELECT email FROM User WHERE id = ?', [userId]);
    if (!user) return res.status(404).json(errorResponse('User not found'));

    // 2. Process Reward using Refactored Rule Engine (handles guest & customer tracking)
    const rewardAmount = await ReferralService.processPurchaseReward(userId, orderId, amount, serviceId);

    // 3. Update status in legacy Referral table for backwards compatibility
    await db.query(
      "UPDATE Referral SET referralStatus = 'completed', commissionAmount = ?, updatedAt = NOW() WHERE refereeEmail = ?",
      [rewardAmount || 0, user.email]
    );

    return res.status(200).json(
      successResponse('Referral conversion tracked', {
        rewardAmount
      })
    );
  } catch (error) {
    console.error('❌ Error tracking referral conversion:', error);
    return res.status(500).json(errorResponse('Failed to track referral conversion'));
  }
}

/**
 * Redeem referral points - Creates a ticket for Admin
 */
async function redeemPoints(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const { pointsToRedeem, payoutMethod, payoutDetails } = req.body;

    if (!pointsToRedeem || pointsToRedeem < 500) {
      return res.status(400).json(errorResponse('Minimum redemption amount is 500 points (₹500)'));
    }

    if (!payoutMethod || !payoutDetails) {
      return res.status(400).json(errorResponse('Payout method and details (UPI/Bank) are required'));
    }

    // 1. Check if user has enough points and debit from ledger
    try {
      await WalletService.debit(userId, pointsToRedeem, 'redemption', null, `Withdrawal request via ${payoutMethod}: ${payoutDetails}`);
    } catch (e) {
      return res.status(400).json(errorResponse(e.message));
    }

    const [user] = await db.query('SELECT name, email FROM User WHERE id = ?', [userId]);

    // 2. Create a RedeemRequest record
    const redeemResult = await db.query(
      "INSERT INTO RedeemRequest (userId, points_requested, status, reason, createdAt, updatedAt) VALUES (?, ?, 'pending', ?, NOW(), NOW())",
      [userId, pointsToRedeem, `${payoutMethod.toUpperCase()}: ${payoutDetails}`]
    );
    const redeemRequestId = redeemResult.insertId;

    // 3. Create a Ticket for Admin
    const prisma = require('../utils/prisma');
    const ticket = await prisma.supportTicket.create({
      data: {
        User: {
          connect: { id: userId }
        },
        subject: '💸 Payout Request: ' + user.name,
        description: `
PAYOUT REQUEST DETAILS:
----------------------
User: ${user.name} (${user.email})
Amount: ₹${pointsToRedeem}
Method: ${payoutMethod.toUpperCase()}
Details: ${payoutDetails}
Redeem Request ID: ${redeemRequestId}

Please process the payment via the Redeem Requests panel and update the status once completed.
        `,
        category: 'redemption',
        priority: 'high',
        updatedAt: new Date()
      }
    });

    // 4. Update transaction reference with RedeemRequest ID
    await db.query(
      "UPDATE wallet_transactions SET reference_id = ? WHERE user_id = ? AND type = 'debit' AND source = 'redemption' ORDER BY created_at DESC LIMIT 1",
      [redeemRequestId, userId]
    );

    console.log(`✅ Redemption request & ticket created: User ${userId} redeemed ${pointsToRedeem} points (RedeemRequest ID: ${redeemRequestId})`);

    return res.status(200).json(
      successResponse('Redemption request submitted successfully. Our team will contact you soon.', {
        pointsRedeemed: pointsToRedeem
      })
    );
  } catch (error) {
    console.error('❌ Error redeeming points:', error);
    return res.status(500).json(errorResponse('Failed to submit redemption request: ' + error.message));
  }
}

/**
 * Get redemption history
 */
async function getRedemptionHistory(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);

    const redemptions = await db.query(
      `SELECT id, points as points_used, description, status, created_at
       FROM wallet_transactions
       WHERE user_id = ? AND source = 'redemption'
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json(
      successResponse('Redemption history retrieved', {
        redemptions,
      })
    );
  } catch (error) {
    console.error('❌ Error fetching redemption history:', error);
    return res.status(500).json(errorResponse('Failed to fetch redemption history'));
  }
}

/**
 * Get all referrals (Admin only)
 */
async function getAllReferrals(req, res) {
  try {
    // 1. Fetch legacy referrals
    const referrals = await db.query(`
      SELECT r.*, 
             u1.name as referrerName, u1.email as referrerEmail, 
             u2.name as refereeName, u2.email as refereeEmail,
             rl.id as leadId, rl.referred_name as guestName, rl.service_interest as serviceInterest,
             rl.status as leadStatus
      FROM Referral r
      LEFT JOIN User u1 ON r.referrerId = u1.id
      LEFT JOIN User u2 ON r.refereeId = u2.id
      LEFT JOIN referral_leads rl ON r.refereeEmail = rl.referred_email
      ORDER BY r.createdAt DESC
    `);

    // 2. Fetch all referral_leads (includes both guest and customer referrers)
    const leads = await db.query(`
      SELECT rl.id as leadId,
             rl.referrer_referral_id,
             rl.referred_name as guestName,
             rl.referred_email as refereeEmail,
             rl.referred_mobile as refereePhone,
             rl.service_interest as serviceInterest,
             rl.status as referralStatus,
             rl.created_at as createdAt,
             rl.converted_user_id as refereeId,
             COALESCE(u.name, rr.name) as referrerName,
             COALESCE(u.email, rr.email) as referrerEmail,
             u.id as referrerId
      FROM referral_leads rl
      LEFT JOIN User u ON rl.referrer_referral_id = u.referral_code
      LEFT JOIN referral_referrers rr ON rl.referrer_referral_id = rr.referral_id
      ORDER BY rl.created_at DESC
    `);

    // Merge logic to prevent duplicates and format correctly
    const mergedMap = new Map();

    // Add legacy referrals first
    referrals.forEach(r => {
      const emailKey = r.refereeEmail ? r.refereeEmail.toLowerCase() : '';
      const phoneKey = r.refereePhone ? r.refereePhone.replace(/\D/g, '') : '';
      
      const referrerName = r.referrerName || 'N/A';
      const refereeName = r.refereeName || r.guestName || (r.notes ? r.notes.replace('Referred Guest Name: ', '') : '') || 'Guest';

      const item = {
        id: r.id,
        referrerId: r.referrerId,
        refereeId: r.refereeId,
        refereeEmail: r.refereeEmail,
        refereePhone: r.refereePhone,
        commissionAmount: r.commissionAmount || 0,
        commissionPercent: r.commissionPercent || 10,
        referralStatus: r.leadStatus || r.referralStatus || 'pending',
        createdAt: r.createdAt,
        referrerName,
        referredName: refereeName,
        referrerEmail: r.referrerEmail,
        leadId: r.leadId,
        serviceInterest: r.serviceInterest
      };

      if (emailKey) mergedMap.set(`email_${emailKey}`, item);
      if (phoneKey) mergedMap.set(`phone_${phoneKey}`, item);
      mergedMap.set(`id_${r.id}`, item);
    });

    // Add/merge leads
    leads.forEach(l => {
      const emailKey = l.refereeEmail ? l.refereeEmail.toLowerCase() : '';
      const phoneKey = l.refereePhone ? l.refereePhone.replace(/\D/g, '') : '';

      let existing = null;
      if (emailKey && mergedMap.has(`email_${emailKey}`)) {
        existing = mergedMap.get(`email_${emailKey}`);
      } else if (phoneKey && mergedMap.has(`phone_${phoneKey}`)) {
        existing = mergedMap.get(`phone_${phoneKey}`);
      }

      if (existing) {
        if (l.leadId) existing.leadId = l.leadId;
        if (l.serviceInterest) existing.serviceInterest = l.serviceInterest;
        if (l.referralStatus) existing.referralStatus = l.referralStatus;
        if (l.referrerName && existing.referrerName === 'N/A') {
          existing.referrerName = l.referrerName;
          existing.referrerEmail = l.referrerEmail;
        }
      } else {
        const refereeName = l.guestName || 'Guest';
        const referrerName = l.referrerName || 'Guest Referrer';

        const item = {
          id: `lead_${l.leadId}`,
          referrerId: l.referrerId || null,
          refereeId: l.refereeId || null,
          refereeEmail: l.refereeEmail,
          refereePhone: l.refereePhone,
          commissionAmount: 0,
          commissionPercent: 10,
          referralStatus: l.referralStatus,
          createdAt: l.createdAt,
          referrerName,
          referredName: refereeName,
          referrerEmail: l.referrerEmail,
          leadId: l.leadId,
          serviceInterest: l.serviceInterest
        };

        if (emailKey) mergedMap.set(`email_${emailKey}`, item);
        if (phoneKey) mergedMap.set(`phone_${phoneKey}`, item);
        mergedMap.set(`id_lead_${l.leadId}`, item);
      }
    });

    const finalReferrals = [];
    const seenIds = new Set();
    for (const [key, val] of mergedMap.entries()) {
      if (key.startsWith('id_') && !seenIds.has(val.id)) {
        seenIds.add(val.id);
        
        val.referrer = {
          name: val.referrerName,
          email: val.referrerEmail
        };
        val.referee = {
          name: val.referredName,
          email: val.refereeEmail,
          phone: val.refereePhone
        };
        
        finalReferrals.push(val);
      }
    }

    finalReferrals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(successResponse({ referrals: finalReferrals }, 'All referrals retrieved'));
  } catch (error) {
    console.error('❌ Error fetching all referrals:', error);
    return res.status(500).json(errorResponse('Failed to fetch referrals'));
  }
}

/**
 * Get referral stats (Admin only)
 */
async function getReferralStats(req, res) {
  try {
    const [totalRes] = await db.query('SELECT COUNT(*) as count FROM referral_leads');
    const totalReferrals = totalRes?.count || 0;

    const [commissionRes] = await db.query('SELECT SUM(commissionAmount) as sum FROM Referral');
    const totalCommission = commissionRes?.sum || 0;

    const [activeRes] = await db.query("SELECT COUNT(*) as count FROM referral_leads WHERE status IN ('converted', 'completed')");
    const activeReferrals = activeRes?.count || 0;

    const statusBreakdown = await db.query(`
      SELECT status as referralStatus, COUNT(*) as count 
      FROM referral_leads 
      GROUP BY status
    `);

    const statsBreakdown = statusBreakdown.map(row => ({
      referralStatus: row.referralStatus,
      _count: {
        id: row.count
      }
    }));

    return res.status(200).json(successResponse({
      totalReferrals,
      totalCommission,
      totalEarnings: totalCommission,
      activeReferrals,
      stats: statsBreakdown
    }, 'Referral stats retrieved successfully'));
  } catch (error) {
    console.error('❌ Error fetching referral stats:', error);
    return res.status(500).json(errorResponse('Failed to fetch referral stats'));
  }
}

/**
 * Wallet History (New API)
 */
async function getWalletHistory(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);
    const history = await WalletService.getTransactionHistory(userId);
    const balance = await WalletService.getBalance(userId);

    return res.status(200).json(successResponse({ history, balance }, 'Wallet history fetched'));
  } catch (error) {
    console.error('❌ Error fetching wallet history:', error);
    return res.status(500).json(errorResponse('Failed to fetch wallet history'));
  }
}

/**
 * Get referral by ID (Admin only)
 */
async function getReferralById(req, res) {
  try {
    const { id } = req.params;

    if (String(id).startsWith('lead_')) {
      const leadId = id.split('_')[1];
      const [lead] = await db.query(`
        SELECT rl.*,
               rl.referred_name as guest_name,
               rl.referred_email as guest_email,
               rl.referred_mobile as guest_phone,
               COALESCE(u.name, rr.name) as referrerName,
               COALESCE(u.email, rr.email) as referrerEmail,
               COALESCE(u.phone, rr.mobile) as referrerPhone
        FROM referral_leads rl
        LEFT JOIN User u ON rl.referrer_referral_id = u.referral_code
        LEFT JOIN referral_referrers rr ON rl.referrer_referral_id = rr.referral_id
        WHERE rl.id = ?
      `, [leadId]);

      if (!lead) {
        return res.status(404).json(errorResponse('Referral not found'));
      }

      const formattedReferral = {
        id: `lead_${lead.id}`,
        referrerId: null,
        refereeId: lead.converted_user_id,
        refereeEmail: lead.referred_email,
        refereePhone: lead.referred_mobile,
        commissionAmount: 0,
        commissionPercent: 10,
        referralStatus: lead.status,
        createdAt: lead.created_at,
        notes: lead.notes,
        leadId: lead.id,
        serviceInterest: lead.service_interest,
        referrer: {
          name: lead.referrerName || 'Guest Referrer',
          email: lead.referrerEmail
        },
        referee: {
          name: lead.referred_name
        }
      };

      return res.status(200).json(successResponse({ referral: formattedReferral }, 'Referral retrieved successfully'));
    }

    const [referral] = await db.query(`
      SELECT r.*, 
             u1.name as referrerName, u1.email as referrerEmail, 
             u2.name as refereeName, u2.email as refereeEmail,
             rl.id as leadId, rl.referred_name as guestName, rl.service_interest as serviceInterest
      FROM Referral r
      LEFT JOIN User u1 ON r.referrerId = u1.id
      LEFT JOIN User u2 ON r.refereeId = u2.id
      LEFT JOIN referral_leads rl ON r.refereeEmail = rl.referred_email
      WHERE r.id = ?
    `, [id]);

    if (!referral) {
      return res.status(404).json(errorResponse('Referral not found'));
    }

    const formattedReferral = {
      ...referral,
      referrer: {
        name: referral.referrerName || 'N/A',
        email: referral.referrerEmail
      },
      referee: {
        name: referral.refereeName || referral.guestName || (referral.notes ? referral.notes.replace('Referred Guest Name: ', '') : '') || 'Guest'
      },
      leadId: referral.leadId,
      serviceInterest: referral.serviceInterest
    };

    return res.status(200).json(successResponse({ referral: formattedReferral }, 'Referral retrieved successfully'));
  } catch (error) {
    console.error('❌ Error fetching referral by ID:', error);
    return res.status(500).json(errorResponse('Failed to fetch referral details'));
  }
}

/**
 * Update referral by ID (Admin only)
 */
async function updateReferralById(req, res) {
  try {
    const { id } = req.params;
    const { referralStatus, commissionAmount, notes } = req.body;

    if (String(id).startsWith('lead_')) {
      const leadId = id.split('_')[1];
      const updateFields = {};
      if (referralStatus) {
        updateFields.status = referralStatus;
      }
      if (notes !== undefined) {
        updateFields.notes = notes;
      }
      updateFields.updated_at = new Date();

      await db.update('referral_leads', updateFields, { id: leadId });

      const [lead] = await db.query(`
        SELECT rl.*,
               rl.referred_name as guest_name,
               rl.referred_email as guest_email,
               rl.referred_mobile as guest_phone,
               COALESCE(u.name, rr.name) as referrerName,
               COALESCE(u.email, rr.email) as referrerEmail,
               COALESCE(u.phone, rr.mobile) as referrerPhone
        FROM referral_leads rl
        LEFT JOIN User u ON rl.referrer_referral_id = u.referral_code
        LEFT JOIN referral_referrers rr ON rl.referrer_referral_id = rr.referral_id
        WHERE rl.id = ?
      `, [leadId]);

      const formattedReferral = {
        id: `lead_${lead.id}`,
        referrerId: null,
        refereeId: lead.converted_user_id,
        refereeEmail: lead.referred_email,
        refereePhone: lead.referred_mobile,
        commissionAmount: 0,
        commissionPercent: 10,
        referralStatus: lead.status,
        createdAt: lead.created_at,
        notes: lead.notes,
        leadId: lead.id,
        serviceInterest: lead.service_interest,
        referrer: {
          name: lead.referrerName || 'Guest Referrer',
          email: lead.referrerEmail
        },
        referee: {
          name: lead.referred_name
        }
      };

      return res.status(200).json(successResponse({ referral: formattedReferral }, 'Referral updated successfully'));
    }

    await db.query(`
      UPDATE Referral 
      SET referralStatus = ?, commissionAmount = ?, notes = ?, updatedAt = NOW()
      WHERE id = ?
    `, [referralStatus, commissionAmount, notes, id]);

    const [referral] = await db.query(`
      SELECT r.*, u1.name as referrerName, u1.email as referrerEmail, u2.name as refereeName, u2.email as refereeEmail
      FROM Referral r
      LEFT JOIN User u1 ON r.referrerId = u1.id
      LEFT JOIN User u2 ON r.refereeId = u2.id
      WHERE r.id = ?
    `, [id]);

    const formattedReferral = {
      ...referral,
      referrer: {
        name: referral.referrerName,
        email: referral.referrerEmail
      },
      referee: referral.refereeName ? {
        name: referral.refereeName
      } : null
    };

    return res.status(200).json(successResponse({ referral: formattedReferral }, 'Referral updated successfully'));
  } catch (error) {
    console.error('❌ Error updating referral:', error);
    return res.status(500).json(errorResponse('Failed to update referral'));
  }
}

module.exports = {
  getReferralInfo,
  createReferral,
  getReferralLink,
  registerReferral,
  trackReferralConversion,
  redeemPoints,
  getRedemptionHistory,
  getAllReferrals,
  getReferralStats,
  getWalletHistory,
  getReferralById,
  updateReferralById
};
