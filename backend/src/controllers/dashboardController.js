const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get dashboard data for user
 */
async function getDashboard(req, res) {
  const userId = req.userId;
  try {
    // Get user details
    const [user] = await db.query('SELECT name, email, phone, pan, role, status FROM User WHERE id = ?', [userId]);

    // Get recent orders
    const orders = await db.query(`
      SELECT o.*, s.name as serviceName
      FROM \`Order\` o
      JOIN Service s ON o.serviceId = s.id
      WHERE o.userId = ?
      ORDER BY o.createdAt DESC
      LIMIT 5
    `, [userId]);

    // Get documents
    const documents = await db.query('SELECT * FROM Document WHERE userId = ? ORDER BY createdAt DESC', [userId]);

    res.status(200).json(successResponse({
      user,
      orders,
      documents,
      statistics: {
        totalOrders: orders.length,
        totalDocuments: documents.length,
        pendingPayments: orders.filter(o => o.paymentStatus === 'unpaid').length
      }
    }, 'Dashboard data fetched'));
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get Statistics
 */
async function getStatistics(req, res) {
  const userId = req.userId;
  try {
    const [orderStats] = await db.query('SELECT COUNT(*) as count, SUM(finalAmount) as total FROM \`Order\` WHERE userId = ? AND paymentStatus = "paid"', [userId]);
    const [docStats] = await db.query('SELECT COUNT(*) as count FROM Document WHERE userId = ?', [userId]);

    res.status(200).json(successResponse({
      orders: {
        count: orderStats?.count || 0,
        totalAmount: orderStats?.total || 0
      },
      documents: {
        count: docStats?.count || 0
      }
    }, 'Statistics fetched'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get Refund Status (Dummy or simplified)
 */
async function getRefundStatus(req, res) {
  res.status(200).json(successResponse({ status: 'No active refunds' }));
}

/**
 * Remove Filing (Admin or specific action)
 */
async function removeFiling(req, res) {
  // In the simplified model, this might not apply, but we can clear user orders if requested
  const userId = req.userId;
  try {
    await db.query('DELETE FROM \`Order\` WHERE userId = ? AND status = "inquiry"', [userId]);
    res.status(200).json(successResponse(null, 'Inquiry data removed'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get User Services
 */
async function getUserServices(req, res) {
  const userId = req.userId;
  try {
    const services = await db.query(`
      SELECT DISTINCT s.*
      FROM Service s
      JOIN \`Order\` o ON s.id = o.serviceId
      WHERE o.userId = ?
    `, [userId]);
    res.status(200).json(successResponse({ services }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get User Documents Grouped
 */
async function getUserDocumentsGrouped(req, res) {
  const userId = req.userId;
  try {
    const documents = await db.query('SELECT * FROM Document WHERE userId = ? ORDER BY fiscalYear DESC, createdAt DESC', [userId]);

    res.status(200).json(successResponse({ documents }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getDashboard,
  getStatistics,
  getRefundStatus,
  removeFiling,
  getUserServices,
  getUserDocumentsGrouped
};
