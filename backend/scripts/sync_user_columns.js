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
    const columnNames = columns.map(col => col.Field);

    const columnsToAdd = [
      { name: 'pan', type: 'VARCHAR(50) UNIQUE NULL' },
      { name: 'aadhaar', type: 'VARCHAR(50) UNIQUE NULL' },
      { name: 'phone', type: 'VARCHAR(20) NULL' },
      { name: 'dateOfBirth', type: 'DATETIME NULL' },
      { name: 'gender', type: 'VARCHAR(10) NULL' },
      { name: 'firstName', type: 'VARCHAR(100) NULL' },
      { name: 'middleName', type: 'VARCHAR(100) NULL' },
      { name: 'lastName', type: 'VARCHAR(100) NULL' },
      { name: 'fatherName', type: 'VARCHAR(255) NULL' },
      { name: 'doorNo', type: 'VARCHAR(50) NULL' },
      { name: 'buildingName', type: 'VARCHAR(255) NULL' },
      { name: 'street', type: 'VARCHAR(255) NULL' },
      { name: 'area', type: 'VARCHAR(255) NULL' },
      { name: 'address', type: 'TEXT NULL' },
      { name: 'city', type: 'VARCHAR(100) NULL' },
      { name: 'state', type: 'VARCHAR(100) NULL' },
      { name: 'pincode', type: 'VARCHAR(10) NULL' },
      { name: 'country', type: "VARCHAR(100) DEFAULT 'India'" },
      { name: 'bankDetails', type: 'JSON NULL' },
      { name: 'role', type: "VARCHAR(20) DEFAULT 'user'" },
      { name: 'status', type: "VARCHAR(20) DEFAULT 'active'" },
      { name: 'emailVerified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'resetToken', type: 'VARCHAR(255) UNIQUE NULL' },
      { name: 'resetTokenExpires', type: 'DATETIME NULL' },
      { name: 'lastPasswordChange', type: 'DATETIME NULL' },
      { name: 'reference_number', type: 'VARCHAR(255) UNIQUE NULL' },
      { name: 'referral_code', type: 'VARCHAR(255) UNIQUE NULL' },
      { name: 'created_by_admin', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'points_wallet', type: 'INT DEFAULT 0' },
      { name: 'walletId', type: 'VARCHAR(255) UNIQUE NULL' },
      { name: 'referralCodeId', type: 'VARCHAR(255) UNIQUE NULL' },
      { name: 'preferEmailReminders', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'preferredFilingType', type: 'VARCHAR(50) NULL' }
    ];

    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`➕ Adding missing \`${col.name}\` column to \`User\` table...`);
        try {
          await connection.execute(`ALTER TABLE \`User\` ADD COLUMN \`${col.name}\` ${col.type}`);
          console.log(`✅ \`${col.name}\` column added successfully.`);
        } catch (err) {
          console.error(`❌ Failed to add \`${col.name}\`:`, err.message);
        }
      } else {
        console.log(`✅ \`${col.name}\` column already exists.`);
      }
    }
    
    console.log('\n🚀 User table is now synchronized with the schema.');
    
  } catch (error) {
    console.error('❌ Failed to check/fix columns:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fix();
