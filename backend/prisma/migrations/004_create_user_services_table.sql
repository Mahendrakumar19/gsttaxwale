-- User Services Table
CREATE TABLE IF NOT EXISTS user_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100),
  status ENUM('active', 'inactive', 'expired', 'suspended') DEFAULT 'active',
  assigned_to INT,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  
  KEY idx_user_id (user_id),
  KEY idx_service_id (service_id),
  KEY idx_status (status)
);
