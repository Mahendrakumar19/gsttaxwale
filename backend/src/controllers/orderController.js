const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/helpers');

// In-memory orders store (replace with DB-backed orders)
let orders = [];

// Create an order (guest or authenticated)
async function createOrder(req, res) {
  try {
    const { serviceId, amount, customer = {} } = req.body;
    const order = {
      id: uuidv4(),
      serviceId,
      amount: Number(amount) || 0,
      status: 'pending',
      userId: req.userId || null,
      customer,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    res.status(201).json(successResponse({ order }, 'Order created'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

// Return orders for current user (or all for admin)
async function listOrders(req, res) {
  try {
    const isAdmin = req.userId === '2';
    if (isAdmin) {
      return res.status(200).json(successResponse({ orders }));
    }
    const userOrders = orders.filter((o) => o.userId === req.userId);
    res.status(200).json(successResponse({ orders: userOrders }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

// Get single order
async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = orders.find((o) => o.id === id);
    if (!order) return res.status(404).json(errorResponse('Order not found', 404));
    if (!req.isAdmin && order.userId && order.userId !== req.userId) {
      return res.status(403).json(errorResponse('Forbidden', 403));
    }
    res.status(200).json(successResponse({ order }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

// Mock payment verify (mark order paid)
async function verifyPayment(req, res) {
  try {
    const { orderId, paymentRef } = req.body;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return res.status(404).json(errorResponse('Order not found', 404));
    order.status = 'paid';
    order.payment = { ref: paymentRef || 'MOCKREF_' + uuidv4(), verifiedAt: new Date().toISOString() };
    res.status(200).json(successResponse({ order }, 'Payment verified'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  verifyPayment,
};
