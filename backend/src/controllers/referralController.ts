// Referral Controller - Manages referral codes and tracking
import { Request, Response } from 'express';
import * as referralService from '../services/referralService';

/**
 * Get user's referral code
 * GET /api/referrals/my-code
 */
export async function getMyReferralCode(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const code = await referralService.getUserReferralCode(userId);

    res.json({
      success: true,
      data: code,
    });
  } catch (error: any) {
    console.error('Get referral code error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get referral code',
    });
  }
}

/**
 * Get referral stats (earnings, referrals)
 * GET /api/referrals/stats
 */
export async function getReferralStats(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await referralService.getReferralStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get referral stats',
    });
  }
}

/**
 * Track referral from signup
 * POST /api/referrals/track
 * Body: { code: "referral_code" }
 */
export async function trackReferral(req: Request, res: Response) {
  try {
    const { code } = req.body;
    const newUserId = req.user?.id;

    if (!newUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    // Track the referral
    const referral = await referralService.trackReferralFromCode(code, newUserId);

    res.json({
      success: true,
      message: 'Referral tracked',
      data: referral,
    });
  } catch (error: any) {
    console.error('Track referral error:', error);
    res.status(500).json({
      error: error.message || 'Failed to track referral',
    });
  }
}

/**
 * Get user's referrals (admin)
 * GET /api/referrals (admin)
 */
export async function getAllReferrals(req: Request, res: Response) {
  try {
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20, status = 'all' } = req.query;

    const filter: any = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const referrals = await referralService.getAllReferrals(filter);

    res.json({
      success: true,
      data: referrals,
    });
  } catch (error: any) {
    console.error('Get all referrals error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get referrals',
    });
  }
}

/**
 * Admin: Approve referral
 * POST /api/referrals/:referralId/approve (admin)
 */
export async function approveReferral(req: Request, res: Response) {
  try {
    const { referralId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const approved = await referralService.approveReferral(referralId);

    res.json({
      success: true,
      message: 'Referral approved',
      data: approved,
    });
  } catch (error: any) {
    console.error('Approve referral error:', error);
    res.status(500).json({
      error: error.message || 'Failed to approve referral',
    });
  }
}

/**
 * Admin: Reject referral
 * POST /api/referrals/:referralId/reject (admin)
 */
export async function rejectReferral(req: Request, res: Response) {
  try {
    const { referralId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const rejected = await referralService.rejectReferral(referralId, reason);

    res.json({
      success: true,
      message: 'Referral rejected',
      data: rejected,
    });
  } catch (error: any) {
    console.error('Reject referral error:', error);
    res.status(500).json({
      error: error.message || 'Failed to reject referral',
    });
  }
}

/**
 * Get referral leaderboard
 * GET /api/referrals/leaderboard
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { limit = 10 } = req.query;

    // Get top referrers by commission
    const stats = await referralService.getAllReferrals();

    // Sort by total commission and limit
    const sorted = stats
      .sort((a: any, b: any) => (b.totalCommission || 0) - (a.totalCommission || 0))
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: sorted,
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get leaderboard',
    });
  }
}

/**
 * Generate new referral code
 * POST /api/referrals/generate
 */
export async function generateNewCode(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const code = await referralService.generateReferralCode(userId);

    res.json({
      success: true,
      message: 'New referral code generated',
      data: code,
    });
  } catch (error: any) {
    console.error('Generate code error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate code',
    });
  }
}

export default {
  getMyReferralCode,
  getReferralStats,
  trackReferral,
  getAllReferrals,
  approveReferral,
  rejectReferral,
  getLeaderboard,
  generateNewCode,
};
