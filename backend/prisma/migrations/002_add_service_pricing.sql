-- Migration: Add service_pricing table for admin-managed slash prices
-- Date: May 6, 2026

CREATE TABLE IF NOT EXISTS service_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL UNIQUE,
  slash_price DECIMAL(10, 2),
  discount_price DECIMAL(10, 2) NOT NULL,
  is_active TINYINT DEFAULT 1,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_service_id (service_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new columns to services table if they don't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS has_pricing_override TINYINT DEFAULT 0;

-- Existing service_pricing records will have:
-- slash_price: Original/crossed-out price (what admin wants to show as original)
-- discount_price: New promotional price (what customer pays)
-- Example: service_id=1, slash_price=999, discount_price=499
-- This shows: ₹999 (strikethrough) → ₹499
