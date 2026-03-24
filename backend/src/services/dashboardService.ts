// =============================================================================
// DASHBOARD SERVICE - User dashboard and filing status
// =============================================================================

import prisma from '../utils/prisma';

export interface DashboardData {
  currentYear: number;
  filingStatus: string;
  refundStatus: string;
  taxPayable: number;
  refundAmount: number;
  latestFiling: any;
  previousFilings: any[];
  noticeCount: number;
}

/**
 * Get user's dashboard data
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const currentYear = new Date().getFullYear();
  const assessmentYear = currentYear + 1;

  // Get current year filing
  const currentFiling = await prisma.taxFiling.findUnique({
    where: {
      userId_assessmentYear: {
        userId,
        assessmentYear
      }
    }
  });

  // Get previous filings
  const previousFilings = await prisma.taxFiling.findMany({
    where: { userId },
    orderBy: { assessmentYear: 'desc' },
    take: 5
  });

  return {
    currentYear,
    filingStatus: currentFiling?.status || 'not-started',
    refundStatus: currentFiling?.refund ? 'pending' : 'none',
    taxPayable: currentFiling?.totalTaxPayable || 0,
    refundAmount: currentFiling?.refund || 0,
    latestFiling: currentFiling,
    previousFilings,
    noticeCount: 0
  };
}

/**
 * Get filing summary
 */
export async function getFilingSummary(userId: string, filingId: string): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId },
    include: {
      incomes: true,
      deductions: true,
      documents: true
    }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  return filing;
}

/**
 * Get all filings for a user
 */
export async function getUserFilings(userId: string): Promise<any[]> {
  return prisma.taxFiling.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileName: true,
          uploadedAt: true
        }
      }
    }
  });
}

/**
 * Get filing statistics for dashboard
 */
export async function getFilingStatistics(userId: string): Promise<any> {
  const filings = await prisma.taxFiling.findMany({
    where: { userId }
  });

  const totalFilings = filings.length;
  const submittedFilings = filings.filter(f => f.status === 'submitted').length;
  const filedFilings = filings.filter(f => f.status === 'filed').length;
  const refundedFilings = filings.filter(f => f.status === 'refunded').length;

  const totalTaxPaid = filings.reduce((sum, f) => sum + f.totalTaxPayable, 0);
  const totalRefunds = filings.reduce((sum, f) => sum + f.refund, 0);

  return {
    totalFilings,
    submittedFilings,
    filedFilings,
    refundedFilings,
    totalTaxPaid,
    totalRefunds,
    averageTaxPerFiling: totalFilings > 0 ? totalTaxPaid / totalFilings : 0
  };
}

export default {
  getDashboardData,
  getFilingSummary,
  getUserFilings,
  getFilingStatistics
};
