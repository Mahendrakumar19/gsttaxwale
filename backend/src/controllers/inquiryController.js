const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Log a customer inquiry
async function createInquiry(req, res) {
  const { inquiryType, content, contactInfo } = req.body;
  const userId = req.user?.id || null;

  if (!inquiryType || !content) {
    return res.status(400).json({ error: 'Inquiry type and content are required' });
  }

  const inquiry = await prisma.inquiryLog.create({
    data: {
      userId: userId || null,
      inquiryType,
      content,
      contactInfo: contactInfo || null,
      status: 'pending'
    },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  res.json({ data: { inquiry }, message: 'Inquiry logged successfully' });
}

// Get all inquiries (admin only)
async function getAllInquiries(req, res) {
  const inquiries = await prisma.inquiryLog.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { inquiries } });
}

// Get user's inquiries
async function getUserInquiries(req, res) {
  const userId = req.user.id;

  const inquiries = await prisma.inquiryLog.findMany({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { inquiries } });
}

// Get inquiry by ID
async function getInquiry(req, res) {
  const { id } = req.params;

  const inquiry = await prisma.inquiryLog.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  res.json({ data: { inquiry } });
}

// Update inquiry status and add notes (admin)
async function updateInquiry(req, res) {
  const { id } = req.params;
  const { status, notes, contactedAt, followUpDate } = req.body;

  const inquiry = await prisma.inquiryLog.findUnique({ where: { id } });
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;
  if (contactedAt) updateData.contactedAt = new Date(contactedAt);
  if (followUpDate) updateData.followUpDate = new Date(followUpDate);

  const updatedInquiry = await prisma.inquiryLog.update({
    where: { id },
    data: updateData,
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  res.json({ data: { inquiry: updatedInquiry }, message: 'Inquiry updated successfully' });
}

// Get inquiry stats (admin dashboard)
async function getInquiryStats(req, res) {
  const stats = await prisma.inquiryLog.groupBy({
    by: ['inquiryType', 'status'],
    _count: { id: true }
  });

  res.json({ data: { stats } });
}

module.exports = {
  createInquiry,
  getAllInquiries,
  getUserInquiries,
  getInquiry,
  updateInquiry,
  getInquiryStats
};
