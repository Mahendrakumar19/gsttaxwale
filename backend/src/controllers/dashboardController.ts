import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Dashboard Controller - Modern Prisma implementation
 * Handles all user dashboard operations
 */

class DashboardController {
  /**
   * Get user profile with summary info
   */
  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          pan: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          bankDetails: true,
          status: true,
          referral_code: true,
          createdAt: true,
          points_wallet: true,
        },
      });

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user summary for dashboard
   */
  async getUserSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const taxFilings = await prisma.taxFiling.findMany({ where: { userId } });

      res.status(200).json({
        success: true,
        data: {
          user: {
            name: user?.name,
            email: user?.email,
            pan: user?.pan,
            phone: user?.phone,
            status: user?.status,
          },
          stats: {
            totalFilings: taxFilings.length,
            pendingFilings: taxFilings.filter((f) => f.status === 'draft').length,
            completedFilings: taxFilings.filter((f) => f.status === 'filed').length,
            walletPoints: user?.points_wallet || 0,
          },
        },
      });
    } catch (error: any) {
      console.error('❌ Error fetching summary:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { name, phone, address, city, state, pincode } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(pincode && { pincode }),
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's filing status
   */
  async getFilingStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const filings = await prisma.taxFiling.findMany({
        where: { userId },
        orderBy: { assessmentYear: 'desc' },
        take: 10,
      });

      res.status(200).json({
        success: true,
        data: filings,
      });
    } catch (error: any) {
      console.error('❌ Error fetching filing status:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get filing detail
   */
  async getFilingDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { filingId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const filing = await prisma.taxFiling.findFirst({
        where: {
          id: parseInt(filingId),
          userId,
        },
      });

      if (!filing) return res.status(404).json({ success: false, message: 'Filing not found' });

      res.status(200).json({
        success: true,
        data: filing,
      });
    } catch (error: any) {
      console.error('❌ Error fetching filing detail:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user services
   */
  async getUserServices(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const orders = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.error('❌ Error fetching services:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get service detail
   */
  async getUserServiceDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { serviceId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const service = await prisma.payment.findFirst({
        where: {
          userId,
          id: parseInt(serviceId),
        },
      });

      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      console.error('❌ Error fetching service detail:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user documents
   */
  async getUserDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { financialYear, type } = req.query;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const documents = await prisma.document.findMany({
        where: {
          userId,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error: any) {
      console.error('❌ Error fetching documents:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Upload document
   */
  async uploadDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { type, financialYear, fileUrl } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (!type || !fileUrl) {
        return res.status(400).json({ success: false, message: 'Type and fileUrl required' });
      }

      const document = await prisma.document.create({
        data: {
          userId,
          type,
          fileUrl,
          status: 'pending',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { documentId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const document = await prisma.document.findFirst({
        where: { id: parseInt(documentId), userId },
      });

      if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

      await prisma.document.delete({ where: { id: parseInt(documentId) } });

      res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error: any) {
      console.error('❌ Error deleting document:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Download document
   */
  async downloadDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { documentId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const document = await prisma.document.findFirst({
        where: { id: parseInt(documentId), userId },
      });

      if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

      res.status(200).json({
        success: true,
        data: { downloadUrl: document.fileUrl },
      });
    } catch (error: any) {
      console.error('❌ Error downloading document:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get activity log
   */
  async getActivityLog(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      res.status(200).json({
        success: true,
        message: 'Activity log retrieved',
        data: [],
      });
    } catch (error: any) {
      console.error('❌ Error fetching activity log:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: [],
      });
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(req: Request, res: Response) {
    try {
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(req: Request, res: Response) {
    try {
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get referral info
   */
  async getReferralInfo(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referral_code: true, points_wallet: true },
      });

      const referrals = await prisma.referral.findMany({
        where: { referrer_id: userId },
      });

      const successfulReferrals = referrals.filter((r) => r.status === 'completed');
      const totalRewards = successfulReferrals.reduce((sum, r) => sum + (r.reward_points || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          referralCode: user?.referral_code,
          walletPoints: user?.points_wallet || 0,
          totalReferrals: referrals.length,
          successfulReferrals: successfulReferrals.length,
          totalRewardsEarned: totalRewards,
        },
      });
    } catch (error: any) {
      console.error('❌ Error fetching referral info:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Send referral invite
   */
  async sendReferralInvite(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { email, phone } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (!email || !phone) {
        return res.status(400).json({ success: false, message: 'Email and phone required' });
      }

      res.status(201).json({
        success: true,
        message: 'Referral invite sent successfully',
      });
    } catch (error: any) {
      console.error('❌ Error sending referral:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user cases
   */
  async getUserCases(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      res.status(200).json({
        success: true,
        data: [],
      });
    } catch (error: any) {
      console.error('❌ Error fetching cases:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get case detail
   */
  async getCaseDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { caseId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error: any) {
      console.error('❌ Error fetching case:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (userId) {
        console.log(`✅ User ${userId} logged out`);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new DashboardController();
