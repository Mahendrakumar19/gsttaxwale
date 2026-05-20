const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const db = require('../backend/src/utils/db');

async function migrate() {
  console.log('🚀 Starting Wallet & Referral Engine Migration...');

  try {
    // 1. Wallet Transactions (Ledger)
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('credit', 'debit', 'expired', 'reversal') NOT NULL,
        source ENUM('referral_signup', 'referral_purchase', 'admin_bonus', 'redemption', 'refund') NOT NULL,
        points INT NOT NULL,
        reference_id VARCHAR(255) NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_status (user_id, status),
        INDEX idx_source (source)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table "wallet_transactions" created.');

    // 2. Referral Rules Engine
    await db.query(`
      CREATE TABLE IF NOT EXISTS referral_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigger_type ENUM('signup', 'purchase') NOT NULL,
        reward_type ENUM('fixed', 'percentage') NOT NULL,
        reward_value DECIMAL(10, 2) NOT NULL,
        service_id INT NULL,
        min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
        max_reward INT NULL,
        expiry_days INT DEFAULT 365,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_trigger_active (trigger_type, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table "referral_rules" created.');

    // 3. Referral Events Tracking
    await db.query(`
      CREATE TABLE IF NOT EXISTS referral_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrer_id INT NOT NULL,
        referee_id INT NULL,
        event_type ENUM('click', 'signup', 'purchase', 'reward_generated', 'redemption') NOT NULL,
        metadata JSON NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_referrer (referrer_id),
        INDEX idx_event_type (event_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table "referral_events" created.');

    // 4. Wallet Settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        max_redeem_percent INT DEFAULT 20,
        min_order_amount DECIMAL(10, 2) DEFAULT 500.00,
        expiry_days INT DEFAULT 365,
        allow_coupon_stacking BOOLEAN DEFAULT FALSE,
        enabled_services TEXT NULL, -- JSON array of service IDs or 'all'
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table "wallet_settings" created.');

    // Insert default settings if not exists
    const settings = await db.query('SELECT id FROM wallet_settings LIMIT 1');
    if (settings.length === 0) {
      await db.query(`
        INSERT INTO wallet_settings (max_redeem_percent, min_order_amount, enabled_services)
        VALUES (20, 500.00, '["all"]')
      `);
      console.log('✅ Default wallet settings inserted.');
    }

    // Insert basic rules if not exists
    const rules = await db.query('SELECT id FROM referral_rules LIMIT 1');
    if (rules.length === 0) {
      await db.query(`
        INSERT INTO referral_rules (trigger_type, reward_type, reward_value, is_active)
        VALUES 
        ('signup', 'fixed', 50, TRUE),
        ('purchase', 'percentage', 10, TRUE)
      `);
      console.log('✅ Basic referral rules inserted.');
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
