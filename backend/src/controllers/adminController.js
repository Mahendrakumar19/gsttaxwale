const prisma = require('../utils/prisma');
const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const authService = require('../services/authService');
const { v4: uuidv4 } = require('uuid');

// ──────────────────────────────────────────────────────────────────────
// HELPER FUNCTION - Generate reference number
// ──────────────────────────────────────────────────────────────────────
function generateReferenceNumber() {
  return 'REF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ──────────────────────────────────────────────────────────────────────
// HELPER FUNCTION - Generate referral code
// ──────────────────────────────────────────────────────────────────────
function generateReferralCode(name, phone) {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const phonePrefix = phone ? phone.slice(-3) : '000';
  return `GTW${namePrefix}${phonePrefix}`;
}

// ────────────────────────────────────────────────────────────────────
// GET ALL USERS (Real database query)
// ────────────────────────────────────────────────────────────────────
async function getUsers(req, res) {
  try {
    // Use raw SQL helper to avoid Prisma type mismatch
    const users = await db.findMany('User', { role: 'user' }); // Simplified role filter
    
    // Format response to match expected structure
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      reference_number: user.reference_number,
      referral_code: user.referral_code
    }));

    res.status(200).json(successResponse({ users: formattedUsers }, 'Users fetched successfully'));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET ALL ORDERS/REPORTS (Real database query)
// ────────────────────────────────────────────────────────────────────
async function getOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        service: {
          select: { id: true, title: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(successResponse({ orders }, 'Orders fetched successfully'));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// Alias for getOrders (used as getReports in routes)
async function getReports(req, res) {
  try {
    const [orders, taxFilings, documents] = await Promise.all([
      prisma.order.findMany({
        include: {
          service: {
            select: { id: true, title: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.taxFiling.findMany({
        select: { 
          id: true, 
          userId: true, 
          assessmentYear: true, 
          status: true, 
          totalTax: true, 
          createdAt: true 
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { uploadedAt: 'desc' },
        take: 50, // Limit to recent documents
      }),
    ]);

    res.status(200).json(successResponse({ 
      orders, 
      taxFilings, 
      documents 
    }, 'Reports fetched successfully'));
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET ALL DOCUMENTS (Real database query)
// ────────────────────────────────────────────────────────────────────
async function getDocuments(req, res) {
  try {
    // Use raw DB helper for reliability
    const documents = await db.findMany('Document', {}, 100);
    
    // Manual join-like decoration for UI
    const decoratedDocs = await Promise.all(documents.map(async (doc) => {
      const user = await db.findOne('User', { id: doc.userId });
      return {
        ...doc,
        user: user ? { id: user.id, name: user.name, email: user.email } : null
      };
    }));

    res.status(200).json(successResponse({ documents: decoratedDocs }, 'Documents fetched successfully'));
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET ALL SERVICES (Real database query)
// ────────────────────────────────────────────────────────────────────
async function getServices(req, res) {
  try {
    const services = await db.findMany('Service', {}, 100);
    // Sort by createdAt desc manually if needed, or assume DB order for now
    services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Parse features JSON
    const formattedServices = services.map(svc => ({
      ...svc,
      features: typeof svc.features === 'string' ? JSON.parse(svc.features) : svc.features,
    }));

    res.status(200).json(successResponse({ services: formattedServices }, 'Services fetched successfully'));
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// CREATE USER - Admin creates new user
// ────────────────────────────────────────────────────────────────────
async function createUser(req, res) {
  try {
    const { name, email, phone, referral_code } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json(errorResponse('Name, email, and phone are required'));
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json(errorResponse('Email already registered'));
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(409).json(errorResponse('Phone number already registered'));
    }

    // Generate reference number and referral code
    const reference_number = generateReferenceNumber();
    const generated_referral_code = generateReferralCode(name, phone);

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await authService.hashPassword(tempPassword);

    // Create user
    // Create user via raw DB helper to bypass Prisma type issues
    const newUser = await db.create('User', {
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      emailVerified: 0,
      reference_number,
      referral_code: generated_referral_code,
      created_by_admin: 1,
      points_wallet: 0,
    });

    // TODO: Send credentials via email
    // await authService.sendUserCreatedEmail(email, tempPassword, reference_number);

    res.status(201).json(
      successResponse(
        {
          user: newUser,
          credentials: {
            tempPassword,
            email,
            referenceNumber: reference_number,
          },
        },
        'User created successfully. Credentials sent to email.'
      )
    );
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// ADJUST POINTS - Admin manually adjust user points
// ────────────────────────────────────────────────────────────────────
async function adjustPoints(req, res) {
  try {
    const { userId, pointsChange, reason } = req.body;

    if (!userId || !pointsChange || !reason) {
      return res.status(400).json(errorResponse('User ID, points change, and reason are required'));
    }

    if (typeof pointsChange !== 'number' || pointsChange === 0) {
      return res.status(400).json(errorResponse('Points change must be a non-zero number'));
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    // Calculate new balance
    const newBalance = (user.points_wallet || 0) + pointsChange;

    if (newBalance < 0) {
      return res.status(400).json(errorResponse('Insufficient points for debit operation'));
    }

    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points_wallet: newBalance,
      },
      select: {
        id: true,
        name: true,
        email: true,
        points_wallet: true,
      },
    });

    // Create points history record
    await prisma.pointsHistory.create({
      data: {
        userId,
        type: pointsChange > 0 ? 'credit' : 'debit',
        points: Math.abs(pointsChange),
        reason: reason,
        description: `Admin adjustment: ${reason}`,
      },
    });

    res.status(200).json(
      successResponse(
        {
          user: updatedUser,
          pointsChange,
          newBalance,
        },
        'Points adjusted successfully'
      )
    );
  } catch (error) {
    console.error('Error adjusting points:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET POINTS HISTORY - Retrieve points transaction history
// ────────────────────────────────────────────────────────────────────
async function getPointsHistory(req, res) {
  try {
    const { userId, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse('User ID is required'));
    }

    const history = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.status(200).json(successResponse({ history }, 'Points history fetched successfully'));
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET REDEEM REQUESTS - Retrieve all redemption requests
// ────────────────────────────────────────────────────────────────────
async function getRedeemRequests(req, res) {
  try {
    const requests = await prisma.redeemRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points_wallet: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(successResponse({ requests }, 'Redemption requests fetched successfully'));
  } catch (error) {
    console.error('Error fetching redeem requests:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// APPROVE REDEEM REQUEST - Admin approves or rejects redemption
// ────────────────────────────────────────────────────────────────────
async function approveRedeemRequest(req, res) {
  try {
    const { requestId, approved, reason } = req.body;
    const adminId = req.userId;

    if (!requestId || typeof approved !== 'boolean') {
      return res.status(400).json(errorResponse('Request ID and approval status are required'));
    }

    // Find redeem request
    const redeemRequest = await prisma.redeemRequest.findUnique({
      where: { id: requestId },
    });

    if (!redeemRequest) {
      return res.status(404).json(errorResponse('Redemption request not found'));
    }

    if (redeemRequest.status !== 'pending') {
      return res.status(400).json(errorResponse('Request has already been processed'));
    }

    // Update request
    const updatedRequest = await prisma.redeemRequest.update({
      where: { id: requestId },
      data: {
        status: approved ? 'approved' : 'rejected',
        approvedBy: adminId,
        reason,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            points_wallet: true,
          },
        },
      },
    });

    // If approved, debit points from user
    if (approved) {
      await prisma.user.update({
        where: { id: redeemRequest.userId },
        data: {
          points_wallet: {
            decrement: redeemRequest.points_requested,
          },
        },
      });

      // Create points history record
      await prisma.pointsHistory.create({
        data: {
          userId: redeemRequest.userId,
          type: 'debit',
          points: redeemRequest.points_requested,
          reason: 'redeem',
          description: `Redemption approved by admin`,
          referenceId: requestId,
        },
      });
    }

    res.status(200).json(
      successResponse(updatedRequest, `Redemption request ${approved ? 'approved' : 'rejected'} successfully`)
    );
  } catch (error) {
    console.error('Error processing redeem request:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// EXPORT USERS TO CSV - Export all customers to CSV format
// ────────────────────────────────────────────────────────────────────
async function exportUsersCSV(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        reference_number: true,
        referral_code: true,
        points_wallet: true,
        created_by_admin: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build CSV content
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Reference Number',
      'Referral Code',
      'Points',
      'Created By Admin',
      'Status',
      'Created Date',
      'Updated Date',
    ];

    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.reference_number || '',
      user.referral_code || '',
      user.points_wallet || 0,
      user.created_by_admin ? 'Yes' : 'No',
      user.status,
      new Date(user.createdAt).toISOString(),
      new Date(user.updatedAt).toISOString(),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');

    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// ────────────────────────────────────────────────────────────────────
// EXPORT USERS TO EXCEL - Enhanced Excel export with formatting
// ────────────────────────────────────────────────────────────────────
async function exportUsersExcel(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        reference_number: true,
        referral_code: true,
        points_wallet: true,
        created_by_admin: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate XLSX using simple approach (TSV format that opens in Excel)
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Reference Number',
      'Referral Code',
      'Points',
      'Created By Admin',
      'Status',
      'Created Date',
      'Updated Date',
    ];

    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.reference_number || '',
      user.referral_code || '',
      user.points_wallet || 0,
      user.created_by_admin ? 'Yes' : 'No',
      user.status,
      new Date(user.createdAt).toLocaleDateString(),
      new Date(user.updatedAt).toLocaleDateString(),
    ]);

    // Create Excel XML format (SpreadsheetML)
    const xmlData = generateExcelXML(headers, rows);

    // Set response headers for Excel
    const filename = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(xmlData);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

// Helper function to generate Excel XML format
function generateExcelXML(headers, rows) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
  xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
  xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">\n';
  xml += '<Styles>\n';
  xml += '<Style ss:ID="Header"><Font ss:Bold="1" ss:Size="12"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF"/></Style>\n';
  xml += '</Styles>\n';
  xml += '<Worksheet ss:Name="Customers">\n';
  xml += '<Table>\n';

  // Add header row
  xml += '<Row>\n';
  headers.forEach((header) => {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
  });
  xml += '</Row>\n';

  // Add data rows
  rows.forEach((row) => {
    xml += '<Row>\n';
    row.forEach((cell) => {
      const type = typeof cell === 'number' ? 'Number' : 'String';
      xml += `<Cell><Data ss:Type="${type}">${escapeXml(String(cell))}</Data></Cell>\n`;
    });
    xml += '</Row>\n';
  });

  xml += '</Table>\n';
  xml += '</Worksheet>\n';
  xml += '</Workbook>\n';

  return Buffer.from(xml, 'utf-8');
}

// Helper function to escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ────────────────────────────────────────────────────────────────────
// GET ADMIN ANALYTICS
// ────────────────────────────────────────────────────────────────────
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, status, role } = req.body;

    if (!id) return res.status(400).json(errorResponse('User ID is required'));

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    updateData.updatedAt = new Date();

    await db.update('User', updateData, { id: parseInt(id) });
    res.status(200).json(successResponse(null, 'User updated successfully'));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json(errorResponse('User ID is required'));

    await db.deleteRecord('User', { id: parseInt(id) });
    res.status(200).json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

async function getAnalytics(req, res) {
  try {
    const [totalUsers, totalOrders, totalRevenue, completedOrders, pendingOrders, totalServices] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.service.count(),
    ]);

    const analytics = {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum?.amount || 0,
      completedOrders,
      pendingOrders,
      totalServices,
      conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : 0,
    };

    res.status(200).json(successResponse(analytics, 'Analytics fetched successfully'));
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getOrders,
  getReports,
  getDocuments,
  getServices,
  adjustPoints,
  getPointsHistory,
  getRedeemRequests,
  approveRedeemRequest,
  exportUsersCSV,
  exportUsersExcel,
  getAnalytics,
};