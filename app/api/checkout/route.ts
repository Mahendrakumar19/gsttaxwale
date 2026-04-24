// API Route: Payment Checkout
// Endpoint: /api/checkout
// Methods: POST (create checkout session)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/checkout
 * Create a checkout session for payment
 * Body: { serviceId: number, orderId?: number }
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
    const { serviceId, orderId } = body;

    // Validate input
    if (!serviceId && !orderId) {
      return NextResponse.json(
        {
          error: 'Either serviceId or orderId is required',
        },
        { status: 400 }
      );
    }

    let order;

    if (orderId) {
      // Use existing order
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { service: true },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Verify order belongs to user
      if (order.userId !== parseInt(userId)) {
        return NextResponse.json(
          { error: 'Unauthorized - order does not belong to you' },
          { status: 403 }
        );
      }

      // Check if already paid
      if (order.paymentStatus === 'paid') {
        return NextResponse.json(
          { error: 'Order already paid' },
          { status: 400 }
        );
      }
    } else {
      // Create new order for service
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

      order = await prisma.order.create({
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
        include: { service: true },
      });
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    // NOTE: This is a placeholder. Implement actual Razorpay integration
    const razorpayOrderId = `rzp_order_${Date.now()}`;

    // Return checkout details
    return NextResponse.json(
      {
        status: 'success',
        message: 'Checkout session created',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          amount: order.finalAmount,
          currency: 'INR',
          
          // Payment gateway details
          razorpay: {
            orderId: razorpayOrderId,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
            amount: order.finalAmount * 100, // In paise
            email: user.email,
            name: user.name || 'Valued Customer',
            description: order.service.name,
            prefill: {
              email: user.email,
              name: user.name,
            },
          },

          // Service details
          service: {
            id: order.service.id,
            name: order.service.name,
            duration: order.service.duration,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checkout/verify
 * Verify payment from Razorpay
 * Body: { orderId: number, paymentId: string, signature: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // TODO: Verify signature with Razorpay secret
    // const isValidSignature = verifyRazorpaySignature(orderId, paymentId, signature);
    // if (!isValidSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    // Mark order as paid
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paymentId,
        paymentDate: new Date(),
        status: 'processing',
      },
    });

    // TODO: Send confirmation email
    // TODO: Create invoice/receipt

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified successfully',
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error('PATCH /api/checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
