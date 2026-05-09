-- ============================================================================
-- Migration: Add Referrals, Documents, and Admin Pages Management
-- ============================================================================

-- Update users table with referral fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE NOT NULL DEFAULT UUID();
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id INT;
ALTER TABLE users ADD FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Referrals table (track referrals between users)
CREATE TABLE IF NOT EXISTS referrals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referrer_id INT NOT NULL,
  referred_user_id INT NOT NULL,
  referred_email VARCHAR(255),
  status ENUM('pending', 'converted', 'cancelled') DEFAULT 'pending',
  reward_points INT DEFAULT 200,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_referral (referrer_id, referred_user_id)
);

-- Documents table (user documents upload storage)
CREATE TABLE IF NOT EXISTS documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  document_type ENUM('ITR', 'GST', 'PAN', 'AADHAR', 'BUSINESS_PROOF', 'BANK_STATEMENT', 'OTHER') DEFAULT 'OTHER',
  financial_year VARCHAR(10),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INT,
  status ENUM('uploaded', 'verified', 'rejected') DEFAULT 'uploaded',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_user_type (user_id, document_type)
);

-- Redemptions table (track point usage)
CREATE TABLE IF NOT EXISTS redemptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  points_used INT NOT NULL,
  description VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin managed content pages
CREATE TABLE IF NOT EXISTS admin_pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_name VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  content JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_page_section (page_name, section_key),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin content
INSERT INTO admin_pages (page_name, section_key, content) VALUES 
('home', 'header', '{"title": "Complete Tax & Compliance Solutions", "subtitle": "Professional GST filing, income tax returns, and business compliance services"}'),
('home', 'services', '{"limit": 6, "text": "Our Services"}'),
('contact', 'head_office', '{"name": "Patna Head Office", "address": "105 Pranami Enclave, Anandpuri, Boring Canal Road, Patna 80001", "phone": "7739301568"}'),
('footer', 'social', '{"instagram": "", "facebook": "", "linkedin": "", "twitter": ""}')
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- Create indexes for performance
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_redemptions_user ON redemptions(user_id);
