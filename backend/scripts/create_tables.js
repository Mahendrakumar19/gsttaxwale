#!/usr/bin/env node

const mysql = require('mysql2/promise');

const createTablesSQL = `
-- User table
CREATE TABLE IF NOT EXISTS \`User\` (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  pan VARCHAR(50) UNIQUE NOT NULL,
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
);

-- Service table
CREATE TABLE IF NOT EXISTS \`Service\` (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  features LONGTEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

-- Order table
CREATE TABLE IF NOT EXISTS \`Order\` (
  id VARCHAR(255) PRIMARY KEY,
  serviceId VARCHAR(255) NOT NULL,
  customerId VARCHAR(255) NOT NULL,
  amount FLOAT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (serviceId) REFERENCES Service(id),
  FOREIGN KEY (customerId) REFERENCES User(id)
);

-- OTP table
CREATE TABLE IF NOT EXISTS \`OTP\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(10) NOT NULL,
  expiresAt DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
);

-- TaxFiling table
CREATE TABLE IF NOT EXISTS \`TaxFiling\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  assessmentYear INT,
  filingYear INT,
  itrType VARCHAR(50) DEFAULT 'ITR1',
  regime VARCHAR(50) DEFAULT 'old',
  status VARCHAR(50) DEFAULT 'draft',
  grossSalary FLOAT DEFAULT 0,
  businessIncome FLOAT DEFAULT 0,
  capitalGains FLOAT DEFAULT 0,
  otherIncome FLOAT DEFAULT 0,
  totalIncome FLOAT DEFAULT 0,
  totalDeductions FLOAT DEFAULT 0,
  taxableIncome FLOAT DEFAULT 0,
  incomeTax FLOAT DEFAULT 0,
  surcharge FLOAT DEFAULT 0,
  cess FLOAT DEFAULT 0,
  totalTax FLOAT DEFAULT 0,
  rebate FLOAT DEFAULT 0,
  totalTaxPayable FLOAT DEFAULT 0,
  taxPaid FLOAT DEFAULT 0,
  refund FLOAT DEFAULT 0,
  caRequired BOOLEAN DEFAULT FALSE,
  caId VARCHAR(255),
  remarks TEXT,
  submittedAt DATETIME,
  filedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status)
);

-- Income table
CREATE TABLE IF NOT EXISTS \`Income\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  amount FLOAT,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId)
);

-- Deduction table
CREATE TABLE IF NOT EXISTS \`Deduction\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  amount FLOAT,
  section VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId)
);

-- Document table
CREATE TABLE IF NOT EXISTS \`Document\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  fileName VARCHAR(255),
  filePath TEXT,
  mimeType VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId)
);

-- Payment table
CREATE TABLE IF NOT EXISTS \`Payment\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  orderId VARCHAR(255),
  amount FLOAT,
  method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  razorpayId VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId)
);

-- CAAssignment table
CREATE TABLE IF NOT EXISTS \`CAAssignment\` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  caId VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (caId) REFERENCES User(id),
  INDEX idx_userId (userId),
  INDEX idx_caId (caId)
);
`;

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '194.59.164.75',
    user: process.env.DB_USER || 'u963801592_gsttaxwale_use',
    password: process.env.DB_PASSWORD || 'gsttaxwaleNG26',
    database: process.env.DB_NAME || 'u963801592_gsttaxwale',
  });

  try {
    console.log('📊 Creating database tables...');
    
    // Split SQL into individual statements and execute
    const statements = createTablesSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        const match = statement.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/);
        if (match) {
          console.log(`✅ Created table: ${match[1]}`);
        }
      }
    }

    console.log('\n✨ All tables created successfully!');

  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createTables();
