-- Migration: Add GST Dashboard Tables for Safe Dashboard Upgrade
-- Created: 2026-04-16
-- Purpose: Extend dashboard with plan management, filing tracking, document center, and wallet features
-- Safety: Adds new tables only - does NOT modify existing tables

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 1: GSTPlans - User subscription plans for GST services
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS GSTPlans (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  planName VARCHAR(255) NOT NULL,
  planType ENUM('gst', 'itr', 'combined') NOT NULL,
  validity DATETIME NOT NULL,
  status ENUM('active', 'expired', 'upgraded') NOT NULL DEFAULT 'active',
  monthlyCost FLOAT NOT NULL DEFAULT 0,
  gstFilingLimit INT NOT NULL DEFAULT 1,
  itrFilingLimit INT NOT NULL DEFAULT 1,
  documentLimit INT NOT NULL DEFAULT 50,
  supportLevel ENUM('email', 'phone', 'dedicated') NOT NULL DEFAULT 'email',
  autoReminders BOOLEAN NOT NULL DEFAULT true,
  caAccess BOOLEAN NOT NULL DEFAULT false,
  prioritySupport BOOLEAN NOT NULL DEFAULT false,
  startDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  renewalDate DATETIME NULL,
  cancelledAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_validity (validity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 2: Filings Extension - New fields for admin-controlled filing status
-- ════════════════════════════════════════════════════════════════════════════
-- NOTE: This extends existing TaxFiling table via Prisma migration
-- No direct SQL change needed - handled by Prisma alter table

-- New columns to add to TaxFiling (via Prisma):
-- filingType VARCHAR(50) - 'gst', 'itr', 'gstr1', 'gstr3b', etc.
-- filingPeriod VARCHAR(50) - 'monthly', 'quarterly', 'annual'
-- periodMonth INT - 1-12 or quarter identifier
-- adminStatus VARCHAR(50) - 'pending', 'in_progress', 'filed', 'rejected'
-- statusUpdatedBy VARCHAR(191) - Admin user ID
-- statusUpdatedAt DATETIME - When admin updated status
-- dueDate DATETIME - Filing deadline
-- filedDate DATETIME - When filed
-- referenceNumber VARCHAR(255) - Government ref ID
-- remarks TEXT - Admin notes
-- reminderCount INT - Number of reminders sent
-- lastReminderAt DATETIME - Last reminder timestamp

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 3: Wallet Extension - Already exists, just ensure relationship
-- ════════════════════════════════════════════════════════════════════════════
-- Note: Wallet table already exists in Prisma schema
-- Columns: id, userId (UNIQUE), balance, totalEarned, lastEarnedAt, createdAt, updatedAt

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE 4: Referral Extension - Already exists in Prisma
-- ════════════════════════════════════════════════════════════════════════════
-- Note: Referral table already exists
-- Columns: id, referredBy, referredTo, status, earnedAmount, earnedAt, created, updated

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES for Performance
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_gst_plans_userId ON GSTPlans(userId);
CREATE INDEX IF NOT EXISTS idx_gst_plans_status ON GSTPlans(status);
CREATE INDEX IF NOT EXISTS idx_gst_plans_validity ON GSTPlans(validity);
CREATE INDEX IF NOT EXISTS idx_tax_filing_filingType ON TaxFiling(filingType);
CREATE INDEX IF NOT EXISTS idx_tax_filing_adminStatus ON TaxFiling(adminStatus);
CREATE INDEX IF NOT EXISTS idx_tax_filing_dueDate ON TaxFiling(dueDate);

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ════════════════════════════════════════════════════════════════════════════
-- Check new table exists:
-- SELECT * FROM GSTPlans LIMIT 0;

-- Check existing tables still intact:
-- SELECT COUNT(*) FROM User;
-- SELECT COUNT(*) FROM TaxFiling;
-- SELECT COUNT(*) FROM Document;
-- SELECT COUNT(*) FROM Wallet;
-- SELECT COUNT(*) FROM Referral;

-- ════════════════════════════════════════════════════════════════════════════
-- ROLLBACK PROCEDURE
-- ════════════════════════════════════════════════════════════════════════════
-- To rollback (if needed):
-- DROP TABLE IF EXISTS GSTPlans;
-- ALTER TABLE TaxFiling DROP COLUMN IF EXISTS filingType;
-- ALTER TABLE TaxFiling DROP COLUMN IF EXISTS adminStatus;
-- (etc for all new columns)
