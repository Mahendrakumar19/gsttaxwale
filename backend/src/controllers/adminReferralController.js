const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const WalletService = require('../services/walletService');
const ReferralService = require('../services/referralService');

/**
 * AdminReferralController - Manage rules and wallet ledger
 */
class AdminReferralController {
  // --- RULES MANAGEMENT ---

  static async getRules(req, res) {
    try {
      const rules = await db.query('SELECT * FROM referral_rules ORDER BY created_at DESC');
      res.status(200).json(successResponse({ rules }, 'Referral rules fetched'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to fetch rules'));
    }
  }

  static async createRule(req, res) {
    try {
      const { trigger_type, reward_type, reward_value, service_id, min_purchase_amount, max_reward, expiry_days } = req.body;
      
      const rule = await db.create('referral_rules', {
        trigger_type,
        reward_type,
        reward_value,
        service_id: service_id || null,
        min_purchase_amount: min_purchase_amount || 0,
        max_reward: max_reward || null,
        expiry_days: expiry_days || 365,
        is_active: 1,
        created_at: new Date()
      });

      res.status(201).json(successResponse({ rule }, 'Referral rule created'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to create rule'));
    }
  }

  static async updateRule(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      await db.update('referral_rules', data, { id });
      const updated = await db.findOne('referral_rules', { id });
      
      res.status(200).json(successResponse({ rule: updated }, 'Referral rule updated'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to update rule'));
    }
  }

  // --- WALLET & TRANSACTIONS ---

  static async getAllTransactions(req, res) {
    try {
      const transactions = await db.query(`
        SELECT t.*, u.name as userName, u.email as userEmail 
        FROM wallet_transactions t
        JOIN User u ON t.user_id = u.id
        ORDER BY t.created_at DESC 
        LIMIT 100
      `);
      res.status(200).json(successResponse({ transactions }, 'Transactions fetched'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to fetch transactions'));
    }
  }

  static async adjustWallet(req, res) {
    try {
      const { userId, points, type, description } = req.body;
      
      if (type === 'credit') {
        await WalletService.credit(userId, points, 'admin_bonus', null, description);
      } else {
        await WalletService.debit(userId, points, 'reversal', null, description);
      }

      res.status(200).json(successResponse({}, 'Wallet adjusted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to adjust wallet: ' + error.message));
    }
  }

  // --- SETTINGS MANAGEMENT ---

  static async getSettings(req, res) {
    try {
      const settings = await ReferralService.getRedemptionSettings();
      res.status(200).json(successResponse({ settings }, 'Wallet settings fetched'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to fetch settings'));
    }
  }

  static async updateSettings(req, res) {
    try {
      const data = req.body;
      // Convert enabled_services to string if it's an array
      if (data.enabled_services && Array.isArray(data.enabled_services)) {
        data.enabled_services = JSON.stringify(data.enabled_services);
      }
      
      await db.update('wallet_settings', data, { id: 1 });
      const updated = await ReferralService.getRedemptionSettings();
      
      res.status(200).json(successResponse({ settings: updated }, 'Wallet settings updated'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to update settings'));
    }
  }

  // --- ANALYTICS ---

  static async getReferralAnalytics(req, res) {
    try {
      const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM referral_events WHERE event_type = 'click') as totalClicks,
          (SELECT COUNT(*) FROM User WHERE referrer_id IS NOT NULL) as totalSignups,
          (SELECT COUNT(*) FROM wallet_transactions WHERE source = 'referral_purchase') as totalConversions,
          (SELECT COALESCE(SUM(points), 0) FROM wallet_transactions WHERE type = 'credit') as totalPointsAwarded,
          (SELECT COALESCE(SUM(points), 0) FROM wallet_transactions WHERE type = 'debit' AND source = 'redemption') as totalPointsRedeemed,
          (SELECT COUNT(*) FROM referral_rules WHERE is_active = 1) as activeRules
      `);

      res.status(200).json(successResponse({ stats: stats[0] }, 'Analytics fetched'));
    } catch (error) {
      res.status(500).json(errorResponse('Failed to fetch analytics: ' + error.message));
    }
  }
}

module.exports = AdminReferralController;
