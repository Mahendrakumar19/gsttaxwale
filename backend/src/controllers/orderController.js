const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/helpers');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay with proper error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_3xTyUrGlyCxrLB',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '5FjsZMf9b0x2KnY7pQwR4vL8aUjT1mN6',
  });
  console.log('✅ Razorpay initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Razorpay:', err.message);
}

// In-memory orders store (TODO: migrate to database)
let orders = [];

/**
 * Create an order with Razorpay
 * Handles both guest and authenticated users
 */
async function createOrder(req, res) {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return res.status(500).json(errorResponse('Payment gateway not available. Please try again later.'));
    }

    const { 
      serviceId, 
      amount, 
      description = '',
      customerEmail = 'customer@example.com',
      customerName = 'Guest',
      customer = {} 
    } = req.body;
    
    console.log('📦 Order creation request:', { serviceId, amount, customerEmail, customerName });
    
    if (!serviceId || !amount) {
      return res.status(400).json(errorResponse('Service ID and amount are required'));
    }

    // Validate amount (minimum 1 rupee = 100 paise)
    const amountInPaise = Math.round(Number(amount)) || 0;
    if (amountInPaise < 100) {
      return res.status(400).json(errorResponse('Amount must be at least ₹1'));
    }

    try {
      console.log(`🔄 Creating Razorpay order for amount: ${amountInPaise} paise`);
      
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${uuidv4().slice(0, 8)}`,
        description: description || `Service ${serviceId}`,
        notes: {
          serviceId,
          customerName,
          customerEmail,
        },
      });

      if (!razorpayOrder || !razorpayOrder.id) {
        console.error('❌ Razorpay order creation failed:', razorpayOrder);
        throw new Error('Invalid response from Razorpay - no order ID returned');
      }

      // Store order locally (should be in DB)
      const order = {
        id: uuidv4(),
        serviceId,
        amount: amountInPaise / 100, // Store in rupees for display
        amountInPaise,
        status: 'pending',
        userId: req.userId || null,
        customer: {
          name: customerName || customer.name || 'Guest',
          email: customerEmail || customer.email || 'customer@example.com',
          phone: customer.phone || '',
        },
        razorpayOrderId: razorpayOrder.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.unshift(order);
      console.log(`✅ Order created: ${order.id} | Razorpay: ${razorpayOrder.id}`);

      return res.status(201).json(
        successResponse(
          { 
            orderId: order.id, 
            razorpayOrderId: razorpayOrder.id,
            amount: order.amountInPaise,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_live_3xTyUrGlyCxrLB',
          },
          'Order created successfully'
        )
      );
    } catch (razorpayErr) {
      console.error('❌ Razorpay API Error:', razorpayErr.message);
      return res.status(500).json(
        errorResponse(`Razorpay error: ${razorpayErr.message}`)
      );
    }
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Get all orders
 * Returns all orders if admin, or user's orders if authenticated
 */
async function listOrders(req, res) {
  try {
    const isAdmin = req.userRole === 'admin';
    if (isAdmin) {
      return res.status(200).json(successResponse({ orders }));
    }
    if (!req.userId) {
      return res.status(401).json(errorResponse('Authentication required', 401));
    }
    const userOrders = orders.filter((o) => o.userId === req.userId);
    res.status(200).json(successResponse({ orders: userOrders }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Get single order by ID
 */
async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json(errorResponse('Order not found', 404));
    }
    
    // Check permissions
    if (order.userId && order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json(errorResponse('Forbidden', 403));
    }
    
    res.status(200).json(successResponse({ order }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

/**
 * Verify Razorpay payment signature
 */
async function verifyPayment(req, res) {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json(
        errorResponse('Order ID, Payment ID, and Signature are required')
      );
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json(errorResponse('Order not found', 404));
    }

    try {
      // Verify signature using Razorpay's method
      const secret = process.env.RAZORPAY_KEY_SECRET || '5FjsZMf9b0x2KnY7pQwR4vL8aUjT1mN6';
      const body = order.razorpayOrderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('❌ Invalid payment signature for order:', orderId);
        return res.status(400).json(
          errorResponse('Invalid payment signature - verification failed')
        );
      }

      // Verify with Razorpay API as well
      try {
        const payment = await razorpay.payments.fetch(paymentId);
        
        if (payment.status !== 'captured') {
          return res.status(400).json(
            errorResponse(`Payment status is ${payment.status}, expected captured`)
          );
        }

        // Mark order as paid
        order.status = 'paid';
        order.payment = {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          verifiedAt: new Date().toISOString(),
          method: payment.method,
          fee: payment.fee,
          tax: payment.tax,
        };
        order.updatedAt = new Date().toISOString();

        console.log(`✅ Payment verified for order ${orderId}, payment ${paymentId}`);

        return res.status(200).json(
          successResponse(
            { order, payment },
            'Payment verified successfully'
          )
        );
      } catch (razorpayErr) {
        console.warn('⚠️  Could not verify with Razorpay API, signature valid:', razorpayErr.message);
        // Signature is valid, mark as paid anyway
        order.status = 'paid';
        order.payment = {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          verifiedAt: new Date().toISOString(),
        };
        order.updatedAt = new Date().toISOString();
        
        return res.status(200).json(
          successResponse({ order }, 'Payment verified successfully (signature valid)')
        );
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      return res.status(500).json(errorResponse('Payment verification failed'));
    }
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  verifyPayment,
};
