// Referral Service - Manages referral codes and tracking (JS version)
const prisma = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique referral code for user
 */
async function generateReferralCode(userId) {
  try {
    // 1. Get user details for code generation
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true, phone: true }
    });

    if (!user) throw new Error('User not found');

    // 2. Generate custom code: GTW + first 3 of name + last 3 of mobile
    const namePart = (user.name || 'USR').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const phonePart = (user.phone || '000').slice(-3).padStart(3, '0');
    const code = `GTW${namePart}${phonePart}`;

    const link = `${process.env.FRONTEND_URL}/?ref=${code}`;

    // 3. Create or Update referral code
    const referralCode = await prisma.referralCode.upsert({
      where: { userId: parseInt(userId) },
      update: { code, link },
      create: {
        userId: parseInt(userId),
        code: code,
        link,
        isActive: true,
      },
    });

    return referralCode;
  } catch (error) {
    throw new Error(`Failed to generate referral code: ${error.message}`);
  }
}

/**
 * Get user's referral code
 */
async function getUserReferralCode(userId) {
  try {
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    return referralCode;
  } catch (error) {
    throw new Error(`Failed to get referral code: ${error.message}`);
  }
}

/**
 * Validate and track referral from code
 */
async function trackReferralFromCode(referralCode, newUserId) {
  try {
    // Find referral code
    const codeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!codeRecord || !codeRecord.isActive) {
      throw new Error('Invalid or expired referral code');
    }

    // Check if same user
    if (codeRecord.userId === parseInt(newUserId)) {
      throw new Error('Cannot use own referral code');
    }

    // Create referral tracking record
    const referral = await prisma.referral.create({
      data: {
        referrerId: codeRecord.userId,
        refereeId: parseInt(newUserId),
        refereeEmail: '',
        commissionPercent: 10,
        referralStatus: 'pending',
      },
    });

    return referral;
  } catch (error) {
    throw new Error(`Failed to track referral: ${error.message}`);
  }
}

/**
 * Get referral stats for user
 */
async function getReferralStats(userId) {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: parseInt(userId) },
    });

    const completedReferrals = referrals.filter((r) => r.referralStatus === 'completed');
    const totalCommission = completedReferrals.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
    const pendingCount = referrals.filter((r) => r.referralStatus === 'pending').length;
    const activeCount = referrals.filter((r) => r.referralStatus === 'active').length;

    return {
      totalReferrals: referrals.length,
      completedReferrals: completedReferrals.length,
      pendingReferrals: pendingCount,
      activeReferrals: activeCount,
      totalCommission,
      referrals: referrals.map((r) => ({
        id: r.id,
        refereeEmail: r.refereeEmail,
        status: r.referralStatus,
        commission: r.commissionAmount,
        createdAt: r.createdAt,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to get referral stats: ${error.message}`);
  }
}

/**
 * Get all referrals (admin)
 */
async function getAllReferrals(filter = {}) {
  try {
    const referrals = await prisma.referral.findMany({
      where: {
        ...(filter.status && { referralStatus: filter.status }),
      },
      take: filter.limit || 50,
      skip: filter.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        referrer: { select: { id: true, email: true, name: true } },
        referee: { select: { id: true, email: true, name: true } },
      },
    });

    return referrals;
  } catch (error) {
    throw new Error(`Failed to get referrals: ${error.message}`);
  }
}

module.exports = {
  generateReferralCode,
  getUserReferralCode,
  trackReferralFromCode,
  getReferralStats,
  getAllReferrals,
};
