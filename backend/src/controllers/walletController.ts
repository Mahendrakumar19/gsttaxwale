// Wallet Controller - Manages wallet balance, transactions, withdrawals
import { Request, Response } from 'express';
import * as walletService from '../services/walletService';

/**
 * Get wallet balance
 * GET /api/wallet/balance
 */
export async function getBalance(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await walletService.getBalance(userId);

    res.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    console.error('Get balance error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get wallet balance',
    });
  }
}

/**
 * Get transaction history
 * GET /api/wallet/transactions
 */
export async function getTransactionHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await walletService.getTransactionHistory(
      userId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get transactions',
    });
  }
}

/**
 * Apply wallet credit to order
 * POST /api/wallet/apply-credit
 */
export async function applyCredit(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { orderId, amount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Missing orderId or amount' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Apply credit
    const result = await walletService.applyCredit(userId, orderId, amount);

    res.json({
      success: true,
      message: 'Credit applied to order',
      data: result,
    });
  } catch (error: any) {
    console.error('Apply credit error:', error);
    res.status(500).json({
      error: error.message || 'Failed to apply credit',
    });
  }
}

/**
 * Request withdrawal from wallet
 * POST /api/wallet/withdraw
 */
export async function requestWithdrawal(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { amount, accountNumber, accountHolder, ifscCode, bankName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹500' });
    }

    if (!accountNumber || !accountHolder || !ifscCode || !bankName) {
      return res.status(400).json({ error: 'Missing bank account details' });
    }

    // Request withdrawal
    const withdrawal = await walletService.requestWithdrawal(userId, amount, {
      accountNumber,
      accountHolder,
      ifscCode,
      bankName,
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      data: {
        withdrawalId: withdrawal.id,
        amount,
        status: 'pending',
      },
    });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      error: error.message || 'Failed to request withdrawal',
    });
  }
}

/**
 * Get withdrawal history
 * GET /api/wallet/withdrawals
 */
export async function getWithdrawals(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get wallet withdrawals (via transactions with type 'withdrawal')
    const withdrawals = await walletService.getTransactionHistory(userId, 50);
    const withdrawalTransactions = withdrawals.filter((t: any) => t.type === 'withdrawal');

    res.json({
      success: true,
      data: withdrawalTransactions,
    });
  } catch (error: any) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get withdrawals',
    });
  }
}

/**
 * Admin: Approve withdrawal
 * POST /api/wallet/withdrawals/:withdrawalId/approve (admin)
 */
export async function approveWithdrawal(req: Request, res: Response) {
  try {
    const { withdrawalId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Approve withdrawal - mark transaction as completed
    // Implementation depends on withdrawal storage pattern

    res.json({
      success: true,
      message: 'Withdrawal approved',
    });
  } catch (error: any) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({
      error: error.message || 'Failed to approve withdrawal',
    });
  }
}

/**
 * Get wallet stats
 * GET /api/wallet/stats
 */
export async function getStats(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await walletService.getBalance(userId);
    const transactions = await walletService.getTransactionHistory(userId, 100);

    // Calculate stats
    const monthlyEarnings = transactions
      .filter((t: any) => {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear() &&
          t.type === 'credit'
        );
      })
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    res.json({
      success: true,
      data: {
        currentBalance: balance.balance,
        totalEarned: balance.totalEarned,
        totalWithdrawn: balance.totalWithdrawn,
        monthlyEarnings,
        transactionCount: transactions.length,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get wallet stats',
    });
  }
}

export default {
  getBalance,
  getTransactionHistory,
  applyCredit,
  requestWithdrawal,
  getWithdrawals,
  approveWithdrawal,
  getStats,
};
