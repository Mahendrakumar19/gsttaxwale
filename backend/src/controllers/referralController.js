const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a referral (user refers someone)
async function createReferral(req, res) {
  const { refereeEmail, refereePhone } = req.body;
  const referrerId = req.user.id;

  if (!refereeEmail) {
    return res.status(400).json({ error: 'Referee email is required' });
  }

  const referral = await prisma.referral.create({
    data: {
      referrerId,
      refereeEmail,
      refereePhone: refereePhone || null,
      commissionPercent: 10,
      referralStatus: 'pending'
    },
    include: { referrer: { select: { id: true, name: true, email: true } } }
  });

  res.json({ data: { referral }, message: 'Referral created successfully' });
}

// Get user's referrals
async function getUserReferrals(req, res) {
  const userId = req.user.id;

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: { 
      referee: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate total commission
  const totalCommission = referrals.reduce((sum, ref) => sum + (ref.commissionAmount || 0), 0);

  res.json({ 
    data: { 
      referrals,
      totalCommission,
      count: referrals.length
    } 
  });
}

// Get all referrals (admin)
async function getAllReferrals(req, res) {
  const referrals = await prisma.referral.findMany({
    include: {
      referrer: { select: { id: true, name: true, email: true } },
      referee: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { referrals } });
}

// Get referral by ID
async function getReferral(req, res) {
  const { id } = req.params;

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      referrer: { select: { id: true, name: true, email: true } },
      referee: { select: { id: true, name: true, email: true } }
    }
  });

  if (!referral) {
    return res.status(404).json({ error: 'Referral not found' });
  }

  res.json({ data: { referral } });
}

// Update referral (admin - add commission, change status)
async function updateReferral(req, res) {
  const { id } = req.params;
  const { referralStatus, commissionAmount, orderId, notes } = req.body;

  const referral = await prisma.referral.findUnique({ where: { id } });
  if (!referral) {
    return res.status(404).json({ error: 'Referral not found' });
  }

  const updateData = {};
  if (referralStatus) updateData.referralStatus = referralStatus;
  if (commissionAmount !== undefined) updateData.commissionAmount = commissionAmount;
  if (orderId) updateData.orderId = orderId;
  if (notes) updateData.notes = notes;

  const updatedReferral = await prisma.referral.update({
    where: { id },
    data: updateData,
    include: {
      referrer: { select: { id: true, name: true, email: true } },
      referee: { select: { id: true, name: true, email: true } }
    }
  });

  res.json({ data: { referral: updatedReferral }, message: 'Referral updated successfully' });
}

// Get referral stats (admin dashboard)
async function getReferralStats(req, res) {
  const stats = await prisma.referral.groupBy({
    by: ['referralStatus'],
    _count: { id: true },
    _sum: { commissionAmount: true }
  });

  const allReferrals = await prisma.referral.findMany();
  const totalCommission = allReferrals.reduce((sum, ref) => sum + (ref.commissionAmount || 0), 0);

  res.json({ 
    data: { 
      stats,
      totalCommission,
      totalReferrals: allReferrals.length
    } 
  });
}

// ────────────────────────────────────────────────────────────────────
// VERIFY REFERRAL - Admin verifies referral based on email or phone
// ────────────────────────────────────────────────────────────────────
async function verifyReferral(req, res) {
  try {
    const { referralId, verifiedUserId } = req.body;

    if (!referralId || !verifiedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Referral ID and verified user ID are required',
      });
    }

    // Find referral
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    // Update referral status to active/verified
    const updatedReferral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        refereeId: verifiedUserId,
        referralStatus: 'active',
        updatedAt: new Date(),
      },
      include: {
        referrer: {
          select: { id: true, name: true, email: true },
        },
        referee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Award points to referrer
    const pointsToAward = 500; // Default points for referral verification
    await prisma.user.update({
      where: { id: updatedReferral.referrerId },
      data: {
        points_wallet: {
          increment: pointsToAward,
        },
      },
    });

    // Create points history record
    await prisma.pointsHistory.create({
      data: {
        userId: updatedReferral.referrerId,
        type: 'credit',
        points: pointsToAward,
        reason: 'referral',
        description: `Referral verified for ${updatedReferral.referee?.name}`,
        referenceId: referralId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Referral verified successfully',
      data: {
        referral: updatedReferral,
        pointsAwarded: pointsToAward,
      },
    });
  } catch (error) {
    console.error('Verify referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify referral',
      error: error.message,
    });
  }
}

module.exports = {
  createReferral,
  getUserReferrals,
  getAllReferrals,
  getReferral,
  updateReferral,
  getReferralStats,
  verifyReferral,
};
