import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET: Fetch all tax services
 * POST: Create new service (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        features: true,
        icon: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      data: { services },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization header (JWT)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const service = await prisma.service.create({
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        price: body.price,
        features: body.features,
        icon: body.icon,
        active: true,
      },
    });

    return NextResponse.json(
      { status: 'success', data: { service } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
