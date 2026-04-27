// Payment Service - Handles payment operations and Razorpay integration
import prisma from '../utils/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Create a payment order
 */
export async function createPaymentOrder(userId: string, amount: number, planId?: string) {
  try {
    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        planId,
      },
    });

    // Create Order in DB
    const order = await prisma.order.create({
      data: {
        customerId: userId,
        planId,
        amount,
        finalPrice: amount,
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
    });

    return {
      success: true,
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    };
  } catch (error: any) {
    console.error('Payment order creation failed:', error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    // Create HMAC signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    // Verify signature
    if (expectedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    // Fetch payment from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);

    return {
      valid: true,
      payment,
    };
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
}

/**
 * Complete payment - Update order and process referral
 */
export async function completePayment(
  orderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify signature
    await verifyPaymentSignature(order.razorpayOrderId!, razorpayPaymentId, razorpaySignature);

    // Update order as paid
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'completed',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
        paymentVerifiedAt: new Date(),
      },
    });

    // Process referral commission if applicable
    if (order.referralId) {
      await creditReferralCommission(order.referralId, orderId, order.amount);
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: order.customerId,
        amount: order.amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        razorpayOrderId: order.razorpayOrderId!,
        razorpayPaymentId,
        status: 'completed',
        paymentType: 'premium',
        paidAt: new Date(),
      },
    });

    return {
      success: true,
      order: updatedOrder,
    };
  } catch (error: any) {
    console.error('Payment completion failed:', error);

    // Update order as failed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'failed' },
    }).catch(console.error);

    throw error;
  }
}

/**
 * Credit referral commission to referrer's wallet
 */
async function creditReferralCommission(referralId: string, orderId: string, orderAmount: number) {
  try {
    // Get referral details
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      console.warn(`Referral ${referralId} not found`);
      return;
    }

    // Calculate commission (₹200 flat)
    const commission = 200;

    // Get or create referrer's wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: referral.referrerId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: referral.referrerId,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      });
    }

    // Credit wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + commission,
        totalEarned: wallet.totalEarned + commission,
      },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: commission,
        type: 'credit',
        description: `Referral commission for order ${orderId}`,
        referenceId: orderId,
        status: 'completed',
      },
    });

    // Update referral status
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        commissionAmount: commission,
        referralStatus: 'completed',
        orderId,
      },
    });

    console.log(`Credited ₹${commission} to user ${referral.referrerId}`);
  } catch (error) {
    console.error('Referral commission credit failed:', error);
    // Don't throw - payment is already complete
  }
}

/**
 * Get payment history for user
 */
export async function getPaymentHistory(userId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  } catch (error: any) {
    throw new Error(`Failed to fetch payment history: ${error.message}`);
  }
}

/**
 * Handle webhook from Razorpay
 */
export async function handleWebhook(event: any) {
  try {
    if (event.event === 'payment.authorized') {
      const payment = event.payload.payment.entity;
      console.log('Payment authorized:', payment.id);
      // You can implement additional logic here
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      console.log('Payment failed:', payment.id);
      // Update order status to failed
      await prisma.order.updateMany({
        where: { razorpayPaymentId: payment.id },
        data: { status: 'failed' },
      });
    }
    return { received: true };
  } catch (error: any) {
    console.error('Webhook handling failed:', error);
    throw error;
  }
}

export default {
  createPaymentOrder,
  verifyPaymentSignature,
  completePayment,
  getPaymentHistory,
  handleWebhook,
};
