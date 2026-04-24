import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic since it accepts query parameters
export const dynamic = 'force-dynamic';

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
    title: 'GSTR-1 Filing Due Extended',
    description: 'GST returns filing deadline for March 2026 extended by 5 days to April 16',
    date: '2026-03-28',
    category: 'announcement',
    source: 'GST Portal',
    url: 'https://gst.gov.in',
  },
  {
    id: '2',
    title: 'New ITC Rate Changes Announced',
    description: 'Input Tax Credit (ITC) rules updated for specific sectors. Check GST portal for details.',
    date: '2026-03-25',
    category: 'update',
    source: 'CBIC',
    url: 'https://gst.gov.in',
  },
  {
    id: '3',
    title: 'Portal Maintenance Notice',
    description: 'GST Portal will be under maintenance on March 30 (10 PM - 6 AM). No filings can be submitted.',
    date: '2026-03-23',
    category: 'alert',
    source: 'GST Support',
  },
  {
    id: '4',
    title: 'GSTR-9 Annual Return Filing Extended',
    description: 'Annual GST return filing deadline extended to June 30, 2026 for all taxpayers',
    date: '2026-03-20',
    category: 'news',
    source: 'Government',
  },
  {
    id: '5',
    title: 'E-Commerce Rules Updated',
    description: 'New compliance requirements for e-commerce platforms effective from April 1, 2026',
    date: '2026-03-18',
    category: 'announcement',
    source: 'GST Portal',
    url: 'https://gst.gov.in',
  },
];

/**
 * GET /api/news
 * Fetch GST news and updates
 * Query params:
 * - limit: number (default: 5)
 * - category: 'update' | 'news' | 'announcement' | 'alert'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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
