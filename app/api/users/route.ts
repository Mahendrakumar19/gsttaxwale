import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mark as dynamic route since it uses request.headers
export const dynamic = 'force-dynamic';

/**
 * GET: Fetch user profile (requires JWT token)
 * PUT: Update user profile
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get userId from header or verify JWT
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: body.name,
        // Add other fields as needed
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
