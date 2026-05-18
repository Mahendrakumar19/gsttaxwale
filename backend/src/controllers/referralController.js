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
    const userId = req.user.id;

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

    return res.status(200).json(
      successResponse('Referral information retrieved', {
        enabled: isEnabled,
        referralCode: user.referral_code,
        balance: ledgerBalance,
        pointsRedeemed: totalRedeemed,
        totalReferrals: referralCount.count || 0,
        earned: ledgerBalance + totalRedeemed
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
    const userId = req.user.id;
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
    const userId = req.user.id;

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
    const userId = req.user.id; // The referee
    const { orderId, amount, serviceId } = req.body;

    // 1. Find the referrer for this referee
    const [user] = await db.query('SELECT email, referrer_id FROM User WHERE id = ?', [userId]);
    if (!user) return res.status(404).json(errorResponse('User not found'));

    let referrerId = user.referrer_id;
    
    // If not in User table, check Referral table
    if (!referrerId) {
      const [referral] = await db.query(
        'SELECT referrerId as id FROM Referral WHERE refereeEmail = ? LIMIT 1',
        [user.email]
      );
      if (referral) referrerId = referral.id;
    }

    if (!referrerId) {
      return res.status(404).json(errorResponse('No referrer found for this user'));
    }

    // 2. Process Reward using Rule Engine
    const rewardAmount = await ReferralService.processPurchaseReward(referrerId, userId, orderId, amount, serviceId);

    // 3. Update status in Referral table
    await db.query(
      "UPDATE Referral SET referralStatus = 'completed', updatedAt = NOW() WHERE refereeEmail = ?",
      [user.email]
    );

    return res.status(200).json(
      successResponse('Referral conversion tracked', {
        rewardAmount,
        referrerId
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
    const userId = req.user.id;
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

    // 2. Create a Ticket for Admin
    const prisma = require('../utils/prisma');
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId,
        subject: '💸 Payout Request: ' + user.name,
        description: `
PAYOUT REQUEST DETAILS:
----------------------
User: ${user.name} (${user.email})
Amount: ₹${pointsToRedeem}
Method: ${payoutMethod.toUpperCase()}
Details: ${payoutDetails}

Please process the payment and update the status of this ticket once completed.
        `,
        category: 'redemption',
        priority: 'high'
      }
    });

    // 3. Update transaction reference with ticket ID
    await db.query(
      "UPDATE wallet_transactions SET reference_id = ? WHERE user_id = ? AND type = 'debit' AND source = 'redemption' ORDER BY created_at DESC LIMIT 1",
      [ticket.id, userId]
    );

    console.log(`✅ Redemption ticket created: User ${userId} redeemed ${pointsToRedeem} points`);

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
    const userId = req.user.id;

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
    const referrals = await db.query(`
      SELECT r.*, u1.name as referrerName, u1.email as referrerEmail, u2.name as refereeName, u2.email as refereeEmail
      FROM Referral r
      LEFT JOIN User u1 ON r.referrerId = u1.id
      LEFT JOIN User u2 ON r.refereeId = u2.id
      ORDER BY r.createdAt DESC
    `);

    return res.status(200).json(successResponse('All referrals retrieved', { referrals }));
  } catch (error) {
    console.error('❌ Error fetching all referrals:', error);
    return res.status(500).json(errorResponse('Failed to fetch referrals'));
  }
}

/**
 * Wallet History (New API)
 */
async function getWalletHistory(req, res) {
  try {
    const userId = req.user.id;
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
    const [referral] = await db.query(`
      SELECT r.*, u1.name as referrerName, u1.email as referrerEmail, u2.name as refereeName, u2.email as refereeEmail
      FROM Referral r
      LEFT JOIN User u1 ON r.referrerId = u1.id
      LEFT JOIN User u2 ON r.refereeId = u2.id
      WHERE r.id = ?
    `, [id]);

    if (!referral) {
      return res.status(404).json(errorResponse('Referral not found'));
    }

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

    return res.status(200).json(successResponse('Referral retrieved successfully', { referral: formattedReferral }));
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

    return res.status(200).json(successResponse('Referral updated successfully', { referral: formattedReferral }));
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
  getWalletHistory,
  getReferralById,
  updateReferralById
};
