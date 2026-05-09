// =============================================================================
// REFERRAL CONTROLLER - Handle referral system, points, and rewards
// =============================================================================

const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

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

    // Get count of referrals where this user is the referrer
    const [referralCount] = await db.query(
      'SELECT COUNT(*) as count FROM Referral WHERE referrerEmail = ?',
      [user.email]
    );

    // Get total redeemed points by checking 'redemption' tickets for this user
    // This assumes processed tickets indicate redemption completion
    const prisma = require('../utils/prisma');
    const redemptionTickets = await prisma.ticket.findMany({
      where: {
        userId: userId,
        category: 'redemption'
      }
    });

    const totalRedeemed = redemptionTickets.reduce((sum, ticket) => {
      // Extract points from description "Redemption Request: ... wants to redeem 200 points."
      const match = ticket.description.match(/redeem (\d+) points/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    return res.status(200).json(
      successResponse('Referral information retrieved', {
        referralCode: user.referral_code,
        balance: user.points_wallet || 0,
        pointsRedeemed: totalRedeemed,
        totalReferrals: referralCount.count || 0,
        earned: (user.points_wallet || 0) + totalRedeemed
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

    // Create referral record
    const [result] = await db.query(
      `INSERT INTO referrals (referrer_id, referred_email, status)
       VALUES (?, ?, 'pending')`,
      [userId, refereeEmail]
    );

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
      'SELECT referral_code FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;

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
      'SELECT id FROM users WHERE referral_code = ?',
      [referralCode]
    );

    if (!referrer) {
      return res.status(200).json(
        successResponse('Referral code invalid (will not block signup)')
      );
    }

    await db.query(
      `INSERT INTO referrals (referrer_id, referred_email, status)
       VALUES (?, ?, 'pending')
       ON DUPLICATE KEY UPDATE status = 'pending'`,
      [referrer.id, email]
    );

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
    const userId = req.user.id;
    const { referralId } = req.body;

    const [referral] = await db.query(
      'SELECT referrer_id, reward_points FROM referrals WHERE id = ? AND referred_user_id = ?',
      [referralId, userId]
    );

    if (!referral) {
      return res.status(404).json(errorResponse('Referral not found'));
    }

    await db.query(
      'UPDATE referrals SET status = "converted" WHERE id = ?',
      [referralId]
    );

    await db.query(
      'UPDATE users SET referral_points = referral_points + ? WHERE id = ?',
      [referral.reward_points, referral.referrer_id]
    );

    console.log(
      `✅ Referral converted: User ${userId} converted, +${referral.reward_points} points to referrer`
    );

    return res.status(200).json(
      successResponse('Referral conversion tracked', {
        pointsAwarded: referral.reward_points,
        referrerId: referral.referrer_id,
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
    const { pointsToRedeem } = req.body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json(errorResponse('Invalid points amount'));
    }

    // 1. Check if user has enough points
    const [user] = await db.query(
      `SELECT points_wallet, email, name FROM User WHERE id = ?`,
      [userId]
    );

    if (!user || (user.points_wallet || 0) < pointsToRedeem) {
      return res.status(400).json(
        errorResponse('Insufficient referral points')
      );
    }

    // 2. Deduct points from User table
    await db.query(
      'UPDATE User SET points_wallet = points_wallet - ? WHERE id = ?',
      [pointsToRedeem, userId]
    );

    // 3. Create a Ticket for Admin (using Prisma as confirmed in ticketController)
    const prisma = require('../utils/prisma');
    await prisma.ticket.create({
      data: {
        userId: userId,
        subject: 'Points Redemption Request',
        description: `Redemption Request: ${user.name} (${user.email}) wants to redeem ${pointsToRedeem} points.`,
        category: 'redemption',
        priority: 'high'
      }
    });

    console.log(`✅ Redemption ticket created: User ${userId} redeemed ${pointsToRedeem} points`);

    return res.status(200).json(
      successResponse('Redemption request submitted successfully. Our team will contact you soon.', {
        pointsRedeemed: pointsToRedeem,
        remainingPoints: (user.points_wallet || 0) - pointsToRedeem,
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

    const [redemptions] = await db.query(
      `SELECT id, points_used, description, status, created_at
       FROM redemptions
       WHERE user_id = ?
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

module.exports = {
  getReferralInfo,
  createReferral,
  getReferralLink,
  registerReferral,
  trackReferralConversion,
  redeemPoints,
  getRedemptionHistory,
  getAllReferrals,
};
