-- Pages Table (Dynamic CMS)
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_name VARCHAR(100) NOT NULL UNIQUE,
  section_key VARCHAR(100),
  content LONGTEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  KEY idx_page_name (page_name),
  KEY idx_is_active (is_active)
);

-- Pre-populate CMS pages
INSERT IGNORE INTO pages (page_name, section_key) VALUES
('homepage', 'hero'),
('homepage', 'services'),
('homepage', 'features'),
('homepage', 'testimonials'),
('homepage', 'cta'),
('footer', 'links'),
('footer', 'contact'),
('pricing', 'plans'),
('faq', 'questions');
