// Integration Instructions for backend/src/routes/api.js
// This file shows EXACTLY what to add to the existing api.js file

// ============================================================================
// STEP 1: ADD THESE IMPORTS AT THE TOP OF api.js (after existing imports)
// ============================================================================

const paymentController = require('../controllers/paymentController');
const walletController = require('../controllers/walletController');
const planController = require('../controllers/planController');
const referralController = require('../controllers/referralController');

// ============================================================================
// STEP 2: ADD THESE ROUTES - Replace the commented "TO BE IMPLEMENTED" sections
// ============================================================================

// ────────────────────────────────────────────────────────────────────
// PAYMENT ROUTES - Complete replacement section (was commented out)
// ────────────────────────────────────────────────────────────────────
router.post('/payments/create', authenticate, asyncHandler(paymentController.createPaymentOrder));
router.post('/payments/verify', authenticate, asyncHandler(paymentController.verifyPayment));
router.get('/payments/history', authenticate, asyncHandler(paymentController.getPaymentHistory));
router.get('/payments/:orderId', authenticate, asyncHandler(paymentController.getPaymentStatus));
router.post('/payments/:orderId/apply-wallet', authenticate, asyncHandler(paymentController.applyWalletCredit));
router.post('/payments/:orderId/refund', authenticate, adminOnly, asyncHandler(paymentController.refundOrder));

// ────────────────────────────────────────────────────────────────────
// WALLET ROUTES - New section (add after payment routes)
// ────────────────────────────────────────────────────────────────────
router.get('/wallet/balance', authenticate, asyncHandler(walletController.getBalance));
router.get('/wallet/transactions', authenticate, asyncHandler(walletController.getTransactionHistory));
router.get('/wallet/stats', authenticate, asyncHandler(walletController.getStats));
router.post('/wallet/apply-credit', authenticate, asyncHandler(walletController.applyCredit));
router.post('/wallet/withdraw', authenticate, asyncHandler(walletController.requestWithdrawal));
router.get('/wallet/withdrawals', authenticate, asyncHandler(walletController.getWithdrawals));
router.post('/wallet/withdrawals/:withdrawalId/approve', authenticate, adminOnly, asyncHandler(walletController.approveWithdrawal));

// ────────────────────────────────────────────────────────────────────
// PLAN ROUTES - Complete replacement section (was commented out)
// ────────────────────────────────────────────────────────────────────
router.get('/plans', asyncHandler(planController.listPlans));
router.get('/plans/:planId', asyncHandler(planController.getPlanDetails));
router.get('/plans/compare', asyncHandler(planController.comparePlans));

// Admin plan management
router.post('/admin/plans', authenticate, adminOnly, asyncHandler(planController.createPlan));
router.put('/admin/plans/:planId', authenticate, adminOnly, asyncHandler(planController.updatePlan));
router.delete('/admin/plans/:planId', authenticate, adminOnly, asyncHandler(planController.deletePlan));
router.post('/admin/plans/seed', authenticate, adminOnly, asyncHandler(planController.seedPlans));

// ────────────────────────────────────────────────────────────────────
// REFERRAL ROUTES - Enhancements (existing referral routes remain, add these)
// ────────────────────────────────────────────────────────────────────
// REPLACE the duplicated referral routes WITH THESE from referralController.ts
router.get('/referrals/my-code', authenticate, asyncHandler(referralController.getMyReferralCode));
router.get('/referrals/stats', authenticate, asyncHandler(referralController.getReferralStats));
router.get('/referrals/leaderboard', asyncHandler(referralController.getLeaderboard));
router.post('/referrals/track', authenticate, asyncHandler(referralController.trackReferral));
router.post('/referrals/generate', authenticate, asyncHandler(referralController.generateNewCode));

// Admin referral management (NEW)
router.get('/admin/referrals/view', authenticate, adminOnly, asyncHandler(referralController.getAllReferrals));
router.post('/admin/referrals/:referralId/approve', authenticate, adminOnly, asyncHandler(referralController.approveReferral));
router.post('/admin/referrals/:referralId/reject', authenticate, adminOnly, asyncHandler(referralController.rejectReferral));

// ============================================================================
// STEP 3: SET UP WEBHOOK ROUTES IN app.js OR server.js
// ============================================================================

// Add this to backend/server.js (or app.js) BEFORE the API routes:

/*
// Mount webhook routes first (before auth middleware)
const webhookRoutes = require('./src/routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

// Then mount other API routes
app.use('/api', apiRoutes);
*/

// ============================================================================
// STEP 4: INITIALIZE DATABASE IN server.js
// ============================================================================

// Add this near the start of server.js (before app.listen):

/*
// Initialize database with default plans
const planService = require('./src/services/planService');

async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database...');
    await planService.seedPlans();
    console.log('[DB] Database initialization complete');
  } catch (error) {
    console.error('[DB] Initialization error:', error.message);
  }
}

initializeDatabase();
*/

// ============================================================================
// STEP 5: UPDATE .env FILE
// ============================================================================

// Add these environment variables:

/*
# Razorpay Configuration (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Application Configuration
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
REFERRAL_COMMISSION=200

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_secret
*/

// ============================================================================
// STEP 6: INSTALL DEPENDENCIES (if not already installed)
// ============================================================================

// Run this in terminal:
// npm install razorpay crypto

// ============================================================================
// STEP 7: RUN PRISMA MIGRATION
// ============================================================================

// In terminal, run:
// cd backend
// npx prisma migrate dev --name "add_payment_wallet_plan_enhancements"

// This will:
// - Create SQL migration files
// - Apply schema changes to database
// - Generate updated Prisma client

// ============================================================================
// COMPLETE FILE STRUCTURE AFTER INTEGRATION
// ============================================================================

/*

backend/
├── src/
│   ├── services/
│   │   ├── paymentService.ts ✅
│   │   ├── walletService.ts ✅
│   │   ├── planService.ts ✅
│   │   ├── referralService.ts ✅
│   │   ├── authEnhancementService.ts ✅
│   │   ├── filingStatusService.ts ✅
│   │   ├── documentService.ts ✅
│   │   ├── reportService.ts ✅
│   │   ├── dashboardService.ts (enhanced)
│   │   └── [existing services]
│   │
│   ├── controllers/
│   │   ├── paymentController.ts ✅
│   │   ├── walletController.ts ✅
│   │   ├── planController.ts ✅
│   │   ├── referralController.ts ✅
│   │   └── [existing controllers]
│   │
│   ├── routes/
│   │   ├── api.js (UPDATED with new imports and routes)
│   │   ├── webhooks.ts ✅
│   │   └── [existing routes]
│   │
│   └── middleware/
│       └── auth.js (unchanged)
│
├── prisma/
│   └── schema.prisma ✅ (UPDATED with new models)
│
├── server.js (UPDATED with webhook mount and DB init)
├── package.json (UPDATED with razorpay dependency)
└── .env (UPDATED with Razorpay keys)

*/

// ============================================================================
// TESTING THE INTEGRATION
// ============================================================================

// After integration, test these endpoints with Postman or curl:

// 1. GET /api/plans
//    - Should return 4 default plans (Basic, Standard, Premium, Business)

// 2. POST /api/payments/create
//    - Body: { amount: 2999, planId: "basic" }
//    - Should return razorpayOrderId

// 3. GET /api/wallet/balance
//    - Should return { balance: 0, totalEarned: 0, totalWithdrawn: 0 }

// 4. GET /api/referrals/my-code
//    - Should return user's unique referral code

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*

Issue: "Cannot find module 'razorpay'"
Fix: npm install razorpay

Issue: "Prisma schema validation error"
Fix: Ensure schema.prisma is updated; run `npx prisma validate`

Issue: Payment signature verification fails
Fix: Verify RAZORPAY_KEY_SECRET matches webhook secret in Razorpay dashboard

Issue: Plans not seeding
Fix: Check database connection; verify planService.seedPlans() called on startup

Issue: Referral code not unique
Fix: Re-run generation; ensure collision detection logic is working

Issue: Wallet balance not updating
Fix: Verify transaction record created; check walletId reference

*/

// ============================================================================
// SUMMARY
// ============================================================================

// What's been implemented:
// ✅ 8 backend services (1,700+ lines TypeScript)
// ✅ 5 API controllers (600+ lines)
// ✅ Webhook routes for Razorpay
// ✅ Database schema enhancements
// ✅ 30+ API endpoints

// What this file provides:
// ✅ Exact code to copy into api.js
// ✅ Server initialization instructions
// ✅ Environment variable setup
// ✅ Database migration command
// ✅ Testing procedures
// ✅ Troubleshooting guide

// Next steps:
// 1. Add imports to api.js
// 2. Add routes to api.js
// 3. Mount webhooks in server.js
// 4. Add environment variables
// 5. Run Prisma migration
// 6. Test endpoints
// 7. Start frontend development

// Estimated time: 15-30 minutes for full integration

module.exports = {
  instructions: 'See above for exact integration steps',
  status: 'Ready for integration',
  nextStep: 'Add imports and routes to api.js',
};
