// Wallet Service - Handles wallet operations and balance management
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create wallet for user on signup
 */
export async function createWallet(userId: string) {
  try {
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      },
    });

    return wallet;
  } catch (error: any) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

/**
 * Get wallet balance
 */
export async function getBalance(userId: string) {
  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await createWallet(userId);
    }

    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
    };
  } catch (error: any) {
    throw new Error(`Failed to get wallet balance: ${error.message}`);
  }
}

/**
 * Credit wallet balance
 */
export async function creditBalance(userId: string, amount: number, description: string, referenceId?: string) {
  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await createWallet(userId);
    }

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount,
        totalEarned: wallet.totalEarned + amount,
      },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'credit',
        description,
        referenceId,
        status: 'completed',
      },
    });

    return updatedWallet;
  } catch (error: any) {
    throw new Error(`Failed to credit balance: ${error.message}`);
  }
}

/**
 * Debit wallet balance
 */
export async function debitBalance(userId: string, amount: number, description: string, referenceId?: string) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - amount,
      },
    });

    // Log transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'debit',
        description,
        referenceId,
        status: 'completed',
      },
    });

    return updatedWallet;
  } catch (error: any) {
    throw new Error(`Failed to debit balance: ${error.message}`);
  }
}

/**
 * Apply wallet credit to order
 */
export async function applyCredit(userId: string, orderId: string, amount: number) {
  try {
    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Debit wallet
    await debitBalance(userId, amount, `Applied credit to order ${orderId}`, orderId);

    // Update order - reduce final price
    await prisma.order.update({
      where: { id: orderId },
      data: {
        finalPrice: {
          decrement: amount,
        },
      },
    });

    return { success: true, appliedAmount: amount };
  } catch (error: any) {
    throw new Error(`Failed to apply credit: ${error.message}`);
  }
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(userId: string, amount: number, bankAccount: any) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount || amount < 500) {
      throw new Error('Invalid withdrawal amount. Minimum ₹500');
    }

    // Create withdrawal transaction (pending)
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'withdrawal',
        description: `Withdrawal request to ${bankAccount.accountNumber}`,
        status: 'pending',
      },
    });

    // Reduce balance (temporary hold)
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - amount,
      },
    });

    return {
      success: true,
      transactionId: transaction.id,
      amount,
      status: 'pending',
    };
  } catch (error: any) {
    throw new Error(`Failed to request withdrawal: ${error.message}`);
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(userId: string, limit: number = 50) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return [];
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  } catch (error: any) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }
}

export default {
  createWallet,
  getBalance,
  creditBalance,
  debitBalance,
  applyCredit,
  requestWithdrawal,
  getTransactionHistory,
};
