const express = require('express');
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
const configController = require('../controllers/configController');
const adminReferralController = require('../controllers/adminReferralController');
const newsController = require('../controllers/newsController');
const statsController = require('../controllers/statsController');
const referralLeadController = require('../controllers/referralLeadController');

const multer = require('multer');
const { authenticate, adminOnly, optionalAuthenticate, asyncHandler } = require('../middleware/auth');
const db = require('../utils/db');

const upload = multer({ dest: 'uploads/temp' });

module.exports = function(app) {
  const prefix = '/api';

  app.get(`${prefix}/ping`, (req, res) => res.json({ success: true, message: 'platform-pong' }));

  app.post(`${prefix}/contact`, optionalAuthenticate, asyncHandler(contactController.handleContactForm));
  app.post(`${prefix}/stats/visitor`, asyncHandler(statsController.incrementVisitorCount));
  app.post(`${prefix}/referrals/generate-public`, asyncHandler(publicReferralController.generatePublicReferral));
  
  // AUTH ROUTES
  app.post(`${prefix}/auth/register`, asyncHandler(authController.register));
  app.post(`${prefix}/auth/send-service-purchase-otp`, asyncHandler(authController.sendServicePurchaseOTP));
  app.post(`${prefix}/auth/verify-service-purchase-otp`, asyncHandler(authController.verifyServicePurchaseOTP));
  app.post(`${prefix}/auth/login`, asyncHandler(authController.login));
  app.post(`${prefix}/auth/admin-login`, asyncHandler(authController.adminLogin));
  app.post(`${prefix}/auth/send-otp`, asyncHandler(authController.sendOTP));
  app.post(`${prefix}/auth/verify-otp`, asyncHandler(authController.verifyOTP));
  app.post(`${prefix}/auth/send-reset-otp`, asyncHandler(authController.sendResetOTP));
  app.post(`${prefix}/auth/verify-reset-otp`, asyncHandler(authController.verifyResetOTP));
  app.post(`${prefix}/auth/reset-password`, asyncHandler(authController.resetPassword));
  app.post(`${prefix}/auth/change-password`, authenticate, asyncHandler(authController.changePassword));
  app.post(`${prefix}/auth/logout`, authenticate, asyncHandler(authController.logout));
  app.post(`${prefix}/auth/convert-guest-to-account`, asyncHandler(authController.convertGuestToAccount));
  app.post(`${prefix}/auth/check-email`, asyncHandler(authController.checkEmail));
  app.post(`${prefix}/auth/create-guest`, asyncHandler(authController.createGuest));
  app.get(`${prefix}/auth/me`, authenticate, asyncHandler(authController.getCurrentUser));
  app.put(`${prefix}/auth/profile`, authenticate, asyncHandler(authController.updateProfile));

  // SYSTEM CONFIG ROUTES
  app.get(`${prefix}/config/public`, asyncHandler(configController.getPublicSettings));
  app.get(`${prefix}/admin/config`, authenticate, adminOnly, asyncHandler(configController.getAllSettings));
  app.post(`${prefix}/admin/config`, authenticate, adminOnly, asyncHandler(configController.updateSettings));

  app.get(`${prefix}/users/me`, authenticate, asyncHandler(authController.getCurrentUser));

  // TICKET ROUTES
  app.post(`${prefix}/tickets`, authenticate, asyncHandler(ticketController.createTicket));
  app.get(`${prefix}/tickets`, authenticate, asyncHandler(ticketController.getUserTickets));
  app.get(`${prefix}/tickets/:id`, authenticate, asyncHandler(ticketController.getTicket));
  app.put(`${prefix}/tickets/:id`, authenticate, adminOnly, asyncHandler(ticketController.updateTicket));
  app.delete(`${prefix}/tickets/:id`, authenticate, adminOnly, asyncHandler(ticketController.deleteTicket));
  app.get(`${prefix}/admin/tickets`, authenticate, adminOnly, asyncHandler(ticketController.getAllTickets));

  // REFERRAL & WALLET ROUTES
  app.post(`${prefix}/referrals`, authenticate, asyncHandler(referralController.createReferral));
  app.get(`${prefix}/referrals`, authenticate, asyncHandler(referralController.getReferralInfo));
  app.get(`${prefix}/referrals/link`, authenticate, asyncHandler(referralController.getReferralLink));
  app.post(`${prefix}/referrals/register`, asyncHandler(referralController.registerReferral));
  app.post(`${prefix}/referrals/convert`, authenticate, asyncHandler(referralController.trackReferralConversion));
  app.post(`${prefix}/referrals/redeem-points`, authenticate, asyncHandler(referralController.redeemPoints));
  app.get(`${prefix}/referrals/history`, authenticate, asyncHandler(referralController.getRedemptionHistory));
  app.get(`${prefix}/wallet/history`, authenticate, asyncHandler(referralController.getWalletHistory));

  // NEW REFERRAL LEADS LIFE CYCLE ROUTES
  app.post(`${prefix}/referrals/lead`, asyncHandler(referralLeadController.createLead));
  app.get(`${prefix}/referrals/referrer/:code`, asyncHandler(referralLeadController.getReferrerName));
  app.get(`${prefix}/referrals/leads`, authenticate, asyncHandler(referralLeadController.userListLeads));
  app.get(`${prefix}/admin/referral-leads`, authenticate, adminOnly, asyncHandler(referralLeadController.adminListLeads));
  app.get(`${prefix}/admin/referral-leads/:id`, authenticate, adminOnly, asyncHandler(referralLeadController.adminGetLead));
  app.put(`${prefix}/admin/referral-leads/:id`, authenticate, adminOnly, asyncHandler(referralLeadController.adminUpdateLead));
  app.post(`${prefix}/admin/referral-leads/:id/convert`, authenticate, adminOnly, asyncHandler(referralLeadController.adminConvertLead));

  // ADMIN REFERRAL & WALLET
  app.get(`${prefix}/admin/referral/rules`, authenticate, adminOnly, asyncHandler(adminReferralController.getRules));
  app.post(`${prefix}/admin/referral/rules`, authenticate, adminOnly, asyncHandler(adminReferralController.createRule));
  app.put(`${prefix}/admin/referral/rules/:id`, authenticate, adminOnly, asyncHandler(adminReferralController.updateRule));
  app.get(`${prefix}/admin/wallet/transactions`, authenticate, adminOnly, asyncHandler(adminReferralController.getAllTransactions));
  app.post(`${prefix}/admin/wallet/adjust`, authenticate, adminOnly, asyncHandler(adminReferralController.adjustWallet));
  app.get(`${prefix}/admin/referral/settings`, authenticate, adminOnly, asyncHandler(adminReferralController.getSettings));
  app.put(`${prefix}/admin/referral/settings`, authenticate, adminOnly, asyncHandler(adminReferralController.updateSettings));
  app.get(`${prefix}/admin/referral/analytics`, authenticate, adminOnly, asyncHandler(adminReferralController.getReferralAnalytics));
  app.get(`${prefix}/admin/referrals`, authenticate, adminOnly, asyncHandler(referralController.getAllReferrals));
  app.get(`${prefix}/admin/referrals-stats`, authenticate, adminOnly, asyncHandler(referralController.getReferralStats));
  app.get(`${prefix}/referrals/:id`, authenticate, adminOnly, asyncHandler(referralController.getReferralById));
  app.put(`${prefix}/referrals/:id`, authenticate, adminOnly, asyncHandler(referralController.updateReferralById));

  // DOCUMENT ROUTES
  app.post(`${prefix}/documents/upload`, authenticate, upload.array('files', 10), asyncHandler(documentController.uploadDocument));
  app.get(`${prefix}/documents/user-list`, authenticate, asyncHandler(documentController.getUserDocuments));
  app.delete(`${prefix}/documents/:documentId`, authenticate, asyncHandler(documentController.deleteDocument));
  app.get(`${prefix}/documents/financial-years`, authenticate, asyncHandler(documentController.getFinancialYears));

  // ADMIN SYSTEM ROUTES
  app.get(`${prefix}/admin/stats`, authenticate, adminOnly, asyncHandler(adminController.getAdminStats));

  // DASHBOARD ROUTES
  app.get(`${prefix}/dashboard`, authenticate, asyncHandler(dashboardController.getDashboard));
  app.get(`${prefix}/dashboard/filing-status`, authenticate, asyncHandler(dashboardController.getFilingStatus));
  app.get(`${prefix}/dashboard/services`, authenticate, asyncHandler(dashboardController.getUserServices));
  app.get(`${prefix}/dashboard/documents`, authenticate, asyncHandler(dashboardController.getUserDocumentsGrouped));
  app.delete(`${prefix}/dashboard/filing`, authenticate, asyncHandler(dashboardController.removeFiling));

  // INQUIRY ROUTES
  app.post(`${prefix}/inquiries`, asyncHandler(inquiryController.createInquiry));
  app.get(`${prefix}/inquiries`, authenticate, asyncHandler(inquiryController.getUserInquiries));
  app.get(`${prefix}/inquiries/:id`, authenticate, asyncHandler(inquiryController.getInquiry));
  app.put(`${prefix}/inquiries/:id`, authenticate, adminOnly, asyncHandler(inquiryController.updateInquiry));
  app.get(`${prefix}/admin/inquiries`, authenticate, adminOnly, asyncHandler(inquiryController.getAllInquiries));
  app.get(`${prefix}/admin/inquiries-stats`, authenticate, adminOnly, asyncHandler(inquiryController.getInquiryStats));

  // CONSULTATION ROUTES
  app.post(`${prefix}/consultations`, authenticate, adminOnly, asyncHandler(consultationController.createConsultation));
  app.get(`${prefix}/consultations`, authenticate, asyncHandler(consultationController.getUserConsultations));
  app.get(`${prefix}/consultations/:id`, authenticate, asyncHandler(consultationController.getConsultation));
  app.get(`${prefix}/consultations/:id/document`, authenticate, asyncHandler(consultationController.getConsultationDocument));
  app.put(`${prefix}/consultations/:id`, authenticate, adminOnly, asyncHandler(consultationController.updateConsultation));
  app.get(`${prefix}/admin/consultations`, authenticate, adminOnly, asyncHandler(consultationController.getAllConsultations));
  app.get(`${prefix}/admin/consultations-stats`, authenticate, adminOnly, asyncHandler(consultationController.getConsultationStats));

  // CUSTOMER ROUTES (ADMIN)
  app.get(`${prefix}/admin/customers`, authenticate, adminOnly, asyncHandler(customerController.getAllCustomers));
  app.get(`${prefix}/admin/customers/search`, authenticate, adminOnly, asyncHandler(customerController.searchCustomers));
  app.get(`${prefix}/admin/customers/email`, authenticate, adminOnly, asyncHandler(customerController.getCustomerByEmail));
  app.get(`${prefix}/admin/customers/:id`, authenticate, adminOnly, asyncHandler(customerController.getCustomerDetails));

  // TAX FILING ROUTES
  app.post(`${prefix}/tax/filing/create`, authenticate, asyncHandler(reportController.createTaxFiling));
  app.get(`${prefix}/tax/filing/:id`, authenticate, asyncHandler(reportController.getTaxFiling));
  app.get(`${prefix}/tax/filings`, authenticate, asyncHandler(reportController.getTaxFilings));
  app.post(`${prefix}/tax/filing/:id/income`, authenticate, asyncHandler(reportController.updateIncome));
  app.post(`${prefix}/tax/filing/:id/deductions`, authenticate, asyncHandler(reportController.updateDeductions));
  app.post(`${prefix}/tax/filing/:id/calculate`, authenticate, asyncHandler(reportController.calculateTax));
  app.post(`${prefix}/tax/filing/:id/submit`, authenticate, asyncHandler(reportController.submitFiling));
  app.post(`${prefix}/tax/filing/:id/file`, authenticate, asyncHandler(reportController.fileReturn));

  app.get(`${prefix}/dashboard/statistics`, authenticate, asyncHandler(dashboardController.getStatistics));
  app.get(`${prefix}/dashboard/refund-status`, authenticate, asyncHandler(dashboardController.getRefundStatus));

  // ADMIN ROUTES
  app.get(`${prefix}/admin/users`, authenticate, adminOnly, asyncHandler(adminController.getUsers));
  app.post(`${prefix}/admin/users`, authenticate, adminOnly, asyncHandler(adminController.createUser));
  app.put(`${prefix}/admin/users/:id`, authenticate, adminOnly, asyncHandler(adminController.updateUser));
  app.delete(`${prefix}/admin/users/:id`, authenticate, adminOnly, asyncHandler(adminController.deleteUser));
  app.post(`${prefix}/admin/users/:id/reset-password`, authenticate, adminOnly, asyncHandler(adminController.resetPassword));
  app.get(`${prefix}/admin/reports`, authenticate, adminOnly, asyncHandler(adminController.getReports));
  app.put(`${prefix}/admin/points/:userId`, authenticate, adminOnly, asyncHandler(adminController.adjustPoints));
  app.get(`${prefix}/admin/points-history/:userId`, authenticate, adminOnly, asyncHandler(adminController.getPointsHistory));
  app.get(`${prefix}/admin/redeem-requests`, authenticate, adminOnly, asyncHandler(adminController.getRedeemRequests));
  app.post(`${prefix}/admin/redeem-requests/:id/approve`, authenticate, adminOnly, asyncHandler(adminController.approveRedeemRequest));
  app.get(`${prefix}/admin/export/users`, authenticate, adminOnly, asyncHandler(adminController.exportUsersCSV));
  app.get(`${prefix}/admin/export/users-excel`, authenticate, adminOnly, asyncHandler(adminController.exportUsersExcel));
  app.get(`${prefix}/admin/analytics`, authenticate, adminOnly, asyncHandler(adminController.getAnalytics));
  app.get(`${prefix}/admin/stats/visitors`, authenticate, adminOnly, asyncHandler(statsController.getVisitorCount));

  // SERVICE PRICING
  app.get(`${prefix}/admin/pricing`, authenticate, adminOnly, asyncHandler(pricingController.getServicePricing));
  app.get(`${prefix}/admin/pricing/:serviceId`, authenticate, adminOnly, asyncHandler(pricingController.getServicePrice));
  app.post(`${prefix}/admin/pricing`, authenticate, adminOnly, asyncHandler(pricingController.setServicePricing));
  app.delete(`${prefix}/admin/pricing/:serviceId`, authenticate, adminOnly, asyncHandler(pricingController.removePricing));
  app.get(`${prefix}/pricing/active`, asyncHandler(pricingController.getActivePricing));

  // SERVICES
  app.get(`${prefix}/services`, asyncHandler(serviceController.listServices));
  app.get(`${prefix}/services/:id`, asyncHandler(serviceController.getService));
  app.post(`${prefix}/admin/services`, authenticate, adminOnly, asyncHandler(serviceController.createService));
  app.put(`${prefix}/admin/services/:id`, authenticate, adminOnly, asyncHandler(serviceController.updateService));
  app.delete(`${prefix}/admin/services/:id`, authenticate, adminOnly, asyncHandler(serviceController.deleteService));

  // ORDERS
  app.post(`${prefix}/orders`, authenticate, asyncHandler(orderController.createOrder));
  app.post(`${prefix}/orders/create-inquiry`, asyncHandler(orderController.createInquiry));
  app.post(`${prefix}/orders/guest-checkout`, asyncHandler(orderController.createGuestCheckout));
  app.get(`${prefix}/orders`, authenticate, asyncHandler(orderController.listOrders));
  app.get(`${prefix}/orders/:id`, authenticate, asyncHandler(orderController.getOrder));
  app.post(`${prefix}/orders/verify`, asyncHandler(orderController.verifyPayment));

  // CLEAN BACKEND FLOW ROUTES
  app.get(`${prefix}/admin/documents`, authenticate, adminOnly, asyncHandler(documentController.getAllDocuments));
  app.post(`${prefix}/admin/upload-document`, authenticate, adminOnly, upload.array('files', 10), asyncHandler(documentController.uploadDocument));
  app.post(`${prefix}/admin/documents/upload`, authenticate, adminOnly, upload.array('files', 10), asyncHandler(documentController.uploadDocument));
  app.delete(`${prefix}/admin/documents/:documentId`, authenticate, adminOnly, asyncHandler(documentController.deleteDocument));
  app.patch(`${prefix}/admin/documents/:documentId/archive`, authenticate, adminOnly, asyncHandler(documentController.archiveDocument));
  app.get(`${prefix}/admin/documents/stats`, authenticate, adminOnly, asyncHandler(documentController.getDocumentStats));

  app.get(`${prefix}/documents`, authenticate, asyncHandler(documentController.getGroupedDocuments));
  app.get(`${prefix}/documents/download/:filename`, authenticate, asyncHandler(documentController.downloadDocument));

  app.get(`${prefix}/dashboard/wallet`, authenticate, asyncHandler(referralController.getReferralInfo));
  app.put(`${prefix}/admin/update-filing-status`, authenticate, adminOnly, asyncHandler(adminController.updateFilingStatus));

  app.get(`${prefix}/admin/tickets`, authenticate, adminOnly, asyncHandler(ticketController.getAllTickets));
  app.get(`${prefix}/admin/tickets/:id`, authenticate, adminOnly, asyncHandler(ticketController.getTicket));
  app.put(`${prefix}/admin/tickets/:id`, authenticate, adminOnly, asyncHandler(ticketController.updateTicket));
  app.delete(`${prefix}/admin/tickets/:id`, authenticate, adminOnly, asyncHandler(ticketController.deleteTicket));
  app.get(`${prefix}/admin/referrals`, authenticate, adminOnly, asyncHandler(referralController.getAllReferrals));
  app.get(`${prefix}/admin/referrals-stats`, authenticate, adminOnly, asyncHandler(referralController.getReferralStats));

  // NEWS ROUTES
  app.get(`${prefix}/news`, asyncHandler(newsController.getNews));
  app.post(`${prefix}/admin/news`, authenticate, adminOnly, asyncHandler(newsController.createNews));
  app.delete(`${prefix}/admin/news/:id`, authenticate, adminOnly, asyncHandler(newsController.deleteNews));

  app.get(`${prefix}/locations`, asyncHandler(locationController.listLocations));
  app.get(`${prefix}/admin/locations`, authenticate, adminOnly, asyncHandler(locationController.adminListLocations));
  app.post(`${prefix}/admin/locations`, authenticate, adminOnly, asyncHandler(locationController.createLocation));
  app.put(`${prefix}/admin/locations/:id`, authenticate, adminOnly, asyncHandler(locationController.updateLocation));
  app.delete(`${prefix}/admin/locations/:id`, authenticate, adminOnly, asyncHandler(locationController.deleteLocation));

  app.get(`${prefix}/due-dates`, asyncHandler(dueDatesController.getDueDates));
  app.get(`${prefix}/due-dates/gst`, asyncHandler(dueDatesController.getGSTDueDates));
  app.get(`${prefix}/due-dates/itr`, asyncHandler(dueDatesController.getITRDueDates));

  // SLIDER MANAGEMENT
  const sliderController = require('../controllers/sliderController');
  const bannerUpload = multer({ dest: 'uploads/temp' }); // Reuse temp for multer then move in controller

  app.get(`${prefix}/sliders`, asyncHandler(sliderController.getSliders));
  app.post(`${prefix}/admin/sliders`, authenticate, adminOnly, bannerUpload.single('image'), asyncHandler(sliderController.addSlider));
  app.put(`${prefix}/admin/sliders/:id/toggle`, authenticate, adminOnly, asyncHandler(sliderController.toggleSlider));
  app.delete(`${prefix}/admin/sliders/:id`, authenticate, adminOnly, asyncHandler(sliderController.deleteSlider));

  app.all(`${prefix}/*`, (req, res) => {
    console.log(`⚠️  404 API Fallback: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: true,
      message: `API endpoint not found: ${req.originalUrl}`,
    });
  });
};
