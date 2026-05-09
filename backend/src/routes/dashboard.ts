import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { auth } from '../middleware/auth';
import dashboardController from '../controllers/dashboardController';

const router = Router();

/**
 * Dashboard Routes
 * All protected with authentication
 */

// User Profile & Summary
router.get('/user/profile', auth, asyncHandler(dashboardController.getUserProfile));
router.get('/user/summary', auth, asyncHandler(dashboardController.getUserSummary));
router.put('/user/profile', auth, asyncHandler(dashboardController.updateUserProfile));

// User Services
router.get('/user/services', auth, asyncHandler(dashboardController.getUserServices));
router.get('/user/services/:serviceId', auth, asyncHandler(dashboardController.getUserServiceDetail));

// Filing Status
router.get('/user/filing-status', auth, asyncHandler(dashboardController.getFilingStatus));
router.get('/user/filing-status/:filingId', auth, asyncHandler(dashboardController.getFilingDetail));

// Documents
router.get('/user/documents', auth, asyncHandler(dashboardController.getUserDocuments));
router.post('/user/documents/upload', auth, asyncHandler(dashboardController.uploadDocument));
router.delete('/user/documents/:documentId', auth, asyncHandler(dashboardController.deleteDocument));
router.get('/user/documents/:documentId/download', auth, asyncHandler(dashboardController.downloadDocument));

// Activity & Notifications
router.get('/user/activity', auth, asyncHandler(dashboardController.getActivityLog));
router.get('/user/notifications', auth, asyncHandler(dashboardController.getNotifications));
router.put('/user/notifications/:notificationId/read', auth, asyncHandler(dashboardController.markNotificationRead));
router.put('/user/notifications/read-all', auth, asyncHandler(dashboardController.markAllNotificationsRead));

// Referral Info
router.get('/user/referral-info', auth, asyncHandler(dashboardController.getReferralInfo));
router.post('/user/referral/send', auth, asyncHandler(dashboardController.sendReferralInvite));

// Cases
router.get('/user/cases', auth, asyncHandler(dashboardController.getUserCases));
router.get('/user/cases/:caseId', auth, asyncHandler(dashboardController.getCaseDetail));

// Logout
router.post('/auth/logout', auth, asyncHandler(dashboardController.logout));

export default router;
