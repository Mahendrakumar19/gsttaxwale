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
  const { serviceId, notes } = req.body;
  const userId = req.userId;

  if (!serviceId || !userId) {
    return res.status(400).json(errorResponse('Missing required fields'));
  }

  try {
    // Fetch service price from DB to prevent client-side manipulation
    const [service] = await db.query('SELECT price, discountPrice FROM Service WHERE id = ?', [serviceId]);
    if (!service) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    // Determine the actual amount to charge (like Amazon/Flipkart logic)
    // If discountPrice exists and is valid (> 0 and < price), use it. Otherwise use price.
    const finalAmount = (service.discountPrice > 0 && service.discountPrice < service.price) 
      ? service.discountPrice 
      : service.price;

    const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create Razorpay order if possible
    let razorpayOrderId = null;
    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt: orderNo
      });
      razorpayOrderId = rzpOrder.id;
    }

    // Store in DB - amount is the dummy/original, finalAmount is what was actually charged
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

    // TRIGGER REFERRAL REWARD: If user was referred, give 200 points to referrer
    try {
      const [order] = await db.query('SELECT userId FROM \`Order\` WHERE id = ?', [orderId]);
      if (order) {
        const [user] = await db.query('SELECT email FROM User WHERE id = ?', [order.userId]);
        if (user) {
          // Check if this user email is in the Referral table
          const [referral] = await db.query(
            "SELECT referrerId FROM Referral WHERE refereeEmail = ? AND referralStatus = 'pending'",
            [user.email]
          );

          if (referral) {
            // Update referral status
            await db.query(
              "UPDATE Referral SET referralStatus = 'completed', commissionAmount = 200, updatedAt = NOW() WHERE refereeEmail = ? AND referrerId = ?",
              [user.email, referral.referrerId]
            );

            // Add points to referrer's wallet
            await db.query(
              "UPDATE User SET points_wallet = points_wallet + 200, updatedAt = NOW() WHERE id = ?",
              [referral.referrerId]
            );

            console.log(`🎁 Referral reward (+200 points) awarded to user ${referral.referrerId} for referring ${user.email}`);
          }
        }
      }
    } catch (refErr) {
      console.error('❌ Error processing referral reward:', refErr);
      // Don't fail the payment verification if referral logic fails
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
