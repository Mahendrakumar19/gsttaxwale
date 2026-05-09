require('dotenv').config();
const db = require('../backend/src/utils/db');

async function migrate() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS SupportTicket (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        subject VARCHAR(191) NOT NULL,
        description LONGTEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
        category VARCHAR(100),
        resolution LONGTEXT,
        assignedTo INT,
        resolvedAt DATETIME(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `;
    await db.query(sql);
    console.log('SupportTicket table created or already exists');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
