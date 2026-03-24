const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const orderController = require('../controllers/orderController');
const { authenticate, asyncHandler } = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/auth/signup', asyncHandler(authController.signup));
router.post('/auth/login', asyncHandler(authController.login));
router.post('/auth/send-otp', asyncHandler(authController.sendOTP));
router.post('/auth/verify-otp', asyncHandler(authController.verifyOTPCode));
router.post('/auth/logout', authenticate, asyncHandler(authController.logout));
router.get('/auth/me', authenticate, asyncHandler(authController.getCurrentUser));
router.put('/auth/profile', authenticate, asyncHandler(authController.updateProfile));

// ────────────────────────────────────────────────────────────────────
// TAX FILING ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/tax/filing/create', authenticate, asyncHandler(reportController.createTaxFiling));
router.get('/tax/filing/:id', authenticate, asyncHandler(reportController.getTaxFiling));
router.get('/tax/filings', authenticate, asyncHandler(reportController.getTaxFilings));
router.post('/tax/filing/:id/income', authenticate, asyncHandler(reportController.updateIncome));
router.post('/tax/filing/:id/deductions', authenticate, asyncHandler(reportController.updateDeductions));
router.post('/tax/filing/:id/calculate', authenticate, asyncHandler(reportController.calculateTax));
router.post('/tax/filing/:id/submit', authenticate, asyncHandler(reportController.submitFiling));
router.post('/tax/filing/:id/file', authenticate, asyncHandler(reportController.fileReturn));
// router.post('/tax/filing/:id/compare-regimes', authenticate, asyncHandler(reportController.compareRegimes));

// ────────────────────────────────────────────────────────────────────
// DOCUMENT UPLOAD ROUTES (TO BE IMPLEMENTED)
// ────────────────────────────────────────────────────────────────────
// router.post('/upload/document', authenticate, asyncHandler(reportController.uploadDocument));
// router.get('/documents/:filingId', authenticate, asyncHandler(reportController.getDocuments));
// router.delete('/document/:id', authenticate, asyncHandler(reportController.deleteDocument));

// ────────────────────────────────────────────────────────────────────
// PAYMENT ROUTES (TO BE IMPLEMENTED)
// ────────────────────────────────────────────────────────────────────
// router.post('/payment/create-order', authenticate, asyncHandler(reportController.createPaymentOrder));
// router.post('/payment/verify', authenticate, asyncHandler(reportController.verifyPayment));
// router.get('/payments', authenticate, asyncHandler(reportController.getPayments));

// ────────────────────────────────────────────────────────────────────
// CA ASSISTED FILING ROUTES (TO BE IMPLEMENTED)
// ────────────────────────────────────────────────────────────────────
// router.post('/ca/request', authenticate, asyncHandler(reportController.requestCA));
// router.get('/ca/status/:id', authenticate, asyncHandler(reportController.getCAStatus));
// router.get('/ca/filings', authenticate, asyncHandler(reportController.getCAAssignedFilings));

// ────────────────────────────────────────────────────────────────────
// REPORT ROUTES (Legacy - TO BE IMPLEMENTED)
// ────────────────────────────────────────────────────────────────────
// router.post('/reports', authenticate, reportController.createReport);
// router.get('/reports', authenticate, reportController.listReports);
// router.get('/reports/:id', authenticate, reportController.getReport);
// router.get('/reports/:id/download', authenticate, reportController.downloadReport);

// ────────────────────────────────────────────────────────────────────
// DASHBOARD ROUTES
// ────────────────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, asyncHandler(dashboardController.getDashboard));
router.get('/dashboard/statistics', authenticate, asyncHandler(dashboardController.getStatistics));
router.get('/dashboard/refund-status', authenticate, asyncHandler(dashboardController.getRefundStatus));

// ────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ────────────────────────────────────────────────────────────────────
router.get('/admin/users', authenticate, adminController.getUsers);
router.get('/admin/reports', authenticate, adminController.getReports);
router.get('/admin/analytics', authenticate, adminController.getAnalytics);

// ────────────────────────────────────────────────────────────────────
// SERVICES (PUBLIC)
// ────────────────────────────────────────────────────────────────────
router.get('/services', asyncHandler(serviceController.listServices));
router.get('/services/:id', asyncHandler(serviceController.getService));

// Admin service management
router.post('/admin/services', authenticate, asyncHandler(serviceController.createService));
router.put('/admin/services/:id', authenticate, asyncHandler(serviceController.updateService));
router.delete('/admin/services/:id', authenticate, asyncHandler(serviceController.deleteService));

// ────────────────────────────────────────────────────────────────────
// ORDERS / CHECKOUT
// ────────────────────────────────────────────────────────────────────
router.post('/orders', authenticate, asyncHandler(orderController.createOrder));
router.get('/orders', authenticate, asyncHandler(orderController.listOrders));
router.get('/orders/:id', authenticate, asyncHandler(orderController.getOrder));
router.post('/orders/verify', authenticate, asyncHandler(orderController.verifyPayment));

module.exports = router;
