require('dotenv').config();
const db = require('./backend/src/utils/db');

async function setupTables() {
  try {
    console.log('🏗️ Setting up database tables...');
    
    // Create otp_codes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY email_phone (email, phone)
      )
    `);
    
    console.log('✅ Database tables setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to setup database tables:', error);
    process.exit(1);
  }
}

setupTables();
