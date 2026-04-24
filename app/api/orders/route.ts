// API Route: Orders Management
// Endpoint: /api/orders
// Methods: GET (list), POST (create)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/orders
 * List all orders for authenticated user
 * Required: Bearer token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID' },
        { status: 401 }
      );
    }

    // Fetch user's orders with service details
    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      status: 'success',
      data: {
        orders,
        total: orders.length,
      },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 * Body: { serviceId: number }
 * Required: Bearer token in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - no user ID' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceId } = body;

    // Validate input
    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    // Check if service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        { error: 'Service is not available' },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        serviceId: service.id,
        amount: service.price,
        discountAmount: 0,
        finalAmount: service.price,
        orderNo: `ORD-${Date.now()}`,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Order created successfully',
        data: {
          order,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}


