const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get all customers (admin only)
 */
async function getAllCustomers(req, res) {
  try {
    const customers = await db.query(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        pan, 
        city, 
        state, 
        status, 
        filingStatus,
        referral_code as referralCode,
        createdAt
      FROM User 
      WHERE role = 'user' 
      ORDER BY createdAt DESC
    `);

    // For each customer, get order counts
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const [orderStats] = await db.query(
        'SELECT COUNT(*) as orderCount, SUM(finalAmount) as totalSpent FROM `Order` WHERE userId = ?',
        [customer.id]
      );
      
      return {
        ...customer,
        _count: {
          orders: orderStats?.orderCount || 0
        },
        totalSpent: orderStats?.totalSpent || 0
      };
    }));

    res.status(200).json(successResponse({ customers: customersWithStats }, 'Customers fetched'));
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get customer details (admin only)
 */
async function getCustomerDetails(req, res) {
  const { id } = req.params;

  try {
    const [customer] = await db.query('SELECT * FROM User WHERE id = ?', [id]);

    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    // Get orders
    const orders = await db.query('SELECT * FROM `Order` WHERE userId = ? ORDER BY createdAt DESC', [id]);
    
    // Get documents
    const documents = await db.query('SELECT * FROM Document WHERE userId = ? ORDER BY uploadedAt DESC', [id]);

    // Calculate stats
    const totalPaid = orders.reduce((sum, p) => sum + (p.paymentStatus === 'paid' ? p.finalAmount : 0), 0);
    const totalOrders = orders.length;

    res.status(200).json(successResponse({ 
      customer: {
        ...customer,
        orders,
        documents
      },
      stats: {
        totalPaid,
        totalOrders,
        totalDocuments: documents.length
      }
    }, 'Customer details fetched'));
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Search customers (admin)
 */
async function searchCustomers(req, res) {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json(errorResponse('Query must be at least 2 characters'));
  }

  try {
    const customers = await db.query(`
      SELECT id, name, email, phone, pan, city, status, filingStatus, referral_code as referralCode, createdAt
      FROM User
      WHERE role = 'user' AND (
        name LIKE ? OR 
        email LIKE ? OR 
        phone LIKE ? OR 
        pan LIKE ?
      )
      LIMIT 20
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    res.status(200).json(successResponse({ customers }, 'Search results fetched'));
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Get customer by email
 */
async function getCustomerByEmail(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json(errorResponse('Email is required'));
  }

  try {
    const [customer] = await db.query('SELECT * FROM User WHERE email = ?', [email]);

    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    // Get basic stats
    const [stats] = await db.query(
      'SELECT COUNT(*) as count FROM `Order` WHERE userId = ?',
      [customer.id]
    );

    res.status(200).json(successResponse({ 
      customer: {
        ...customer,
        orderCount: stats?.count || 0
      }
    }, 'Customer fetched'));
  } catch (error) {
    console.error('Get customer by email error:', error);
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getAllCustomers,
  getCustomerDetails,
  searchCustomers,
  getCustomerByEmail
};
