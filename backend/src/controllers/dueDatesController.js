// =============================================================================
// DUE DATES CONTROLLER - Fetch GST and ITR due dates from official sources
// =============================================================================

const { successResponse, errorResponse } = require('../utils/helpers');

// Mock data for GST and ITR due dates
// In production, this should be fetched from official sources
const GST_DUE_DATES = [
  {
    id: 'gst-1',
    title: 'GSTR-1 Filing',
    name: 'GSTR-1 (Outward Supplies)',
    description: 'Return for outward supplies of goods and services',
    deadline: 'On or before the 11th of the next month',
    lateFee: '₹50-100 per day (Max ₹5,000)',
    filingType: 'GSTR-1',
    frequency: 'Monthly (11th of next month)',
    type: 'gst',
  },
  {
    id: 'gst-2',
    title: 'GSTR-2A Reconciliation',
    name: 'GSTR-2A (Inward Supplies - Auto-populated)',
    description: 'Auto-populated from supplier GSTR-1 filings',
    deadline: 'Generated automatically on 12th of next month',
    lateFee: 'N/A',
    filingType: 'GSTR-2A',
    frequency: 'Monthly (12th of next month)',
    type: 'gst',
  },
  {
    id: 'gst-3',
    title: 'GSTR-3B Filing',
    name: 'GSTR-3B (Summary Return)',
    description: 'Monthly summary of sales, purchases, and taxes',
    deadline: 'On or before the 22nd of the next month',
    lateFee: '₹50-100 per day (Max ₹5,000)',
    filingType: 'GSTR-3B',
    frequency: 'Monthly (22nd of next month)',
    type: 'gst',
  },
  {
    id: 'gst-4',
    title: 'GSTR-9 Annual Return',
    name: 'GSTR-9 (Annual Return)',
    description: 'Annual reconciliation return for the financial year',
    deadline: '31st December (of the following year)',
    lateFee: '₹100 per day (Max ₹25,000)',
    filingType: 'GSTR-9',
    frequency: 'Annual (31st December)',
    type: 'gst',
  },
];

const ITR_DUE_DATES = [
  {
    id: 'itr-1',
    title: 'Individual ITR (Non-Resident/Salaried)',
    name: 'Individual ITR (Non-Resident/Salaried)',
    description: 'Income Tax Return for individuals with only salary and other income',
    deadline: 'On or before 31st July',
    extendedDeadline: '30th November (with late fee)',
    filingType: 'ITR-1/ITR-4',
    frequency: 'Annual (31st July)',
    type: 'itr',
  },
  {
    id: 'itr-2',
    title: 'ITR (With Business/Professional Income)',
    name: 'ITR (With Business/Professional Income)',
    description: 'Income Tax Return for individuals carrying on business or profession',
    deadline: 'On or before 30th September',
    extendedDeadline: '31st December (with late fee)',
    filingType: 'ITR-2/ITR-3',
    frequency: 'Annual (30th September)',
    type: 'itr',
  },
  {
    id: 'itr-3',
    title: 'Company ITR',
    name: 'Company ITR',
    description: 'Income Tax Return for companies',
    deadline: 'On or before 30th September',
    extendedDeadline: '31st December (with late fee)',
    filingType: 'Company-ITR',
    frequency: 'Annual (30th September)',
    type: 'itr',
  },
  {
    id: 'itr-4',
    title: 'Partnership Firm ITR',
    name: 'Partnership Firm ITR',
    description: 'Income Tax Return for partnership firms',
    deadline: 'On or before 30th September',
    extendedDeadline: '31st December (with late fee)',
    filingType: 'Partnership-ITR',
    frequency: 'Annual (30th September)',
    type: 'itr',
  },
];

/**
 * Helper function to calculate next due date based on deadline pattern
 */
function calculateNextDueDate(item) {
  const today = new Date();
  const year = today.getFullYear();
  let dueDate;

  if (item.filingType.includes('ITR')) {
    // ITR deadlines
    if (item.filingType === 'ITR-1/ITR-4') {
      // July 31 for individual non-residents
      dueDate = new Date(year, 6, 31);
    } else {
      // September 30 for business owners and companies
      dueDate = new Date(year, 8, 30);
    }
  } else {
    // GST deadlines - monthly returns
    const nextMonth = new Date(year, today.getMonth() + 1, 1);

    if (item.filingType === 'GSTR-1' || item.filingType === 'GSTR-2A') {
      if (item.filingType === 'GSTR-1') {
        dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 11);
      } else {
        dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 12);
      }
    } else if (item.filingType === 'GSTR-3B') {
      dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 22);
    } else if (item.filingType === 'GSTR-9') {
      // December 31
      dueDate = new Date(year, 11, 31);
    }
  }

  // If due date is in the past, move to next year/period
  if (dueDate < today) {
    if (item.filingType.includes('ITR')) {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    } else {
      // For monthly GST returns, calculate next month
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
      const day = parseInt(item.deadline.match(/\d+/)[0]);
      dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
    }
  }

  return dueDate;
}

/**
 * Format data for response
 */
function formatDueDate(item) {
  const dueDate = calculateNextDueDate(item);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status = 'upcoming';
  if (daysUntil < 0) status = 'overdue';
  else if (daysUntil <= 7) status = 'due-soon';

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    dueDate: dueDate.toISOString(),
    filingType: item.filingType,
    status,
    frequency: item.frequency,
    deadline: item.deadline,
    lateFee: item.lateFee,
    type: item.type,
  };
}

/**
 * Get all due dates - GST and ITR
 */
async function getDueDates(req, res) {
  try {
    const { limit = 10, type = 'all' } = req.query;

    let dueDates = [];

    // Combine and format data
    if (type === 'gst' || type === 'all') {
      dueDates = [...dueDates, ...GST_DUE_DATES.map(formatDueDate)];
    }

    if (type === 'itr' || type === 'all') {
      dueDates = [...dueDates, ...ITR_DUE_DATES.map(formatDueDate)];
    }

    // Sort by days until due (upcoming first)
    dueDates.sort((a, b) => {
      const aDays = Math.floor((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const bDays = Math.floor((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return aDays - bDays;
    });

    // Apply limit
    if (limit && limit > 0) {
      dueDates = dueDates.slice(0, parseInt(limit));
    }

    console.log(`✅ Fetched ${dueDates.length} due dates`);

    return res.status(200).json({
      success: true,
      data: {
        dueDates,
        total: dueDates.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching due dates:', error);
    return res.status(500).json(errorResponse('Failed to fetch due dates'));
  }
}

/**
 * Get GST due dates
 */
async function getGSTDueDates(req, res) {
  try {
    const { limit = 10 } = req.query;

    let dueDates = GST_DUE_DATES.map(formatDueDate);

    // Sort by days until due
    dueDates.sort((a, b) => {
      const aDays = Math.floor((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const bDays = Math.floor((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return aDays - bDays;
    });

    if (limit && limit > 0) {
      dueDates = dueDates.slice(0, parseInt(limit));
    }

    console.log(`✅ Fetched ${dueDates.length} GST due dates`);

    return res.status(200).json({
      success: true,
      data: {
        dueDates,
        total: dueDates.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching GST due dates:', error);
    return res.status(500).json(errorResponse('Failed to fetch GST due dates'));
  }
}

/**
 * Get ITR due dates
 */
async function getITRDueDates(req, res) {
  try {
    const { limit = 10 } = req.query;

    let dueDates = ITR_DUE_DATES.map(formatDueDate);

    // Sort by days until due
    dueDates.sort((a, b) => {
      const aDays = Math.floor((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const bDays = Math.floor((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return aDays - bDays;
    });

    if (limit && limit > 0) {
      dueDates = dueDates.slice(0, parseInt(limit));
    }

    console.log(`✅ Fetched ${dueDates.length} ITR due dates`);

    return res.status(200).json({
      success: true,
      data: {
        dueDates,
        total: dueDates.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching ITR due dates:', error);
    return res.status(500).json(errorResponse('Failed to fetch ITR due dates'));
  }
}

module.exports = {
  getDueDates,
  getGSTDueDates,
  getITRDueDates,
};
