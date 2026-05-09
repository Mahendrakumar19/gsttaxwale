// =============================================================================
// ADMIN CONTROLLER - Handle admin panel content management
// =============================================================================

const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get page content (public - for frontend to fetch dynamic content)
 */
async function getPageContent(req, res) {
  try {
    const { pageName, sectionKey } = req.query;

    let query = 'SELECT page_name, section_key, content FROM admin_pages WHERE is_active = TRUE';
    let params = [];

    if (pageName) {
      query += ' AND page_name = ?';
      params.push(pageName);
    }

    if (sectionKey) {
      query += ' AND section_key = ?';
      params.push(sectionKey);
    }

    const [pages] = await db.query(query, params);

    // Parse content JSON
    const formattedPages = pages.map(p => ({
      ...p,
      content: typeof p.content === 'string' ? JSON.parse(p.content) : p.content,
    }));

    return res.status(200).json(
      successResponse('Page content retrieved', {
        pages: formattedPages,
      })
    );
  } catch (error) {
    console.error('❌ Error fetching page content:', error);
    return res.status(500).json(errorResponse('Failed to fetch page content'));
  }
}

/**
 * Update page content (admin only)
 */
async function updatePageContent(req, res) {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Admin access required'));
    }

    const { pageName, sectionKey, content } = req.body;

    if (!pageName || !sectionKey || !content) {
      return res.status(400).json(
        errorResponse('pageName, sectionKey, and content are required')
      );
    }

    const contentJson = typeof content === 'string' ? content : JSON.stringify(content);

    const [result] = await db.query(
      `INSERT INTO admin_pages (page_name, section_key, content, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         updated_by = VALUES(updated_by),
         updated_at = CURRENT_TIMESTAMP`,
      [pageName, sectionKey, contentJson, req.user.id]
    );

    console.log(`✅ Page content updated: ${pageName}/${sectionKey} by admin ${req.user.id}`);

    return res.status(200).json(
      successResponse('Page content updated successfully', {
        pageName,
        sectionKey,
      })
    );
  } catch (error) {
    console.error('❌ Error updating page content:', error);
    return res.status(500).json(errorResponse('Failed to update page content'));
  }
}

/**
 * Get all page content (admin only)
 */
async function getAllPageContent(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Admin access required'));
    }

    const [pages] = await db.query(
      `SELECT id, page_name, section_key, is_active, updated_by, updated_at
       FROM admin_pages
       ORDER BY page_name, section_key`
    );

    return res.status(200).json(
      successResponse('All page content retrieved', {
        pages,
      })
    );
  } catch (error) {
    console.error('❌ Error fetching all page content:', error);
    return res.status(500).json(errorResponse('Failed to fetch all page content'));
  }
}

/**
 * Toggle page content active status
 */
async function togglePageContent(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Admin access required'));
    }

    const { id, isActive } = req.body;

    await db.query(
      'UPDATE admin_pages SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );

    console.log(`✅ Page content toggled: ID ${id}, active=${isActive}`);

    return res.status(200).json(
      successResponse('Page content status updated successfully')
    );
  } catch (error) {
    console.error('❌ Error toggling page content:', error);
    return res.status(500).json(errorResponse('Failed to toggle page content'));
  }
}

/**
 * Get admin dashboard stats
 */
async function getAdminStats(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json(errorResponse('Admin access required'));
    }

    const [userStats] = await db.query(
      'SELECT COUNT(*) as total FROM users'
    );

    const [referralStats] = await db.query(
      'SELECT COUNT(*) as total, SUM(reward_points) as total_points FROM referrals WHERE status = "converted"'
    );

    const [documentStats] = await db.query(
      'SELECT COUNT(*) as total FROM documents'
    );

    return res.status(200).json(
      successResponse('Admin stats retrieved', {
        users: userStats[0],
        referrals: referralStats[0],
        documents: documentStats[0],
      })
    );
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return res.status(500).json(errorResponse('Failed to fetch admin stats'));
  }
}

module.exports = {
  getPageContent,
  updatePageContent,
  getAllPageContent,
  togglePageContent,
  getAdminStats,
};
