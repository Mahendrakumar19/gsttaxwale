const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Increment the visitor count
 */
async function incrementVisitorCount(req, res) {
  try {
    // Simple atomic increment in MySQL
    await db.query('UPDATE SiteSettings SET value = value + 1 WHERE `key` = "visitor_count"');
    
    res.status(200).json(successResponse(null, 'Visitor count incremented'));
  } catch (error) {
    console.error('Increment visitor error:', error);
    res.status(500).json(errorResponse('Failed to increment visitor count'));
  }
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
