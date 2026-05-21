const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const db = require('../backend/src/utils/db');

async function migrate() {
  console.log('Running database setup for Referral Lifecycle...');
  try {
    // 1. Drop foreign key constraint on referral_events if it exists
    try {
      await db.query(`
        ALTER TABLE \`referral_events\` 
        DROP FOREIGN KEY \`fk_referral_events_lead_id\`
      `);
      console.log('✅ Dropped foreign key from referral_events');
    } catch (fkErr) {
      console.log('ℹ️ Foreign key constraint did not exist or could not be dropped:', fkErr.message);
    }

    // 2. Clear out any stale referral_lead_id values in referral_events so they don't break constraints
    try {
      await db.query('UPDATE \`referral_events\` SET \`referral_lead_id\` = NULL');
      console.log('✅ Cleared stale lead IDs in referral_events');
    } catch (clearErr) {
      console.log('ℹ️ referral_events does not exist or columns are different:', clearErr.message);
    }

    // 3. Drop existing tables if they exist
    await db.query('DROP TABLE IF EXISTS \`referral_leads\`');
    await db.query('DROP TABLE IF EXISTS \`referral_referrers\`');
    console.log('✅ Dropped old referral tables');

    // 4. Create referral_referrers table
    await db.query(`
      CREATE TABLE \`referral_referrers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`mobile\` VARCHAR(50) NOT NULL,
        \`referral_id\` VARCHAR(255) NOT NULL,
        \`pending_points\` INT NOT NULL DEFAULT 0,
        \`is_customer\` TINYINT(1) NOT NULL DEFAULT 0,
        \`converted_user_id\` INT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_ref_referrer_email\` (\`email\`),
        UNIQUE KEY \`uq_ref_referrer_mobile\` (\`mobile\`),
        UNIQUE KEY \`uq_ref_referrer_code\` (\`referral_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created referral_referrers table');

    // 5. Create referral_leads table
    await db.query(`
      CREATE TABLE \`referral_leads\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`referrer_referral_id\` VARCHAR(255) NOT NULL,
        \`referred_name\` VARCHAR(255) NOT NULL,
        \`referred_mobile\` VARCHAR(50) NOT NULL,
        \`referred_email\` VARCHAR(255) NOT NULL,
        \`service_interest\` VARCHAR(255) NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`converted_user_id\` INT NULL,
        \`reward_given\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_ref_leads_referrer_id\` (\`referrer_referral_id\`),
        INDEX \`idx_ref_leads_referee_email\` (\`referred_email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created referral_leads table');

    // 6. Restore foreign key constraint on referral_events pointing to referral_leads
    try {
      await db.query(`
        ALTER TABLE \`referral_events\` 
        ADD CONSTRAINT \`fk_referral_events_lead_id\` 
        FOREIGN KEY (\`referral_lead_id\`) REFERENCES \`referral_leads\`(\`id\`) ON DELETE SET NULL
      `);
      console.log('✅ Restored foreign key on referral_events');
    } catch (restoreErr) {
      console.log('ℹ️ Could not restore foreign key on referral_events:', restoreErr.message);
    }

    console.log('✅ Referral Lifecycle migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
