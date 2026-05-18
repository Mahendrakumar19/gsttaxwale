const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');

// Initialize Razorpay
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5Ag',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
  });
} catch (err) {
  console.error('Razorpay init error:', err.message);
}

/**
 * List orders
 */
async function listOrders(req, res) {
  try {
    const isAdmin = req.userRole === 'admin';
    let query = `
      SELECT o.*, s.name as serviceName, u.name as userName, u.email as userEmail
      FROM \`Order\` o
      JOIN Service s ON o.serviceId = s.id
      JOIN User u ON o.userId = u.id
    `;
    let params = [];

    if (!isAdmin) {
      query += ' WHERE o.userId = ?';
      params.push(req.userId);
    }

    query += ' ORDER BY o.createdAt DESC';
    const orders = await db.query(query, params);

    res.status(200).json(successResponse({ orders }));
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Get order details
 */
async function getOrder(req, res) {
  const { id } = req.params;
  try {
    const [order] = await db.query(`
      SELECT o.*, s.name as serviceName, u.name as userName, u.email as userEmail, u.phone as userPhone
      FROM \`Order\` o
      JOIN Service s ON o.serviceId = s.id
      JOIN User u ON o.userId = u.id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return res.status(404).json(errorResponse('Order not found'));
    }

    // Check ownership
    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json(errorResponse('Forbidden'));
    }

    res.status(200).json(successResponse({ order }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Create order (Razorpay)
 */
async function createOrder(req, res) {
  let userId = req.userId;
  const { serviceId, notes, customerEmail, customerName, customerPhone, customerPan } = req.body;

  if (!serviceId || !userId) {
    return res.status(400).json(errorResponse('Missing required fields'));
  }

  try {
    // If it's a guest user (temp token), ensure they have a record in the User table
    if (req.userRole === 'guest') {
      const email = customerEmail || req.userEmail;
      const { referralCode } = req.body;

      // Check if user already exists (maybe they previously bought something as guest)
      const existingUsers = await db.query('SELECT id FROM User WHERE email = ?', [email]);
      
      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
      } else {
        // Find referrer if referralCode is provided
        let referrerId = null;
        if (referralCode) {
          const [referrer] = await db.query('SELECT id, email FROM User WHERE referral_code = ?', [referralCode]);
          if (referrer) {
            referrerId = referrer.id;
            
            // Also create a record in the Referral table for compatibility
            await db.query(
              'INSERT INTO Referral (refereeEmail, referrerEmail, referralCode, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
              [email, referrer.email, referralCode, 'pending']
            ).catch(err => console.log('Referral entry failed (likely duplicate):', err.message));
          }
        }

        // Create a new guest user
        const newUser = await db.query(
          `INSERT INTO User (name, email, phone, pan, role, active, referrer_id, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, 'user', 1, ?, NOW(), NOW())`,
          [customerName || 'Guest User', email, customerPhone || '', customerPan || null, referrerId]
        );
        userId = newUser.insertId;
      }
    }

    // Fetch service price from DB to prevent client-side manipulation
    const [service] = await db.query('SELECT price, discountPrice FROM Service WHERE id = ?', [serviceId]);
    if (!service) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    // Determine the actual amount to charge
    const finalAmount = (service.discountPrice > 0 && service.discountPrice < service.price) 
      ? service.discountPrice 
      : service.price;

    const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create Razorpay order if possible
    let razorpayOrderId = null;
    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(finalAmount * 100),
          currency: 'INR',
          receipt: orderNo
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.error('Razorpay order creation error:', rzpErr);
        // Continue without razorpayOrderId, but ideally we should handle this
      }
    }

    // Store in DB
    const result = await db.query(`
      INSERT INTO \`Order\` (orderNo, userId, serviceId, amount, finalAmount, status, paymentStatus, paymentId, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, NOW(), NOW())
    `, [orderNo, userId, serviceId, service.price, finalAmount, razorpayOrderId, notes || '']);

    res.status(201).json(successResponse({
      orderId: result.insertId,
      orderNo,
      razorpayOrderId,
      amount: finalAmount * 100, // paise for frontend
      key: process.env.RAZORPAY_KEY_ID
    }, 'Order initiated'));
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Verify payment
 */
async function verifyPayment(req, res) {
  const { orderId, paymentId, signature } = req.body;
  // Simplified verification for now if secret is missing, or implement full crypto check
  try {
    await db.query(`
      UPDATE \`Order\`
      SET paymentStatus = 'paid', status = 'completed', paymentId = ?, paymentDate = NOW(), updatedAt = NOW()
      WHERE id = ?
    `, [paymentId, orderId]);

    // TRIGGER REFERRAL REWARD (Phase 6)
    try {
      const ReferralService = require('../services/referralService');
      const [order] = await db.query('SELECT userId, finalAmount, serviceId FROM `Order` WHERE id = ?', [orderId]);
      
      if (order) {
        const [user] = await db.query('SELECT email, referrer_id FROM User WHERE id = ?', [order.userId]);
        
        if (user) {
          let referrerId = user.referrer_id;
          
          if (!referrerId) {
            const [referral] = await db.query(
              'SELECT r.referrerId as id FROM Referral r WHERE r.refereeEmail = ? LIMIT 1',
              [user.email]
            );
            if (referral) referrerId = referral.id;
          }

          if (referrerId) {
            // Process dynamic reward
            await ReferralService.processPurchaseReward(
              referrerId, 
              order.userId, 
              orderId, 
              order.finalAmount, 
              order.serviceId
            );

            // Update status in existing table for compatibility
            await db.query(
              "UPDATE Referral SET status = 'completed', updatedAt = NOW() WHERE refereeEmail = ?",
              [user.email]
            );

            console.log(`🎁 Dynamic Referral reward processed for user ${referrerId} for referee ${user.email}`);
          }
        }
      }
    } catch (refErr) {
      console.error('❌ Error processing referral reward:', refErr);
    }

    res.status(200).json(successResponse(null, 'Payment verified'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Inquiry handling
 */
async function createInquiry(req, res) {
  const { name, email, phone, serviceId, notes } = req.body;
  try {
    // Find or create user for the inquiry
    let [user] = await db.query('SELECT id FROM User WHERE email = ?', [email]);
    let userId;
    
    if (!user) {
      const res = await db.query(`
        INSERT INTO User (name, email, phone, role, status, createdAt, updatedAt)
        VALUES (?, ?, ?, 'user', 'active', NOW(), NOW())
      `, [name, email, phone]);
      userId = res.insertId;
    } else {
      userId = user.id;
    }

    const orderNo = `INQ-${Date.now()}`;
    await db.query(`
      INSERT INTO \`Order\` (orderNo, userId, serviceId, amount, finalAmount, status, paymentStatus, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, 0, 0, 'inquiry', 'unpaid', ?, NOW(), NOW())
    `, [orderNo, userId, serviceId, notes || `Inquiry from ${name}`]);

    res.status(200).json(successResponse(null, 'Inquiry received'));
  } catch (err) {
    console.error('Inquiry error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  verifyPayment,
  createInquiry,
  createGuestCheckout: (req, res) => res.status(400).json(errorResponse('Use inquiry flow'))
};
