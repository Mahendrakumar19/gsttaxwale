console.log('🚀 Loading API routes...');

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const orderController = require('../controllers/orderController');
const ticketController = require('../controllers/ticketController');
const referralController = require('../controllers/referralController');
const inquiryController = require('../controllers/inquiryController');
const consultationController = require('../controllers/consultationController');
const customerController = require('../controllers/customerController');
const documentController = require('../controllers/documentController');
const dueDatesController = require('../controllers/dueDatesController');
const pricingController = require('../controllers/pricingController');
const contactController = require('../controllers/contactController');
const publicReferralController = require('../controllers/publicReferralController');
const locationController = require('../controllers/locationController');
const multer = require('multer');
const { authenticate, adminOnly, optionalAuthenticate, asyncHandler } = require('../middleware/auth');
const db = require('../utils/db');

// DEBUG ROUTES
router.get('/debug/db-test', asyncHandler(async (req, res) => {
  try {
    const r1 = await db.query('SELECT 1 as test');
    const r2 = await db.query('SELECT * FROM Service LIMIT 1');
    res.json({ 
      success: true, 
      connection: 'OK', 
      node: process.version,
      env: process.env.NODE_ENV,
      testResult: r1, 
      serviceSample: r2 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
}));

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/temp' });

// CONTACT FORM
router.post('/contact', optionalAuthenticate, asyncHandler(contactController.handleContactForm));
router.post('/referrals/generate-public', asyncHandler(publicReferralController.generatePublicReferral));

// AUTH ROUTES
router.post('/auth/send-service-purchase-otp', asyncHandler(authController.sendServicePurchaseOTP));
router.post('/auth/verify-service-purchase-otp', asyncHandler(authController.verifyServicePurchaseOTP));
// SIGNUP REMOVED - Users can only be created by admin
router.post('/auth/login', asyncHandler(authController.login));
router.post('/auth/admin-login', asyncHandler(authController.adminLogin));
router.post('/auth/send-otp', asyncHandler(authController.sendOTP));
router.post('/auth/verify-otp', asyncHandler(authController.verifyOTP));
router.post('/auth/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/auth/verify-password-otp', asyncHandler(authController.verifyPasswordOTP));
router.post('/auth/reset-password', asyncHandler(authController.resetPassword));
router.post('/auth/logout', authenticate, asyncHandler(authController.logout));
router.post('/auth/convert-guest-to-account', asyncHandler(authController.convertGuestToAccount));
router.post('/auth/check-email', asyncHandler(authController.checkEmail));
router.post('/auth/create-guest', asyncHandler(authController.createGuest));
router.get('/auth/me', authenticate, asyncHandler(authController.getCurrentUser));
router.put('/auth/profile', authenticate, asyncHandler(authController.updateProfile));

// Users endpoint - GET current user
router.get('/users/me', authenticate, asyncHandler(authController.getCurrentUser));


// ────────────────────────────────────────────────────────────────────
// TICKET ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/tickets', authenticate, asyncHandler(ticketController.createTicket));
router.get('/tickets', authenticate, asyncHandler(ticketController.getUserTickets));
router.get('/tickets/:id', authenticate, asyncHandler(ticketController.getTicket));
router.put('/tickets/:id', authenticate, adminOnly, asyncHandler(ticketController.updateTicket));
router.delete('/tickets/:id', authenticate, adminOnly, asyncHandler(ticketController.deleteTicket));
router.get('/admin/tickets', authenticate, adminOnly, asyncHandler(ticketController.getAllTickets));

// ────────────────────────────────────────────────────────────────────
// REFERRAL ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/referrals', authenticate, asyncHandler(referralController.createReferral));
router.get('/referrals', authenticate, asyncHandler(referralController.getReferralInfo));
router.get('/referrals/link', authenticate, asyncHandler(referralController.getReferralLink));
router.post('/referrals/register', asyncHandler(referralController.registerReferral));
router.post('/referrals/convert', authenticate, asyncHandler(referralController.trackReferralConversion));
router.post('/referrals/redeem-points', authenticate, asyncHandler(referralController.redeemPoints));
router.get('/referrals/history', authenticate, asyncHandler(referralController.getRedemptionHistory));
router.get('/referrals/:id', authenticate, asyncHandler(referralController.getReferral));
router.put('/referrals/:id', authenticate, adminOnly, asyncHandler(referralController.updateReferral));
router.get('/admin/referrals', authenticate, adminOnly, asyncHandler(referralController.getAllReferrals));
router.get('/admin/referrals-stats', authenticate, adminOnly, asyncHandler(referralController.getReferralStats));
router.post('/admin/referrals/:id/verify', authenticate, adminOnly, asyncHandler(referralController.verifyReferral));

// ────────────────────────────────────────────────────────────────────
// DOCUMENT ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/documents/upload', authenticate, upload.single('file'), asyncHandler(documentController.uploadDocument));
router.get('/documents', authenticate, asyncHandler(documentController.getUserDocuments));
router.delete('/documents/:documentId', authenticate, asyncHandler(documentController.deleteDocument));
router.get('/documents/financial-years', authenticate, asyncHandler(documentController.getFinancialYears));

// ────────────────────────────────────────────────────────────────────
// ADMIN SYSTEM ROUTES
// ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', authenticate, adminOnly, asyncHandler(adminController.getAdminStats));

// ────────────────────────────────────────────────────────────────────
// DASHBOARD ROUTES
// ────────────────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, asyncHandler(dashboardController.getDashboard));
router.get('/dashboard/filing-status', authenticate, asyncHandler(dashboardController.getFilingStatus));
router.get('/dashboard/services', authenticate, asyncHandler(dashboardController.getUserServices));
router.get('/dashboard/documents', authenticate, asyncHandler(dashboardController.getUserDocumentsGrouped));
router.delete('/dashboard/filing', authenticate, asyncHandler(dashboardController.removeFiling));

// ────────────────────────────────────────────────────────────────────
// INQUIRY ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/inquiries', asyncHandler(inquiryController.createInquiry));
router.get('/inquiries', authenticate, asyncHandler(inquiryController.getUserInquiries));
router.get('/inquiries/:id', authenticate, asyncHandler(inquiryController.getInquiry));
router.put('/inquiries/:id', authenticate, adminOnly, asyncHandler(inquiryController.updateInquiry));
router.get('/admin/inquiries', authenticate, adminOnly, asyncHandler(inquiryController.getAllInquiries));
router.get('/admin/inquiries-stats', authenticate, adminOnly, asyncHandler(inquiryController.getInquiryStats));

// ────────────────────────────────────────────────────────────────────
// CONSULTATION ROUTES
// ────────────────────────────────────────────────────────────────────
router.post('/consultations', authenticate, adminOnly, asyncHandler(consultationController.createConsultation));
router.get('/consultations', authenticate, asyncHandler(consultationController.getUserConsultations));
router.get('/consultations/:id', authenticate, asyncHandler(consultationController.getConsultation));
router.get('/consultations/:id/document', authenticate, asyncHandler(consultationController.getConsultationDocument));
router.put('/consultations/:id', authenticate, adminOnly, asyncHandler(consultationController.updateConsultation));
router.get('/admin/consultations', authenticate, adminOnly, asyncHandler(consultationController.getAllConsultations));
router.get('/admin/consultations-stats', authenticate, adminOnly, asyncHandler(consultationController.getConsultationStats));

// ────────────────────────────────────────────────────────────────────
// CUSTOMER ROUTES (ADMIN)
// ────────────────────────────────────────────────────────────────────
router.get('/admin/customers', authenticate, adminOnly, asyncHandler(customerController.getAllCustomers));
router.get('/admin/customers/search', authenticate, adminOnly, asyncHandler(customerController.searchCustomers));
router.get('/admin/customers/email', authenticate, adminOnly, asyncHandler(customerController.getCustomerByEmail));
router.get('/admin/customers/:id', authenticate, adminOnly, asyncHandler(customerController.getCustomerDetails));

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
router.get('/admin/users', authenticate, adminOnly, asyncHandler(adminController.getUsers));
router.post('/admin/users', authenticate, adminOnly, asyncHandler(adminController.createUser));
router.put('/admin/users/:id', authenticate, adminOnly, asyncHandler(adminController.updateUser));
router.delete('/admin/users/:id', authenticate, adminOnly, asyncHandler(adminController.deleteUser));
router.get('/admin/reports', authenticate, adminOnly, asyncHandler(adminController.getReports));
router.put('/admin/points/:userId', authenticate, adminOnly, asyncHandler(adminController.adjustPoints));
router.get('/admin/points-history/:userId', authenticate, adminOnly, asyncHandler(adminController.getPointsHistory));
router.get('/admin/redeem-requests', authenticate, adminOnly, asyncHandler(adminController.getRedeemRequests));
router.post('/admin/redeem-requests/:id/approve', authenticate, adminOnly, asyncHandler(adminController.approveRedeemRequest));
router.get('/admin/export/users', authenticate, adminOnly, asyncHandler(adminController.exportUsersCSV));
router.get('/admin/export/users-excel', authenticate, adminOnly, asyncHandler(adminController.exportUsersExcel));
router.get('/admin/analytics', authenticate, adminOnly, asyncHandler(adminController.getAnalytics));

// ────────────────────────────────────────────────────────────────────
// SERVICE PRICING (Admin Management)
// ────────────────────────────────────────────────────────────────────
router.get('/admin/pricing', authenticate, adminOnly, asyncHandler(pricingController.getServicePricing));
router.get('/admin/pricing/:serviceId', authenticate, adminOnly, asyncHandler(pricingController.getServicePrice));
router.post('/admin/pricing', authenticate, adminOnly, asyncHandler(pricingController.setServicePricing));
router.delete('/admin/pricing/:serviceId', authenticate, adminOnly, asyncHandler(pricingController.removePricing));

// Public endpoint to get active pricing
router.get('/pricing/active', asyncHandler(pricingController.getActivePricing));

// ────────────────────────────────────────────────────────────────────
// SERVICES (PUBLIC)
// ────────────────────────────────────────────────────────────────────
router.get('/services', asyncHandler(serviceController.listServices));
router.get('/services/:id', asyncHandler(serviceController.getService));

// Admin service management
router.post('/admin/services', authenticate, adminOnly, asyncHandler(serviceController.createService));
router.put('/admin/services/:id', authenticate, adminOnly, asyncHandler(serviceController.updateService));
router.delete('/admin/services/:id', authenticate, adminOnly, asyncHandler(serviceController.deleteService));

// ────────────────────────────────────────────────────────────────────
// ORDERS / CHECKOUT
// ────────────────────────────────────────────────────────────────────
// ORDERS / CHECKOUT (Razorpay Integration)
// ────────────────────────────────────────────────────────────────────
router.post('/orders', authenticate, asyncHandler(orderController.createOrder));
router.post('/orders/create-inquiry', asyncHandler(orderController.createInquiry));
router.post('/orders/guest-checkout', asyncHandler(orderController.createGuestCheckout));
router.get('/orders', authenticate, asyncHandler(orderController.listOrders));
router.get('/orders/:id', authenticate, asyncHandler(orderController.getOrder));
router.post('/orders/verify', asyncHandler(orderController.verifyPayment));


// ────────────────────────────────────────────────────────────────────
// CLEAN BACKEND FLOW ROUTES
// ────────────────────────────────────────────────────────────────────
// FLOW 1: ADMIN UPLOADS DOCUMENT
router.post('/admin/upload-document', authenticate, adminOnly, upload.single('file'), asyncHandler(documentController.adminUploadDocument));
router.post('/admin/documents/upload', authenticate, adminOnly, upload.single('file'), asyncHandler(documentController.adminUploadDocument));


// FLOW 2: USER OPENS DOCUMENT PAGE (Grouped by Category & FY)
router.get('/documents', authenticate, asyncHandler(documentController.getGroupedDocuments));

// WALLET & POINTS
router.get('/dashboard/wallet', authenticate, asyncHandler(referralController.getReferralInfo));

// FLOW 3: ADMIN UPDATES FILING STATUS
router.put('/admin/update-filing-status', authenticate, adminOnly, asyncHandler(adminController.updateFilingStatus));

// ────────────────────────────────────────────────────────────────────
// ADMIN: SUPPORT & REDEMPTION TICKETS
// ────────────────────────────────────────────────────────────────────
router.get('/admin/tickets', authenticate, adminOnly, asyncHandler(ticketController.getAllTickets));
router.get('/admin/tickets/:id', authenticate, adminOnly, asyncHandler(ticketController.getTicket));
router.put('/admin/tickets/:id', authenticate, adminOnly, asyncHandler(ticketController.updateTicket));
router.delete('/admin/tickets/:id', authenticate, adminOnly, asyncHandler(ticketController.deleteTicket));
router.get('/admin/referrals', authenticate, adminOnly, asyncHandler(referralController.getAllReferrals));


// DOCUMENT MANAGEMENT ROUTES (Existing)
// ────────────────────────────────────────────────────────────────────
// NEWS & UPDATES ROUTES (PUBLIC)
// ────────────────────────────────────────────────────────────────────
// Get GST news and updates
router.get('/news', (req, res) => {
  const MOCK_NEWS = [
    {
      id: '1',
      title: 'GSTR-1 Filing Due Extended',
      description: 'GST returns filing deadline for March 2026 extended by 5 days to April 16',
      date: '2026-03-28',
      category: 'announcement',
      source: 'GST Portal',
      url: 'https://gst.gov.in',
    },
    {
      id: '2',
      title: 'New ITC Rate Changes Announced',
      description: 'Input Tax Credit (ITC) rules updated for specific sectors. Check GST portal for details.',
      date: '2026-03-25',
      category: 'update',
      source: 'CBIC',
      url: 'https://gst.gov.in',
    },
    {
      id: '3',
      title: 'Portal Maintenance Notice',
      description: 'GST Portal will be under maintenance on March 30 (10 PM - 6 AM). No filings can be submitted.',
      date: '2026-03-23',
      category: 'alert',
      source: 'GST Support',
    },
    {
      id: '4',
      title: 'GSTR-9 Annual Return Filing Extended',
      description: 'Annual GST return filing deadline extended to June 30, 2026 for all taxpayers',
      date: '2026-03-20',
      category: 'news',
      source: 'Government',
    },
    {
      id: '5',
      title: 'E-Commerce Rules Updated',
      description: 'New compliance requirements for e-commerce platforms effective from April 1, 2026',
      date: '2026-03-18',
      category: 'announcement',
      source: 'GST Portal',
      url: 'https://gst.gov.in',
    },
  ];

  try {
    const limit = parseInt(req.query.limit || '5');
    const category = req.query.category;

    let news = [...MOCK_NEWS];

    // Filter by category if provided
    if (category && ['update', 'news', 'announcement', 'alert'].includes(category)) {
      news = news.filter((item) => item.category === category);
    }

    // Sort by date (newest first)
    news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit results
    const limited = news.slice(0, limit);

    res.json({
      success: true,
      data: {
        news: limited,
        total: limited.length,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────
// LOCATION ROUTES
// ────────────────────────────────────────────────────────────────────
router.get('/locations', asyncHandler(locationController.listLocations));
router.get('/admin/locations', authenticate, adminOnly, asyncHandler(locationController.adminListLocations));
router.post('/admin/locations', authenticate, adminOnly, asyncHandler(locationController.createLocation));
router.put('/admin/locations/:id', authenticate, adminOnly, asyncHandler(locationController.updateLocation));
router.delete('/admin/locations/:id', authenticate, adminOnly, asyncHandler(locationController.deleteLocation));

// DUE DATES ROUTES (PUBLIC)
// ────────────────────────────────────────────────────────────────────
// Get all due dates (GST and ITR)
router.get('/due-dates', asyncHandler(dueDatesController.getDueDates));

// Get only GST due dates
router.get('/due-dates/gst', asyncHandler(dueDatesController.getGSTDueDates));

// Get only ITR due dates
router.get('/due-dates/itr', asyncHandler(dueDatesController.getITRDueDates));


// ────────────────────────────────────────────────────────────────────
// FALLBACK ROUTE FOR UNHANDLED API REQUESTS
// ────────────────────────────────────────────────────────────────────
router.all('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'API endpoint not found',
  });
});

module.exports = router;
