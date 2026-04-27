const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function fix() {
  const connection = await pool.getConnection();
  try {
    console.log('🔍 Checking User table columns...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM `User`');
    const hasPan = columns.some(col => col.Field === 'pan');

    if (!hasPan) {
      console.log('➕ Adding missing `pan` column to `User` table...');
      await connection.execute('ALTER TABLE `User` ADD COLUMN `pan` VARCHAR(50) UNIQUE AFTER `name`');
      await connection.execute('CREATE INDEX idx_pan ON `User`(pan)');
      console.log('✅ `pan` column added successfully.');
    } else {
      console.log('✅ `pan` column already exists.');
    }
  } catch (error) {
    console.error('❌ Failed to fix `pan` column:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fix();
