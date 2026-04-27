// Webhook Routes - Razorpay webhooks and other external integrations
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import * as paymentService from '../services/paymentService';
import prisma from '../utils/prisma';

const router = Router();

/**
 * Razorpay webhook handler
 * POST /api/webhooks/razorpay
 * 
 * Razorpay sends webhook events for payment status changes
 * Signature verification ensures authenticity
 */
router.post('/razorpay', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Process webhook event
    const event = req.body;
    console.log('Razorpay webhook received:', event.event);

    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'order.paid':
        await handleOrderPaid(event);
        break;

      case 'refund.created':
        await handleRefundCreated(event);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    // Always return 200 OK to Razorpay
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Still return 200 to avoid Razorpay retries
    res.json({ received: true, error: error.message });
  }
});

/**
 * Handle payment authorized event
 */
async function handlePaymentAuthorized(event: any) {
  try {
    const payment = event.payload.payment.entity;
    const orderId = payment.notes?.orderId;

    if (!orderId) {
      console.warn('No orderId in payment notes');
      return;
    }

    console.log(`Payment authorized for order: ${orderId}`);
    // Additional processing if needed
  } catch (error) {
    console.error('Error handling payment authorized:', error);
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event: any) {
  try {
    const payment = event.payload.payment.entity;
    const orderId = payment.notes?.orderId;

    if (!orderId) {
      console.warn('No orderId in payment notes');
      return;
    }

    console.log(`Payment failed for order: ${orderId}`);
    console.log('Failure reason:', payment.error_description);

    // Update order status to failed


    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'failed',
      },
    });

    // Send notification to user
    // await sendEmailNotification(order.customerId, 'Payment Failed', ...);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(event: any) {
  try {
    const order = event.payload.order.entity;
    console.log(`Order paid: ${order.id}`);
    // Mark order as completed if needed
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

/**
 * Handle refund created event
 */
async function handleRefundCreated(event: any) {
  try {
    const refund = event.payload.refund.entity;
    console.log(`Refund created: ${refund.id}`);
    // Update refund status in database
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}

export default router;
