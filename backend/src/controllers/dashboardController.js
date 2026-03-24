// =============================================================================
// DASHBOARD CONTROLLER - Dashboard Data, Statistics, Filing Status
// =============================================================================
const prisma = require('../utils/prisma').default || require('../utils/prisma');

// ────────────────────────────────────────────────────────────────────
// GET DASHBOARD DATA - Main dashboard with current filing and statistics
// ────────────────────────────────────────────────────────────────────
async function getDashboardData(req, res) {
  try {
    const userId = req.userId;

    // Get current year filing
    const currentYear = new Date().getFullYear();
    const currentFiling = await prisma.taxFiling.findFirst({
      where: {
        userId,
        assessmentYear: currentYear.toString(),
      },
      include: {
        income: true,
        deductions: true,
        payment: true,
      },
    });

    // Get recent filings (last 5)
    const recentFilings = await prisma.taxFiling.findMany({
      where: { userId },
      include: {
        income: true,
        deductions: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get filing statistics
    const totalFilings = await prisma.taxFiling.count({ where: { userId } });
    const submittedFilings = await prisma.taxFiling.count({
      where: { userId, status: 'submitted' },
    });
    const filedFilings = await prisma.taxFiling.count({
      where: { userId, status: 'filed' },
    });
    const refundedFilings = await prisma.taxFiling.count({
      where: { userId, refundStatus: 'refunded' },
    });

    // Calculate totals
    const filingsWithTax = await prisma.taxFiling.findMany({
      where: { userId },
      select: { totalTaxPayable: true, refundAmount: true },
    });

    const totalTaxPaid = filingsWithTax.reduce((sum, f) => sum + (f.totalTaxPayable || 0), 0);
    const totalRefunds = filingsWithTax.reduce((sum, f) => sum + (f.refundAmount || 0), 0);
    const averageTaxPerFiling = totalFilings > 0 ? totalTaxPaid / totalFilings : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched',
      data: {
        currentFiling: currentFiling || null,
        recentFilings,
        statistics: {
          totalFilings,
          submittedFilings,
          filedFilings,
          refundedFilings,
          totalTaxPaid,
          totalRefunds,
          averageTaxPerFiling,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// GET FILING SUMMARY - Detailed summary of a specific filing
// ────────────────────────────────────────────────────────────────────
async function getFilingSummary(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;

    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      include: {
        user: {
          select: { name: true, email: true, pan: true },
        },
        income: true,
        deductions: true,
        documents: true,
        payment: true,
      },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Filing not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Filing summary fetched',
      data: { filing },
    });
  } catch (error) {
    console.error('Get filing summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filing summary',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// GET FILING STATISTICS - Aggregated statistics for user
// ────────────────────────────────────────────────────────────────────
async function getFilingStatistics(req, res) {
  try {
    const userId = req.userId;

    // Count by status
    const statuses = await prisma.taxFiling.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    // Count by assessment year
    const yearStats = await prisma.taxFiling.groupBy({
      by: ['assessmentYear'],
      where: { userId },
      _count: { assessmentYear: true },
      _sum: { totalTaxPayable: true, refundAmount: true },
      orderBy: { assessmentYear: 'desc' },
    });

    // Overall statistics
    const totalFilings = await prisma.taxFiling.count({ where: { userId } });
    const totalTaxPaid = await prisma.taxFiling.aggregate({
      where: { userId },
      _sum: { totalTaxPayable: true },
    });

    const totalRefunds = await prisma.taxFiling.aggregate({
      where: { userId },
      _sum: { refundAmount: true },
    });

    res.status(200).json({
      success: true,
      message: 'Filing statistics fetched',
      data: {
        totalFilings,
        statusBreakdown: Object.fromEntries(
          statuses.map((s) => [s.status, s._count.status])
        ),
        yearWiseStats: yearStats.map((y) => ({
          year: y.assessmentYear,
          count: y._count.assessmentYear,
          totalTax: y._sum.totalTaxPayable || 0,
          totalRefund: y._sum.refundAmount || 0,
        })),
        totalTaxPaid: totalTaxPaid._sum.totalTaxPayable || 0,
        totalRefunds: totalRefunds._sum.refundAmount || 0,
      },
    });
  } catch (error) {
    console.error('Get filing statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filing statistics',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// GET REFUND STATUS - Check refund status for a filing
// ────────────────────────────────────────────────────────────────────
async function getRefundStatus(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;

    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      select: {
        id: true,
        assessmentYear: true,
        refundStatus: true,
        refundAmount: true,
        totalTaxPayable: true,
        filedAt: true,
      },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Filing not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Refund status fetched',
      data: {
        filing: {
          ...filing,
          refundEligible: filing.refundAmount && filing.refundAmount > 0,
          daysToRefund: filing.refundStatus === 'refunded'
            ? 0
            : filing.refundStatus === 'processing'
              ? 120
              : 180,
        },
      },
    });
  } catch (error) {
    console.error('Get refund status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund status',
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardData,
  getFilingSummary,
  getFilingStatistics,
  getRefundStatus,
};
