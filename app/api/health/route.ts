import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'OK',
    service: 'tax-platform-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
