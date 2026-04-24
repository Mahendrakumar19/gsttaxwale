// ════════════════════════════════════════════════════════════════════════════
// BACKEND CONTROLLER EXTENSIONS - GST Dashboard
// Location: d:\tax\backend\src\controllers\dashboardController.js
//
// ADD THESE FUNCTIONS to the existing dashboardController.js file
// These functions will be new endpoints for the upgraded dashboard
// ════════════════════════════════════════════════════════════════════════════

const prisma = require('../utils/prisma').default || require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

// ────────────────────────────────────────────────────────────────────────────
// 1. GET USER'S GST PLAN
// ────────────────────────────────────────────────────────────────────────────
/**
 * Fetch user's current GST subscription plan
 * GET /api/dashboard/plan
 * 
 * Returns: Plan details, status, features, renewal info
 */
async function getPlan(req, res) {
  try {
    const userId = req.userId;

    const gstPlan = await prisma.gSTPlan.findUnique({
      where: { userId },
      select: {
        id: true,
        planName: true,
        planType: true,
        validity: true,
        status: true,
        monthlyCost: true,
        features: {
          autoReminders: true,
          caAccess: true,
          prioritySupport: true,
          gstFilingLimit: true,
          itrFilingLimit: true,
          documentLimit: true
        },
        startDate: true,
        renewalDate: true,
        supportLevel: true
      }
    });

    if (!gstPlan) {
      // User has no plan - return default or suggest purchase
      return res.status(200).json(
        successResponse(
          { 
            plan: null,
            message: 'No active plan. Consider upgrading.'
          },
          'No active plan found'
        )
      );
    }

    // Check if plan is expired
    const isExpired = new Date(gstPlan.validity) < new Date();
    if (isExpired && gstPlan.status === 'active') {
      // Auto-update expired status
      await prisma.gSTPlan.update({
        where: { userId },
        data: { status: 'expired' }
      });
      gstPlan.status = 'expired';
    }

    res.status(200).json(
      successResponse({ plan: gstPlan }, 'Plan details retrieved')
    );
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 2. GET FILING STATUS (User's View)
// ────────────────────────────────────────────────────────────────────────────
/**
 * Fetch user's filing status (GST/ITR)
 * GET /api/dashboard/filings?type=gst&period=monthly
 * 
 * Returns: List of filings with admin-controlled status
 */
async function getFilings(req, res) {
  try {
    const userId = req.userId;
    const { type = 'gst', period = 'monthly' } = req.query;

    // Build where clause
    const whereClause = {
      userId,
      filingType: type // 'gst', 'itr', 'gstr1', 'gstr3b', etc.
    };

    if (period) {
      whereClause.filingPeriod = period; // 'monthly', 'quarterly', 'annual'
    }

    const filings = await prisma.taxFiling.findMany({
      where: whereClause,
      select: {
        id: true,
        filingType: true,
        periodMonth: true,
        filingPeriod: true,
        adminStatus: true,
        dueDate: true,
        filedDate: true,
        referenceNumber: true,
        statusUpdatedAt: true,
        remarks: true
      },
      orderBy: { dueDate: 'desc' }
    });

    // Calculate summary
    const summary = {
      total: filings.length,
      pending: filings.filter(f => f.adminStatus === 'pending').length,
      in_progress: filings.filter(f => f.adminStatus === 'in_progress').length,
      filed: filings.filter(f => f.adminStatus === 'filed').length,
      rejected: filings.filter(f => f.adminStatus === 'rejected').length
    };

    res.status(200).json(
      successResponse(
        { filings, summary },
        'Filings retrieved'
      )
    );
  } catch (error) {
    console.error('Get filings error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 3. GET UPCOMING DEADLINES
// ────────────────────────────────────────────────────────────────────────────
/**
 * Calculate and return upcoming filing deadlines
 * GET /api/dashboard/deadlines
 * 
 * Returns: Sorted list of upcoming deadlines with priority
 */
async function getDeadlines(req, res) {
  try {
    const userId = req.userId;

    // Get filings with upcoming deadlines
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingFilings = await prisma.taxFiling.findMany({
      where: {
        userId,
        dueDate: {
          gte: now,
          lte: thirtyDaysFromNow
        },
        adminStatus: {
          not: 'filed'
        }
      },
      select: {
        id: true,
        filingType: true,
        dueDate: true,
        adminStatus: true,
        periodMonth: true
      },
      orderBy: { dueDate: 'asc' }
    });

    // Add additional info and calculate priority
    const deadlines = upcomingFilings.map(filing => {
      const daysRemaining = Math.ceil(
        (new Date(filing.dueDate) - now) / (1000 * 60 * 60 * 24)
      );

      return {
        id: filing.id,
        title: getFilingTitle(filing.filingType, filing.periodMonth),
        dueDate: filing.dueDate,
        filingType: filing.filingType,
        status: filing.adminStatus,
        daysRemaining,
        priority: daysRemaining <= 3 ? 'high' : daysRemaining <= 7 ? 'medium' : 'low'
      };
    });

    res.status(200).json(
      successResponse(
        { upcomingDeadlines: deadlines },
        'Deadlines retrieved'
      )
    );
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 4. GET DOCUMENTS
// ────────────────────────────────────────────────────────────────────────────
/**
 * Fetch user's documents (uploaded by admin)
 * GET /api/dashboard/documents?type=gst
 * 
 * Returns: List of documents with download/view URLs
 */
async function getDocuments(req, res) {
  try {
    const userId = req.userId;
    const { type } = req.query; // Optional type filter

    const whereClause = { userId };
    if (type) {
      whereClause.documentType = type; // 'gst', 'itr', 'aadhaar', 'pan', 'other'
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        fileName: true,
        documentType: true,
        fileUrl: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true,
        verificationStatus: true,
        expiryDate: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(
      successResponse(
        { documents },
        'Documents retrieved'
      )
    );
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 5. GET WALLET & REFERRAL EARNINGS
// ────────────────────────────────────────────────────────────────────────────
/**
 * Fetch user's wallet balance and referral earnings history
 * GET /api/dashboard/wallet
 * 
 * Returns: Wallet balance, total earned, earnings history
 */
async function getWallet(req, res) {
  try {
    const userId = req.userId;

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        balance: true,
        totalEarned: true,
        lastEarnedAt: true
      }
    });

    if (!wallet) {
      // Create wallet if doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0
        }
      });
      
      return res.status(200).json(
        successResponse(
          {
            wallet: {
              balance: 0,
              totalEarned: 0,
              lastEarnedAt: null,
              availableBalance: 0,
              recentEarnings: []
            }
          },
          'Empty wallet created'
        )
      );
    }

    // Get recent earnings history
    const recentEarnings = await prisma.referral.findMany({
      where: {
        referredBy: userId,
        status: 'completed'
      },
      select: {
        id: true,
        earnedAmount: true,
        earnedAt: true
      },
      orderBy: { earnedAt: 'desc' },
      take: 10
    });

    // Format earnings for display
    const earningsHistory = recentEarnings.map(earning => ({
      date: earning.earnedAt,
      amount: earning.earnedAmount,
      type: 'referral',
      description: 'Referral earning'
    }));

    res.status(200).json(
      successResponse(
        {
          wallet: {
            balance: wallet.balance,
            totalEarned: wallet.totalEarned,
            lastEarnedAt: wallet.lastEarnedAt,
            availableBalance: wallet.balance, // Can be used for purchases
            recentEarnings: earningsHistory
          }
        },
        'Wallet retrieved'
      )
    );
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Helper: Get filing title based on type and month
 */
function getFilingTitle(filingType, periodMonth) {
  const filingTitles = {
    'gst': 'GST Filing',
    'gstr1': 'GSTR-1 Filing',
    'gstr3b': 'GSTR-3B Filing',
    'gstr9c': 'GSTR-9C Filing',
    'itr': 'Income Tax Return',
    'itr1': 'ITR-1 Filing',
    'itr2': 'ITR-2 Filing'
  };

  return filingTitles[filingType] || 'Tax Filing';
}

/**
 * Helper: Check if plan is expiring soon
 */
function isExpiringsoon(validity, days = 7) {
  const now = new Date();
  const expiryDate = new Date(validity);
  const daysUntilExpiry = Math.ceil(
    (expiryDate - now) / (1000 * 24 * 60 * 60)
  );
  return daysUntilExpiry <= days;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Existing functions
  getDashboardData,
  getFilingSummary,
  getStatistics,
  getRefundStatus,
  
  // NEW functions for GST Dashboard upgrade
  getPlan,
  getFilings,
  getDeadlines,
  getDocuments,
  getWallet
};

// ════════════════════════════════════════════════════════════════════════════
// ROUTE REGISTRATION
// ════════════════════════════════════════════════════════════════════════════

/*
Add these routes to: d:\tax\backend\src\routes\api.js

// ────────────────────────────────────────────────────────────────────────────
// NEW: GST Dashboard Routes (Safe Extension)
// ────────────────────────────────────────────────────────────────────────────
router.get('/dashboard/plan', authenticate, 
  asyncHandler(dashboardController.getPlan));

router.get('/dashboard/filings', authenticate, 
  asyncHandler(dashboardController.getFilings));

router.get('/dashboard/deadlines', authenticate, 
  asyncHandler(dashboardController.getDeadlines));

router.get('/dashboard/documents', authenticate, 
  asyncHandler(dashboardController.getDocuments));

router.get('/dashboard/wallet', authenticate, 
  asyncHandler(dashboardController.getWallet));

// Existing routes remain unchanged:
// router.get('/dashboard', authenticate, ...)
// router.get('/dashboard/statistics', authenticate, ...)
// etc.
*/
