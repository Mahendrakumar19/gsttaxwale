import { NextRequest, NextResponse } from 'next/server';

export interface DueDate {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  filingType: 'GSTR-1' | 'GSTR-2' | 'GSTR-3B' | 'GSTR-9' | 'ITR' | 'TDS' | 'other';
  status: 'upcoming' | 'due-soon' | 'overdue';
  frequency?: string;
  url?: string;
}

// Mock due dates data - replace with database query in production
const MOCK_DUE_DATES: DueDate[] = [
  {
    id: '1',
    title: 'GSTR-3B Filing',
    description: 'File GSTR-3B for March 2026 (Monthly filing)',
    dueDate: '2026-04-20',
    filingType: 'GSTR-3B',
    status: 'upcoming',
    frequency: 'Monthly (20th of next month)',
  },
  {
    id: '2',
    title: 'GSTR-1 Filing',
    description: 'File GSTR-1 for March 2026 (Outward supplies)',
    dueDate: '2026-04-11',
    filingType: 'GSTR-1',
    status: 'upcoming',
    frequency: 'Monthly (11th of next month)',
  },
  {
    id: '3',
    title: 'GSTR-2A Reconciliation',
    description: 'Reconcile your GSTR-2A with supplier invoices',
    dueDate: '2026-04-25',
    filingType: 'GSTR-2',
    status: 'upcoming',
    frequency: 'Monthly',
  },
  {
    id: '4',
    title: 'Annual Return (GSTR-9)',
    description: 'File GSTR-9 for FY 2025-26 (Annual return)',
    dueDate: '2026-06-30',
    filingType: 'GSTR-9',
    status: 'upcoming',
    frequency: 'Annual (June 30)',
  },
  {
    id: '5',
    title: 'ITC Reconciliation (GSTR-2B)',
    description: 'Review and reconcile input tax credit from GSTR-2B',
    dueDate: '2026-05-31',
    filingType: 'GSTR-2',
    status: 'upcoming',
    frequency: 'Monthly/As required',
  },
  {
    id: '6',
    title: 'TDS/TCS Filing',
    description: 'File TDS/TCS returns for March quarter 2026',
    dueDate: '2026-04-30',
    filingType: 'TDS',
    status: 'upcoming',
    frequency: 'Quarterly',
  },
  {
    id: '7',
    title: 'Income Tax Return (ITR)',
    description: 'File ITR for FY 2025-26',
    dueDate: '2026-07-31',
    filingType: 'ITR',
    status: 'upcoming',
    frequency: 'Annual (July 31)',
  },
];

/**
 * GET /api/due-dates
 * Fetch upcoming due dates and deadlines
 * Query params:
 * - limit: number (default: 6)
 * - filingType: 'GSTR-1' | 'GSTR-2' | 'GSTR-3B' | 'GSTR-9' | 'ITR' | 'TDS' | 'other'
 * - status: 'upcoming' | 'due-soon' | 'overdue'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const filingType = searchParams.get('filingType');
    const status = searchParams.get('status');

    let dueDates = [...MOCK_DUE_DATES];

    // Filter by filing type if provided
    if (filingType) {
      dueDates = dueDates.filter((item) => item.filingType === filingType);
    }

    // Filter by status if provided
    if (status && ['upcoming', 'due-soon', 'overdue'].includes(status)) {
      dueDates = dueDates.filter((item) => item.status === status);
    }

    // Sort by due date (earliest first)
    dueDates.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Limit results
    const limited = dueDates.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        dueDates: limited,
        total: limited.length,
      },
    });
  } catch (error) {
    console.error('Error fetching due dates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch due dates' },
      { status: 500 }
    );
  }
}
