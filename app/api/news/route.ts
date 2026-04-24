import { NextRequest, NextResponse } from 'next/server';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'update' | 'news' | 'announcement' | 'alert';
  url?: string;
  source?: string;
}

// Mock news data - replace with database query in production
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'GST Rate Changes Effective April 1, 2026',
    description: 'New GST rates for specific commodities come into effect. Check the official notification for complete details.',
    date: '2026-04-01',
    category: 'announcement',
    url: 'https://www.gst.gov.in',
    source: 'GST Council',
  },
  {
    id: '2',
    title: 'GSTR-9 Annual Return Filing Extended Till June 30, 2026',
    description: 'The deadline for filing GSTR-9 annual return for FY 2025-26 has been extended to June 30, 2026.',
    date: '2026-03-15',
    category: 'update',
    url: 'https://www.gst.gov.in',
    source: 'GST India',
  },
  {
    id: '3',
    title: 'New ITC Rules for Input Tax Credit',
    description: 'Modified rules for input tax credit (ITC) eligibility have been notified. Business owners must comply by April 15.',
    date: '2026-03-10',
    category: 'alert',
    url: 'https://www.gst.gov.in',
    source: 'Ministry of Finance',
  },
  {
    id: '4',
    title: 'E-Way Bill Portal Maintenance Notice',
    description: 'The e-Way bill portal will be under maintenance for scheduled updates on March 25, 2026.',
    date: '2026-03-08',
    category: 'news',
    source: 'GST India',
  },
  {
    id: '5',
    title: 'Compliance Requirements for E-Commerce Operators',
    description: 'New compliance requirements for e-commerce operators under GST have been notified. Mandatory from April 1, 2026.',
    date: '2026-02-28',
    category: 'announcement',
    url: 'https://www.gst.gov.in',
    source: 'GST Council',
  },
];

/**
 * GET /api/news
 * Fetch latest GST news and updates
 * Query params:
 * - limit: number (default: 5)
 * - category: 'update' | 'news' | 'announcement' | 'alert'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category');

    let news = [...MOCK_NEWS];

    // Filter by category if provided
    if (category && ['update', 'news', 'announcement', 'alert'].includes(category)) {
      news = news.filter((item) => item.category === category);
    }

    // Sort by date (newest first)
    news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit results
    const limited = news.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        news: limited,
        total: limited.length,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
