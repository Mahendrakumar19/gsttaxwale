// Referral Service - Manages referral codes and tracking
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Generate unique referral code for user
 */
export async function generateReferralCode(userId: string) {
  try {
    // Check if already exists
    const existingCode = await prisma.referralCode.findUnique({
      where: { userId },
    });

    if (existingCode) {
      return existingCode;
    }

    // Generate unique code (8 chars alphanumeric)
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = uuidv4().substring(0, 8).toUpperCase();
      const existing = await prisma.referralCode.findUnique({
        where: { code },
      }).catch(() => null);
      if (!existing) {
        isUnique = true;
      }
    }

    const link = `${process.env.FRONTEND_URL}/signup?ref=${code}`;

    const referralCode = await prisma.referralCode.create({
      data: {
        userId,
        code: code!,
        link,
        isActive: true,
      },
    });

    return referralCode;
  } catch (error: any) {
    throw new Error(`Failed to generate referral code: ${error.message}`);
  }
}

/**
 * Get user's referral code
 */
export async function getUserReferralCode(userId: string) {
  try {
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId },
    });

    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    return referralCode;
  } catch (error: any) {
    throw new Error(`Failed to get referral code: ${error.message}`);
  }
}

/**
 * Validate and track referral from code
 */
export async function trackReferralFromCode(referralCode: string, newUserId: string) {
  try {
    // Find referral code
    const codeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!codeRecord || !codeRecord.isActive) {
      throw new Error('Invalid or expired referral code');
    }

    // Check if same user
    if (codeRecord.userId === newUserId) {
      throw new Error('Cannot use own referral code');
    }

    // Create referral tracking record
    const referral = await prisma.referral.create({
      data: {
        referrerId: codeRecord.userId,
        refereeId: newUserId,
        refereeEmail: '',
        commissionPercent: 10,
        referralStatus: 'pending',
      },
    });

    return referral;
  } catch (error: any) {
    throw new Error(`Failed to track referral: ${error.message}`);
  }
}

/**
 * Get referral stats for user
 */
export async function getReferralStats(userId: string) {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const completedReferrals = referrals.filter((r) => r.referralStatus === 'completed');
    const totalCommission = completedReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
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
  } catch (error: any) {
    throw new Error(`Failed to get referral stats: ${error.message}`);
  }
}

/**
 * Get all referrals (admin)
 */
export async function getAllReferrals(filter?: { status?: string; limit?: number; offset?: number }) {
  try {
    const referrals = await prisma.referral.findMany({
      where: {
        ...(filter?.status && { referralStatus: filter.status }),
      },
      take: filter?.limit || 50,
      skip: filter?.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        referrer: { select: { id: true, email: true, name: true } },
        referee: { select: { id: true, email: true, name: true } },
      },
    });

    return referrals;
  } catch (error: any) {
    throw new Error(`Failed to get referrals: ${error.message}`);
  }
}

/**
 * Approve referral (admin only)
 */
export async function approveReferral(referralId: string) {
  try {
    return await prisma.referral.update({
      where: { id: referralId },
      data: { referralStatus: 'active' },
    });
  } catch (error: any) {
    throw new Error(`Failed to approve referral: ${error.message}`);
  }
}

/**
 * Reject referral (admin only)
 */
export async function rejectReferral(referralId: string) {
  try {
    return await prisma.referral.update({
      where: { id: referralId },
      data: { referralStatus: 'rejected' },
    });
  } catch (error: any) {
    throw new Error(`Failed to reject referral: ${error.message}`);
  }
}

export default {
  generateReferralCode,
  getUserReferralCode,
  trackReferralFromCode,
  getReferralStats,
  getAllReferrals,
  approveReferral,
  rejectReferral,
};
