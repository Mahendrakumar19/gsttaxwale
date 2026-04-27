const prisma = require('../utils/prisma');

// Create a consultation (admin creates for user)
async function createConsultation(req, res) {
  const { userId, subject, description, consultationType, scheduledDate } = req.body;
  const adminId = req.user.id;

  if (!userId || !subject || !description || !consultationType) {
    return res.status(400).json({ error: 'User ID, subject, description, and consultation type are required' });
  }

  const consultation = await prisma.consultation.create({
    data: {
      userId,
      adminId,
      subject,
      description,
      consultationType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      status: 'assigned'
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      admin: { select: { id: true, name: true, email: true } }
    }
  });

  res.json({ data: { consultation }, message: 'Consultation created successfully' });
}

// Get user's consultations
async function getUserConsultations(req, res) {
  const userId = req.user.id;

  const consultations = await prisma.consultation.findMany({
    where: { userId },
    include: {
      admin: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { consultations } });
}

// Get all consultations (admin)
async function getAllConsultations(req, res) {
  const consultations = await prisma.consultation.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      admin: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { consultations } });
}

// Get consultation by ID
async function getConsultation(req, res) {
  const { id } = req.params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      admin: { select: { id: true, name: true, email: true } }
    }
  });

  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  res.json({ data: { consultation } });
}

// Update consultation (admin - add document, change status)
async function updateConsultation(req, res) {
  const { id } = req.params;
  const { status, documentName, documentUrl, completedAt, scheduledDate } = req.body;

  const consultation = await prisma.consultation.findUnique({ where: { id } });
  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (documentName) updateData.documentName = documentName;
  if (documentUrl) updateData.documentUrl = documentUrl;
  if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
  if (status === 'completed' && !completedAt) {
    updateData.completedAt = new Date();
  } else if (completedAt) {
    updateData.completedAt = new Date(completedAt);
  }

  const updatedConsultation = await prisma.consultation.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      admin: { select: { id: true, name: true, email: true } }
    }
  });

  res.json({ data: { consultation: updatedConsultation }, message: 'Consultation updated successfully' });
}

// Get consultation stats (admin dashboard)
async function getConsultationStats(req, res) {
  const stats = await prisma.consultation.groupBy({
    by: ['status', 'consultationType'],
    _count: { id: true }
  });

  res.json({ data: { stats } });
}

// Get consultation download URL (user can download document)
async function getConsultationDocument(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    select: { userId: true, documentUrl: true, documentName: true }
  });

  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  if (consultation.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!consultation.documentUrl) {
    return res.status(404).json({ error: 'No document available for this consultation' });
  }

  res.json({ 
    data: { 
      documentUrl: consultation.documentUrl,
      documentName: consultation.documentName
    } 
  });
}

module.exports = {
  createConsultation,
  getUserConsultations,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  getConsultationStats,
  getConsultationDocument
};
