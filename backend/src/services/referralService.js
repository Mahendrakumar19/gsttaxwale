const db = require('../utils/db');
const WalletService = require('./walletService');

/**
 * ReferralService - Dynamic rules engine and event tracking
 */
class ReferralService {
  /**
   * Track a referral event (click, signup, etc.)
   */
  static async trackEvent(referrerId, refereeId, eventType, metadata = {}) {
    try {
      return await db.create('referral_events', {
        referrer_id: referrerId,
        referee_id: refereeId,
        event_type: eventType,
        metadata: JSON.stringify(metadata),
        created_at: new Date()
      });
    } catch (error) {
      console.error('❌ Track Event Error:', error);
    }
  }

  /**
   * Process reward for a new signup
   */
  static async processSignupReward(referrerId, refereeId) {
    try {
      // 1. Fetch active signup rules
      const rules = await db.query(
        'SELECT * FROM referral_rules WHERE trigger_type = "signup" AND is_active = TRUE LIMIT 1'
      );

      if (rules.length === 0) return null;
      const rule = rules[0];

      let rewardAmount = 0;
      if (rule.reward_type === 'fixed') {
        rewardAmount = parseFloat(rule.reward_value);
      }

      if (rewardAmount > 0) {
        // 2. Credit to referrer
        await WalletService.credit(
          referrerId, 
          rewardAmount, 
          'referral_signup', 
          refereeId, 
          `Reward for referring new user (ID: ${refereeId})`
        );

        // 3. Track event
        await this.trackEvent(referrerId, refereeId, 'reward_generated', { 
          ruleId: rule.id, 
          amount: rewardAmount, 
          trigger: 'signup' 
        });
      }

      return rewardAmount;
    } catch (error) {
      console.error('❌ Process Signup Reward Error:', error);
    }
  }

  /**
   * Process reward for a purchase
   */
  static async processPurchaseReward(referrerId, refereeId, orderId, amount, serviceId = null) {
    try {
      // 1. Fetch relevant purchase rules
      // Priority: Service-specific rule > Global rule
      let rules = await db.query(
        'SELECT * FROM referral_rules WHERE trigger_type = "purchase" AND is_active = TRUE AND service_id = ? AND min_purchase_amount <= ? ORDER BY service_id DESC LIMIT 1',
        [serviceId, amount]
      );

      if (rules.length === 0) {
        rules = await db.query(
          'SELECT * FROM referral_rules WHERE trigger_type = "purchase" AND is_active = TRUE AND service_id IS NULL AND min_purchase_amount <= ? LIMIT 1',
          [amount]
        );
      }

      if (rules.length === 0) return null;
      const rule = rules[0];

      let rewardAmount = 0;
      if (rule.reward_type === 'fixed') {
        rewardAmount = parseFloat(rule.reward_value);
      } else if (rule.reward_type === 'percentage') {
        rewardAmount = (amount * parseFloat(rule.reward_value)) / 100;
      }

      // Cap the reward if max_reward is set
      if (rule.max_reward && rewardAmount > rule.max_reward) {
        rewardAmount = rule.max_reward;
      }

      if (rewardAmount > 0) {
        // 2. Credit to referrer
        await WalletService.credit(
          referrerId, 
          rewardAmount, 
          'referral_purchase', 
          orderId, 
          `Reward for purchase by referred user (Order: ${orderId})`
        );

        // 3. Track event
        await this.trackEvent(referrerId, refereeId, 'reward_generated', { 
          ruleId: rule.id, 
          amount: rewardAmount, 
          trigger: 'purchase',
          orderId
        });
      }

      return rewardAmount;
    } catch (error) {
      console.error('❌ Process Purchase Reward Error:', error);
    }
  }

  /**
   * Get active redemption settings
   */
  static async getRedemptionSettings() {
    try {
      const settings = await db.query('SELECT * FROM wallet_settings LIMIT 1');
      return settings[0] || null;
    } catch (error) {
      console.error('❌ Get Redemption Settings Error:', error);
      return null;
    }
  }
}

module.exports = ReferralService;
