const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const authService = require('../services/authService');
const adminEmail = require('../services/adminEmailService');

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
    const [referralStats] = await db.query("SELECT COUNT(*) as totalReferrals FROM Referral");

    // 1. Calculate rate percentages
    const [resolvedTicketStats] = await db.query("SELECT COUNT(*) as count FROM SupportTicket WHERE status = 'resolved' OR status = 'closed'");
    const [allOrderStats] = await db.query("SELECT COUNT(*) as count FROM \`Order\`");
    const [activeReferralStats] = await db.query("SELECT COUNT(*) as count FROM Referral WHERE referralStatus = 'active' OR referralStatus = 'completed'");

    const ticketResolutionRate = ticketStats?.totalTickets > 0 
      ? Math.round(((resolvedTicketStats?.count || 0) / ticketStats.totalTickets) * 100) 
      : 0;

    const paidOrderRate = allOrderStats?.count > 0 
      ? Math.round(((orderStats?.totalOrders || 0) / allOrderStats.count) * 100) 
      : 0;

    const referralConversionRate = referralStats?.totalReferrals > 0 
      ? Math.round(((activeReferralStats?.count || 0) / referralStats.totalReferrals) * 100) 
      : 0;

    // 2. Fetch top 4 services breakdown (with fallback if 0 orders exist)
    const topServices = await db.query(`
      SELECT s.name, COUNT(o.id) as count
      FROM Service s
      LEFT JOIN \`Order\` o ON o.serviceId = s.id
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 4
    `);

    // 3. Fetch task checklists (recent pending items)
    const recentPendingTickets = await db.query(`
      SELECT id, subject as title, category, status, createdAt 
      FROM SupportTicket 
      WHERE status = 'open' 
      ORDER BY createdAt DESC 
      LIMIT 3
    `);

    const recentPendingOrders = await db.query(`
      SELECT o.id, s.name as serviceName, o.status, o.createdAt 
      FROM \`Order\` o 
      JOIN Service s ON o.serviceId = s.id 
      WHERE o.status = 'pending' 
      ORDER BY o.createdAt DESC 
      LIMIT 3
    `);

    const analytics = {
      totalUsers: userStats?.totalUsers || 0,
      totalOrders: orderStats?.totalOrders || 0,
      totalRevenue: Number(orderStats?.totalRevenue) || 0,
      pendingOrders: pendingStats?.pendingOrders || 0,
      totalServices: serviceStats?.totalServices || 0,
      totalDocuments: docStats?.totalDocuments || 0,
      totalTickets: ticketStats?.totalTickets || 0,
      totalVisitors: visitorStats ? Number(visitorStats.value) : 0,
      totalReferrals: referralStats?.totalReferrals || 0,
      conversionRate: userStats?.totalUsers > 0 ? ((orderStats?.totalOrders / userStats.totalUsers) * 100).toFixed(2) : 0,
      
      // Extended fields for the new design
      rates: {
        tickets: ticketResolutionRate,
        orders: paidOrderRate,
        referrals: referralConversionRate
      },
      topServices,
      pendingTasks: {
        tickets: recentPendingTickets || [],
        orders: recentPendingOrders || []
      }
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
      ORDER BY d.createdAt DESC
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
    
    // Generate Referral Code: GTW + first 3 letters of FIRST NAME + last 4 digits of mobile
    // e.g. 'Mahendra Kumar' + '7894561230' → GTWMAH1230
    const firstName = (name || 'USR').trim().split(/\s+/)[0];
    const namePart = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
    const phonePart = (phone || '0000').replace(/\D/g, '').slice(-4).padStart(4, '0');
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

    // Send account created email with full credentials
    adminEmail.sendAccountCreatedEmail(email, name, password, refNum, referralCode)
      .then(ok => console.log(ok ? `📧 Account email sent → ${email}` : `📧 Account email failed → ${email}`))
      .catch(() => {});

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
 * Update user (Admin)
 */
async function updateUser(req, res) {
  const { id } = req.params;
  const { 
    name, email, phone, pan, aadhaar, 
    doorNo, buildingName, street, area, address, 
    city, state, pincode, status, role, referral_code 
  } = req.body;

  try {
    await db.query(`
      UPDATE User 
      SET 
        name = ?, email = ?, phone = ?, pan = ?, aadhaar = ?,
        doorNo = ?, buildingName = ?, street = ?, area = ?, address = ?,
        city = ?, state = ?, pincode = ?, status = ?, role = ?, 
        referral_code = ?, updatedAt = NOW()
      WHERE id = ?
    `, [
      name, email, phone, pan, aadhaar,
      doorNo, buildingName, street, area, address,
      city, state, pincode, status, role, 
      referral_code, id
    ]);
    
    // Fetch updated user for email notification
    const [updatedUser] = await db.query('SELECT email, name, status FROM User WHERE id = ?', [id]);
    if (updatedUser) {
      // Profile update email
      adminEmail.sendProfileUpdatedEmail(updatedUser.email, updatedUser.name)
        .catch(() => {});
      // Extra: if status was changed, also send a status change email
      if (status) {
        adminEmail.sendStatusChangedEmail(updatedUser.email, updatedUser.name, status)
          .catch(() => {});
      }
    }

    res.status(200).json(successResponse(null, 'User details updated successfully'));
  } catch (error) {
    console.error('Update user error:', error);
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

    // Send password reset email with new password
    const [user] = await db.query('SELECT email, name FROM User WHERE id = ?', [id]);
    if (user) {
      adminEmail.sendPasswordResetEmail(user.email, user.name, password)
        .catch(() => {});
    }

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
      // 1. Mark RedeemRequest as approved
      await db.query(
        "UPDATE RedeemRequest SET status = 'approved', reason = ?, approvedAt = NOW(), updatedAt = NOW() WHERE id = ?",
        [adminReason || '', id]
      );

      // 2. Mark the debit transaction in ledger as approved
      await db.query(
        "UPDATE wallet_transactions SET status = 'approved', description = CONCAT(description, ' - Approved: ', ?) WHERE reference_id = ? AND source = 'redemption'",
        [adminReason || 'Approved by admin', id]
      );
    } else {
      // 1. Mark RedeemRequest as rejected
      await db.query(
        "UPDATE RedeemRequest SET status = 'rejected', reason = ?, updatedAt = NOW() WHERE id = ?",
        [adminReason || '', id]
      );

      // 2. Mark the debit transaction in ledger as rejected (to cancel the debit effect in balance calculation)
      await db.query(
        "UPDATE wallet_transactions SET status = 'rejected', description = CONCAT(description, ' - Rejected: ', ?) WHERE reference_id = ? AND source = 'redemption'",
        [adminReason || 'Rejected by admin', id]
      );

      // 3. Refund points back using WalletService.credit
      const WalletService = require('../services/walletService');
      await WalletService.credit(
        request.userId,
        request.points_requested,
        'redemption_refund',
        id,
        `Refund for rejected redemption request (ID: ${id}): ${adminReason || 'N/A'}`
      );
    }

    // 3. Auto-resolve/close corresponding SupportTicket
    try {
      const prisma = require('../utils/prisma');
      // Find the open/pending redemption ticket for this user
      const tickets = await prisma.supportTicket.findMany({
        where: {
          userId: request.userId,
          category: 'redemption',
          status: { not: 'resolved' }
        }
      });

      for (const ticket of tickets) {
        // If the ticket description contains our RedeemRequest ID, or if it's the only ticket
        if (ticket.description.includes(`Redeem Request ID: ${id}`) || tickets.length === 1) {
          await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: {
              status: status === 'approved' ? 'resolved' : 'closed',
              resolution: `Redeem request was ${status} by admin. Reason: ${adminReason || 'N/A'}`,
              resolvedAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`🎫 Auto-updated SupportTicket #${ticket.id} status to ${status === 'approved' ? 'resolved' : 'closed'}`);
        }
      }
    } catch (ticketError) {
      console.error('⚠️ Failed to auto-update corresponding support ticket:', ticketError);
    }

    res.status(200).json(successResponse(null, `Request ${status}`));
  } catch (error) {
    console.error('❌ Error processing redeem request action:', error);
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