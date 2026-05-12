const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const authService = require('../services/authService');

/**
 * Get all users for admin
 */
async function getUsers(req, res) {
  try {
    const users = await db.query(`
      SELECT 
        id, name, email, phone, pan, aadhaar, 
        city, state, status, role, filingStatus, points_wallet, createdAt,
        (SELECT COUNT(*) FROM \`Order\` WHERE userId = User.id) as totalOrders,
        (SELECT SUM(finalAmount) FROM \`Order\` WHERE userId = User.id) as totalSpent
      FROM User 
      WHERE role != 'admin'
      ORDER BY createdAt DESC
    `);

    res.status(200).json(successResponse({ users }, 'Users fetched'));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get admin statistics
 */
async function getAnalytics(req, res) {
  try {
    const [userStats] = await db.query("SELECT COUNT(*) as totalUsers FROM User WHERE role = 'user'");
    const [orderStats] = await db.query("SELECT COUNT(*) as totalOrders, SUM(finalAmount) as totalRevenue FROM \`Order\` WHERE paymentStatus = 'paid'");
    const [pendingStats] = await db.query("SELECT COUNT(*) as pendingOrders FROM \`Order\` WHERE status = 'pending'");
    const [serviceStats] = await db.query("SELECT COUNT(*) as totalServices FROM Service");
    const [docStats] = await db.query("SELECT COUNT(*) as totalDocuments FROM Document");
    const [ticketStats] = await db.query("SELECT COUNT(*) as totalTickets FROM SupportTicket");
    const [visitorStats] = await db.query("SELECT value FROM SiteSettings WHERE `key` = 'visitor_count'");

    const analytics = {
      totalUsers: userStats?.totalUsers || 0,
      totalOrders: orderStats?.totalOrders || 0,
      totalRevenue: Number(orderStats?.totalRevenue) || 0,
      pendingOrders: pendingStats?.pendingOrders || 0,
      totalServices: serviceStats?.totalServices || 0,
      totalDocuments: docStats?.totalDocuments || 0,
      totalTickets: ticketStats?.totalTickets || 0,
      totalVisitors: visitorStats ? Number(visitorStats.value) : 0,
      conversionRate: userStats?.totalUsers > 0 ? ((orderStats?.totalOrders / userStats.totalUsers) * 100).toFixed(2) : 0
    };

    res.status(200).json(successResponse(analytics, 'Analytics fetched'));
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get Reports (Unified orders and stats)
 */
async function getReports(req, res) {
  try {
    const orders = await db.query(`
      SELECT o.*, s.name as serviceName, u.name as userName
      FROM \`Order\` o
      JOIN Service s ON o.serviceId = s.id
      JOIN User u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT 100
    `);

    const documents = await db.query(`
      SELECT d.*, u.name as userName
      FROM Document d
      JOIN User u ON d.userId = u.id
      ORDER BY d.uploadedAt DESC
      LIMIT 100
    `);

    res.status(200).json(successResponse({ orders, documents }, 'Reports fetched'));
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Create user (Admin)
 */
async function createUser(req, res) {
  const { name, email, phone, pan, password, dateOfBirth, reference_number } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json(errorResponse('Name, email and password are required'));
  }

  try {
    const hashedPassword = await authService.hashPassword(password);
    
    // Generate Referral Code: GTW + first 3 of name + last 3 of mobile
    const namePart = (name || 'USR').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const phonePart = (phone || '000').slice(-3).padStart(3, '0');
    const referralCode = `GTW${namePart}${phonePart}`;
    
    const refNum = reference_number || `GTW${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

    const result = await db.query(`
      INSERT INTO User (
        name, email, phone, pan, password, 
        referral_code, reference_number, dateOfBirth, 
        role, status, created_by_admin, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'active', 1, NOW(), NOW())
    `, [
      name, email, phone, pan, hashedPassword, 
      referralCode, refNum, dateOfBirth || null
    ]);

    const [user] = await db.query('SELECT id, name, email, phone, pan, referral_code, reference_number, dateOfBirth FROM User WHERE id = ?', [result.insertId]);

    res.status(201).json(successResponse({ 
      user,
      credentials: {
        email: email,
        password: password // Return the raw password provided by admin
      }
    }, 'User created successfully'));
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Update user
 */
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, phone, pan, status } = req.body;
  try {
    await db.query(`
      UPDATE User 
      SET name = ?, email = ?, phone = ?, pan = ?, status = ?, updatedAt = NOW()
      WHERE id = ?
    `, [name, email, phone, pan, status, id]);
    res.status(200).json(successResponse(null, 'User updated'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Delete user
 */
async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM User WHERE id = ?', [id]);
    res.status(200).json(successResponse(null, 'User deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Reset User Password (Admin)
 */
async function resetPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json(errorResponse('New password is required'));
  }

  try {
    const hashedPassword = await authService.hashPassword(password);
    
    await db.query(
      'UPDATE User SET password = ?, updatedAt = NOW() WHERE id = ?',
      [hashedPassword, id]
    );

    res.status(200).json(successResponse(null, 'Password reset successfully'));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Export users (CSV)
 */
async function exportUsersCSV(req, res) {
  try {
    const users = await db.query("SELECT id, name, email, phone, pan, status, createdAt FROM User WHERE role = 'user'");
    const headers = ['ID', 'Name', 'Email', 'Phone', 'PAN', 'Status', 'CreatedAt'];
    const csv = [
      headers.join(','),
      ...users.map(u => [u.id, u.name, u.email, u.phone || '', u.pan || '', u.status, u.createdAt.toISOString()].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * FLOW 3: ADMIN UPDATES FILING STATUS
 */
async function updateFilingStatus(req, res) {
  const { userId, status } = req.body;
  if (!userId || !status) {
    return res.status(400).json(errorResponse('userId and status are required'));
  }

  try {
    await db.query(`
      UPDATE User 
      SET filingStatus = ?, updatedAt = NOW()
      WHERE id = ?
    `, [status, userId]);
    
    res.status(200).json(successResponse(null, 'Filing status updated to: ' + status));
  } catch (error) {
    console.error('Update filing status error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Adjust user points manually
 */
async function adjustPoints(req, res) {
  const { userId } = req.params;
  const { points, reason, type } = req.body; // type: 'credit' or 'debit'

  if (!points || !type) {
    return res.status(400).json(errorResponse('Points and type are required'));
  }

  try {
    const pointsVal = type === 'credit' ? Math.abs(points) : -Math.abs(points);
    
    // Update User wallet
    await db.query(
      "UPDATE User SET points_wallet = points_wallet + ?, updatedAt = NOW() WHERE id = ?",
      [pointsVal, userId]
    );

    // Record in history
    await db.query(
      "INSERT INTO PointsHistory (userId, points, type, reason, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [userId, Math.abs(points), type, reason || 'Manual adjustment']
    );

    res.status(200).json(successResponse(null, 'Points adjusted successfully'));
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get points history for a user
 */
async function getPointsHistory(req, res) {
  const { userId } = req.params;
  try {
    const history = await db.query(
      "SELECT * FROM PointsHistory WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    res.status(200).json(successResponse({ history }, 'Points history fetched'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get all redeem requests
 */
async function getRedeemRequests(req, res) {
  try {
    const requests = await db.query(`
      SELECT r.*, u.name as userName, u.email as userEmail
      FROM RedeemRequest r
      JOIN User u ON r.userId = u.id
      ORDER BY r.createdAt DESC
    `);
    res.status(200).json(successResponse({ requests }, 'Redeem requests fetched'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Approve or reject a redeem request
 */
async function approveRedeemRequest(req, res) {
  const { id } = req.params;
  const { status, adminReason } = req.body; // approved, rejected

  try {
    const request = await db.findOne('RedeemRequest', { id });
    if (!request) return res.status(404).json(errorResponse('Request not found'));

    if (status === 'approved') {
      // Points are already deducted when request is made (usually)
      // Here we just mark as approved
      await db.query(
        "UPDATE RedeemRequest SET status = 'approved', reason = ?, approvedAt = NOW(), updatedAt = NOW() WHERE id = ?",
        [adminReason, id]
      );
    } else {
      // If rejected, refund points? 
      // Depends on the flow. For now just mark as rejected.
      await db.query(
        "UPDATE RedeemRequest SET status = 'rejected', reason = ?, updatedAt = NOW() WHERE id = ?",
        [adminReason, id]
      );
      
      // Refund points to wallet
      await db.query(
        "UPDATE User SET points_wallet = points_wallet + ?, updatedAt = NOW() WHERE id = ?",
        [request.points_requested, request.userId]
      );
    }

    res.status(200).json(successResponse(null, `Request ${status}`));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getUsers,
  getAnalytics,
  getReports,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  exportUsersCSV,
  exportUsersExcel: exportUsersCSV,
  updateFilingStatus,
  adjustPoints,
  getPointsHistory,
  getRedeemRequests,
  approveRedeemRequest
};