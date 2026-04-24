// Middleware for JWT authentication
// Place this file at: middleware.ts (in the root, next to package.json)
// This file runs before every request to protected routes

import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const protectedRoutes = [
    '/api/users',
    '/api/orders',
    '/api/documents',
    '/api/checkout',
    '/api/subscription',
    '/dashboard',
    '/account',
    '/profile',
    '/admin',
  ];

  // Check if current route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    // Route doesn't need authentication, continue
    return NextResponse.next();
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - missing token' },
      { status: 401 }
    );
  }

  // Extract token
  const token = authHeader.slice(7);

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Token is valid - add user info to request headers
    // This makes it available in API routes via: request.headers.get('x-user-id')
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(decoded.userId || decoded.sub));
    requestHeaders.set('x-user-email', decoded.email || '');

    // Continue to next middleware/route
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);

    // Token is invalid or expired
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    // Apply to all /api routes except auth and health
    '/api/:path((?!auth|health).*)',
    // Apply to dashboard and account pages
    '/dashboard/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
