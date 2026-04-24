#!/usr/bin/env node

/**
 * Database Setup & Test User Creation Script
 * Creates necessary tables and demo users for testing
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

async function setup() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Setting up database...\n');

    // 1. Create User table
    console.log('📋 Creating User table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`User\` (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        pan VARCHAR(50) UNIQUE,
        phone VARCHAR(20),
        dateOfBirth DATETIME,
        gender VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        \`role\` VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        emailVerified BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pan (pan),
        INDEX idx_email (email)
      )
    `);
    console.log('✅ User table ready\n');

    // 2. Create test users
    console.log('👤 Creating test users...');
    
    const testUsers = [
      {
        email: 'user@gsttaxwale.com',
        password: 'password123',
        name: 'Test User',
        pan: 'AAAA0000A' // Demo PAN
      },
      {
        email: 'admin@gsttaxwale.com',
        password: 'admin123',
        name: 'Admin User',
        pan: 'BBBBB0000B',
        role: 'admin'
      }
    ];

    for (const userData of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userId = uuidv4();
        
        // Check if user exists
        const [existing] = await connection.execute(
          'SELECT id FROM `User` WHERE email = ?',
          [userData.email]
        );

        if (existing.length > 0) {
          console.log(`  ⏭️  Skipping ${userData.email} (already exists)`);
          continue;
        }

        // Create user
        await connection.execute(
          `INSERT INTO \`User\` (id, email, password, name, pan, \`role\`, status, emailVerified, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            userData.email,
            hashedPassword,
            userData.name,
            userData.pan,
            userData.role || 'user',
            'active',
            1
          ]
        );
        
        console.log(`  ✅ Created ${userData.email} (${userData.role || 'user'})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  ⏭️  Skipping ${userData.email} (duplicate)`);
        } else {
          console.error(`  ❌ Error creating ${userData.email}:`, err.message);
        }
      }
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: user@gsttaxwale.com');
    console.log('   Password: password123\n');
    console.log('   Email: admin@gsttaxwale.com');
    console.log('   Password: admin123\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

setup();
