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
      const rewardAmount = 100;
      await WalletService.credit(
        referrerId,
        rewardAmount,
        'referral_signup',
        refereeId,
        `Reward for referring new user (ID: ${refereeId})`
      );
      await this.trackEvent(referrerId, refereeId, 'reward_generated', {
        amount: rewardAmount,
        trigger: 'signup'
      });
      return rewardAmount;
    } catch (error) {
      console.error('❌ Process Signup Reward Error:', error);
    }
  }

  /**
   * Process reward for a purchase
   */
  static async processPurchaseReward(refereeId, orderId, amount, serviceId = null) {
    try {
      // Find the referral lead for this referee
      const [user] = await db.query('SELECT email FROM User WHERE id = ?', [refereeId]);
      if (!user) return 0;

      const [lead] = await db.query(
        'SELECT * FROM referral_leads WHERE converted_user_id = ? OR referred_email = ? LIMIT 1',
        [refereeId, user.email]
      );

      if (!lead) {
        console.log('No referral lead found for referee ID:', refereeId);
        return 0;
      }

      if (lead.reward_given) {
        console.log('Reward already processed for lead ID:', lead.id);
        return 0;
      }

      // Fixed reward amount of 100 points for every successful referral
      const rewardAmount = 100;

      const referrerCode = lead.referrer_referral_id;

      // Identify referrer
      const [referrerUser] = await db.query('SELECT id FROM User WHERE referral_code = ?', [referrerCode]);
      if (referrerUser) {
        // Customer referrer: Credit to wallet
        await WalletService.credit(
          referrerUser.id,
          rewardAmount,
          'referral_purchase',
          orderId,
          `Referral reward for purchase by user ${user.email} (Order: ${orderId})`
        );
        console.log(`🎁 Credited ${rewardAmount} points to customer referrer (ID: ${referrerUser.id})`);
      } else {
        // Guest referrer: Update pending_points in referral_referrers
        const [referrerGuest] = await db.query('SELECT id FROM referral_referrers WHERE referral_id = ?', [referrerCode]);
        if (referrerGuest) {
          await db.query(
            'UPDATE referral_referrers SET pending_points = pending_points + ?, updated_at = NOW() WHERE id = ?',
            [rewardAmount, referrerGuest.id]
          );
          console.log(`🎁 Added ${rewardAmount} pending points to guest referrer (ID: ${referrerGuest.id})`);
        } else {
          console.log('No registered customer or guest referrer found for code:', referrerCode);
          return 0;
        }
      }

      // Mark reward as given in lead record and set status to completed
      await db.query(
        "UPDATE referral_leads SET status = 'completed', reward_given = 1, updated_at = NOW() WHERE id = ?",
        [lead.id]
      );

      // Track Event
      try {
        await this.trackEvent(
          referrerUser ? referrerUser.id : null,
          refereeId,
          'reward_generated',
          {
            amount: rewardAmount,
            trigger: 'purchase',
            orderId,
            referrerCode
          }
        );
      } catch (trackErr) {
        console.warn('Could not write reward event:', trackErr.message);
      }

      return rewardAmount;
    } catch (error) {
      console.error('❌ processPurchaseReward error:', error);
      throw error;
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
