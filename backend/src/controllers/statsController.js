const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Increment the visitor count
 */
async function incrementVisitorCount(req, res) {
  // Respond immediately — never block the caller for analytics writes
  res.status(200).json({ success: true });

  // Fire-and-forget: write happens after response is sent
  setImmediate(async () => {
    try {
      await db.query('UPDATE SiteSettings SET value = value + 1 WHERE `key` = "visitor_count"');
    } catch (error) {
      console.error('Increment visitor error (background):', error.message);
    }
  });
}

/**
 * Get visitor count
 */
async function getVisitorCount(req, res) {
  try {
    const setting = await db.findOne('SiteSettings', { key: 'visitor_count' });
    const count = setting ? Number(setting.value) : 0;
    
    res.status(200).json(successResponse({ count }, 'Visitor count fetched'));
  } catch (error) {
    console.error('Get visitor count error:', error);
    res.status(500).json(errorResponse('Failed to fetch visitor count'));
  }
}

module.exports = {
  incrementVisitorCount,
  getVisitorCount
};
