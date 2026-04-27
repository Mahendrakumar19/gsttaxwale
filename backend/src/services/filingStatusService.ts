// Filing Status Service - Manages filing status and deadlines
import prisma from '../utils/prisma';

// Deadline mappings
const FILING_DEADLINES = {
  GST: {
    GSTR1: { day: 20, month: 'next', label: 'GSTR-1 Filing Deadline' },
    GSTR3B: { day: 22, month: 'next', label: 'GSTR-3B Filing Deadline' },
    GSTR9: { day: 31, month: 12, label: 'GSTR-9 Annual Return' },
  },
  ITR: {
    ITR: { day: 30, month: 6, label: 'ITR Filing with Extension' },
    ITRWithCA: { day: 31, month: 7, label: 'ITR Filing with CA' },
  },
};

/**
 * Get filing deadlines for user
 */
export async function getDeadlines(userId: string) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const deadlines = [
      {
        type: 'GST - GSTR-1',
        date: getNextDeadline(20),
        daysUntil: getdayUntilDeadline(20),
        priority: 'high',
        status: 'pending',
        description: 'GSTR-1 monthly filing on 20th',
      },
      {
        type: 'GST - GSTR-3B',
        date: getNextDeadline(22),
        daysUntil: getDayUntilDeadline(22),
        priority: 'high',
        status: 'pending',
        description: 'GSTR-3B monthly filing on 22nd',
      },
      {
        type: 'ITR - Annual Filing',
        date: new Date(currentYear, 5, 30), // June 30
        daysUntil: getDayUntilDeadline(new Date(currentYear, 5, 30)),
        priority: 'medium',
        status: 'pending',
        description: 'Income Tax Return annual filing',
      },
    ];

    return deadlines.filter((d) => d.daysUntil > -30); // Show upcoming or recent deadlines
  } catch (error: any) {
    throw new Error(`Failed to get deadlines: ${error.message}`);
  }
}

/**
 * Get next deadline day of month
 */
function getNextDeadline(dayOfMonth: number) {
  const now = new Date();
  let deadline = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

  if (deadline < now) {
    deadline = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }

  return deadline;
}

/**
 * Get days until deadline
 */
function getDayUntilDeadline(dayOfMonth: number | Date) {
  const now = new Date();
  let targetDate: Date;

  if (typeof dayOfMonth === 'number') {
    targetDate = getNextDeadline(dayOfMonth);
  } else {
    targetDate = dayOfMonth;
  }

  const difference = targetDate.getTime() - now.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

/**
 * Get filing status for user
 */
export async function getFilingStatus(userId: string, assessmentYear?: number) {
  try {
    const query: any = { userId };
    if (assessmentYear) {
      query.assessmentYear = assessmentYear;
    }

    const filings = await prisma.taxFiling.findMany({
      where: query,
      orderBy: { assessmentYear: 'desc' },
      select: {
        id: true,
        assessmentYear: true,
        itrType: true,
        status: true,
        filingStatusAdmin: true,
        adminNotes: true,
        deadlineDate: true,
        submittedAt: true,
        filedAt: true,
      },
    });

    return filings.map((f) => ({
      ...f,
      deadline: f.deadlineDate,
    }));
  } catch (error: any) {
    throw new Error(`Failed to get filing status: ${error.message}`);
  }
}

/**
 * Set filing status (admin only)
 */
export async function setFilingStatus(
  taxFilingId: string,
  status: string,
  notes?: string,
  adminId?: string,
  deadline?: Date
) {
  try {
    const updated = await prisma.taxFiling.update({
      where: { id: taxFilingId },
      data: {
        filingStatusAdmin: status,
        adminNotes: notes,
        lastUpdatedBy: adminId,
        deadlineDate: deadline,
        reminderSent: false,
      },
    });

    return updated;
  } catch (error: any) {
    throw new Error(`Failed to set filing status: ${error.message}`);
  }
}

/**
 * Get filings needing reminder
 */
export async function getFilingsNeedingReminder() {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get filings with deadline approaching (within 7 days)
    const filings = await prisma.taxFiling.findMany({
      where: {
        deadlineDate: {
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          gte: now,
        },
        reminderSent: false,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return filings;
  } catch (error: any) {
    throw new Error(`Failed to get filings needing reminder: ${error.message}`);
  }
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(taxFilingId: string) {
  try {
    return await prisma.taxFiling.update({
      where: { id: taxFilingId },
      data: { reminderSent: true },
    });
  } catch (error: any) {
    throw new Error(`Failed to mark reminder sent: ${error.message}`);
  }
}

/**
 * Get filing timeline for user
 */
export async function getFilingTimeline(userId: string) {
  try {
    const filings = await prisma.taxFiling.findMany({
      where: { userId },
      orderBy: { assessmentYear: 'desc' },
      take: 5,
      select: {
        id: true,
        assessmentYear: true,
        itrType: true,
        status: true,
        filingStatusAdmin: true,
        createdAt: true,
        submittedAt: true,
        filedAt: true,
        totalTaxPayable: true,
        refund: true,
      },
    });

    return filings.map((f) => ({
      year: f.assessmentYear,
      type: f.itrType,
      status: f.filingStatusAdmin || f.status,
      created: f.createdAt,
      submitted: f.submittedAt,
      filed: f.filedAt,
      taxPayable: f.totalTaxPayable,
      refund: f.refund,
    }));
  } catch (error: any) {
    throw new Error(`Failed to get filing timeline: ${error.message}`);
  }
}

export default {
  getDeadlines,
  getFilingStatus,
  setFilingStatus,
  getFilingsNeedingReminder,
  markReminderSent,
  getFilingTimeline,
};
