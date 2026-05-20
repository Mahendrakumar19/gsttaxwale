const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function migrate() {
  console.log('Starting migration with environment variables...');
  console.log('DB Host:', process.env.DB_HOST);
  console.log('DB Name:', process.env.DB_NAME);
  try {
    // 1. Create referral_leads table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`referral_leads\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`referrer_user_id\` INT NOT NULL,
        \`guest_name\` VARCHAR(255) NOT NULL,
        \`guest_email\` VARCHAR(255) NOT NULL,
        \`guest_phone\` VARCHAR(50) NOT NULL,
        \`service_interest\` VARCHAR(255) NULL,
        \`source\` VARCHAR(255) NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`attribution_token\` VARCHAR(255) NULL,
        \`converted_user_id\` INT NULL,
        \`notes\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`referrer_user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ referral_leads table created or already exists');

    // 2. Extend referral_events table (if it exists, add new fields, else create it)
    const tables = await db.query("SHOW TABLES LIKE 'referral_events'");
    if (tables.length > 0) {
      console.log('referral_events table exists. Adding new columns...');
      const columns = [
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS referral_lead_id INT NULL',
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100) NULL',
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS user_agent TEXT NULL',
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100) NULL',
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS referrer_id INT NULL',
        'ALTER TABLE referral_events ADD COLUMN IF NOT EXISTS referee_id INT NULL'
      ];
      for (const colQuery of columns) {
        try {
          await db.query(colQuery);
        } catch (colErr) {
          console.warn(`Column check/addition warning: ${colErr.message}`);
        }
      }
    } else {
      console.log('Creating referral_events table...');
      await db.query(`
        CREATE TABLE \`referral_events\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`referral_lead_id\` INT NULL,
          \`referrer_id\` INT NULL,
          \`referee_id\` INT NULL,
          \`event_type\` VARCHAR(100) NOT NULL,
          \`ip_address\` VARCHAR(100) NULL,
          \`user_agent\` TEXT NULL,
          \`utm_source\` VARCHAR(100) NULL,
          \`metadata\` TEXT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (\`referral_lead_id\`) REFERENCES \`referral_leads\`(\`id\`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    }
    console.log('✅ referral_events table setup complete');
    
    // Add foreign key constraint for referral_events pointing to referral_leads if not exists
    try {
      await db.query(`
        ALTER TABLE referral_events 
        ADD CONSTRAINT fk_referral_events_lead_id 
        FOREIGN KEY (referral_lead_id) REFERENCES referral_leads(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint added to referral_events');
    } catch (e) {
      console.log('ℹ️ Foreign key constraint might already exist:', e.message);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
