const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { authenticate, adminOnly, asyncHandler } = require('../middleware/auth');

// Public routes
router.get('/pages/:page', asyncHandler(cmsController.getPageContent));
router.get('/settings', asyncHandler(cmsController.getSettings));

// Admin only routes
router.get('/all', authenticate, adminOnly, asyncHandler(cmsController.getAllContent));
router.post('/pages/update', authenticate, adminOnly, asyncHandler(cmsController.updatePageContent));
router.post('/settings/update', authenticate, adminOnly, asyncHandler(cmsController.updateSetting));
router.post('/initialize', authenticate, adminOnly, asyncHandler(cmsController.initializeCMS));

module.exports = router;
