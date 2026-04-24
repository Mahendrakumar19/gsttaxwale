// Payment Controller - Handles payment-related API endpoints
import { Request, Response } from 'express';
import * as paymentService from '../services/paymentService';
import * as walletService from '../services/walletService';

/**
 * Create payment order
 * POST /api/payments/create
 */
export async function createPaymentOrder(req: Request, res: Response) {
  try {
    const { amount, planId, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment order
    const order = await paymentService.createPaymentOrder(userId, amount, planId);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create payment order',
    });
  }
}

/**
 * Verify and complete payment
 * POST /api/payments/verify
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const isValidSignature = paymentService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Complete payment (includes referral credit)
    const completedOrder = await paymentService.completePayment(orderId, paymentId, signature);

    res.json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: {
        orderId: completedOrder.id,
        status: completedOrder.status,
        paidAt: completedOrder.paidAt,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: error.message || 'Failed to verify payment',
    });
  }
}

/**
 * Get payment history
 * GET /api/payments/history
 */
export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payments = await paymentService.getPaymentHistory(userId);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get payment history',
    });
  }
}

/**
 * Get payment status
 * GET /api/payments/:orderId
 */
export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payment = await paymentService.getPaymentOrder(orderId);

    if (!payment || payment.customerId !== userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: {
        orderId: payment.id,
        status: payment.status,
        amount: payment.finalPrice,
        razorpayOrderId: payment.razorpayOrderId,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get payment status',
    });
  }
}

/**
 * Apply wallet credit to order
 * POST /api/payments/:orderId/apply-wallet
 */
export async function applyWalletCredit(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get order to verify ownership
    const payment = await paymentService.getPaymentOrder(orderId);
    if (!payment || payment.customerId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Apply wallet credit
    const updated = await walletService.applyCredit(userId, orderId, amount);

    res.json({
      success: true,
      message: 'Wallet credit applied',
      data: {
        orderId,
        appliedAmount: amount,
        newTotal: updated.finalPrice,
      },
    });
  } catch (error: any) {
    console.error('Apply wallet credit error:', error);
    res.status(500).json({
      error: error.message || 'Failed to apply wallet credit',
    });
  }
}

/**
 * Refund order
 * POST /api/payments/:orderId/refund (admin)
 */
export async function refundOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Initiate refund
    const refundResult = await paymentService.initiateRefund(orderId, reason, adminId);

    res.json({
      success: true,
      message: 'Refund initiated',
      data: refundResult,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process refund',
    });
  }
}

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentStatus,
  applyWalletCredit,
  refundOrder,
};
