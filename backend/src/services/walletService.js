const db = require('../utils/db');

/**
 * WalletService - Ledger-based accounting system for points
 */
class WalletService {
  /**
   * Credit points to a user's wallet
   */
  static async credit(userId, points, source, referenceId = null, description = null) {
    if (points <= 0) return null;

    try {
      const transaction = await db.create('wallet_transactions', {
        user_id: userId,
        type: 'credit',
        source,
        points,
        reference_id: referenceId,
        status: 'approved',
        description: description || `Points credited via ${source}`,
        created_at: new Date()
      });

      // Update cached balance in User table for performance
      await db.query(
        'UPDATE User SET points_wallet = COALESCE(points_wallet, 0) + ? WHERE id = ?',
        [points, userId]
      );

      return transaction;
    } catch (error) {
      console.error('❌ Wallet Credit Error:', error);
      throw error;
    }
  }

  /**
   * Debit points from a user's wallet
   */
  static async debit(userId, points, source, referenceId = null, description = null) {
    if (points <= 0) return null;

    try {
      // Check balance first
      const balance = await this.getBalance(userId);
      if (balance < points) {
        throw new Error('Insufficient wallet balance');
      }

      const transaction = await db.create('wallet_transactions', {
        user_id: userId,
        type: 'debit',
        source,
        points,
        reference_id: referenceId,
        status: 'approved',
        description: description || `Points debited via ${source}`,
        created_at: new Date()
      });

      // Update cached balance in User table
      await db.query(
        'UPDATE User SET points_wallet = GREATEST(0, COALESCE(points_wallet, 0) - ?) WHERE id = ?',
        [points, userId]
      );

      return transaction;
    } catch (error) {
      console.error('❌ Wallet Debit Error:', error);
      throw error;
    }
  }

  /**
   * Get derived balance from ledger (source of truth)
   */
  static async getBalance(userId) {
    try {
      const result = await db.query(`
        SELECT 
          SUM(CASE WHEN type = 'credit' THEN points ELSE 0 END) - 
          SUM(CASE WHEN type = 'debit' THEN points ELSE 0 END) as balance
        FROM wallet_transactions 
        WHERE user_id = ? AND status = 'approved'
      `, [userId]);

      return result[0].balance || 0;
    } catch (error) {
      console.error('❌ Get Balance Error:', error);
      return 0;
    }
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactionHistory(userId, limit = 20) {
    try {
      return await db.query(`
        SELECT * FROM wallet_transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, limit]);
    } catch (error) {
      console.error('❌ Get Transaction History Error:', error);
      return [];
    }
  }
}

module.exports = WalletService;
