const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════════════════
// Upload Document (Admin)
// ════════════════════════════════════════════════════════════════════
exports.uploadDocument = async (req, res) => {
  try {
    const { userId, title, description, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify file is PDF
    if (file.mimetype !== 'application/pdf') {
      // Delete uploaded file if not PDF
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Check file size (50MB max)
    if (file.size > 52428800) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'File size must be less than 50MB' });
    }

    // Create unique filename
    const uniqueFilename = `${Date.now()}_${file.originalname}`;
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalPath = path.join(uploadDir, uniqueFilename);
    fs.renameSync(file.path, finalPath);

    // Save document info to database
    const document = await prisma.document.create({
      data: {
        userId,
        title: title || file.originalname,
        description: description || '',
        type: type || 'consultation',
        fileName: file.originalname,
        fileSize: file.size,
        filePath: uniqueFilename,
        fileType: 'application/pdf',
        downloadUrl: `/api/documents/download/${uniqueFilename}`,
        uploadedBy: req.user?.id || 'admin',
        status: 'active',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Download Document (User)
// ════════════════════════════════════════════════════════════════════
exports.downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user?.id;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Find document in database
    const document = await prisma.document.findFirst({
      where: { filePath: filename },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Verify user has access to this document
    if (document.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check file exists
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Update download count
    await prisma.document.update({
      where: { id: document.id },
      data: { downloadCount: (document.downloadCount || 0) + 1 },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ error: 'Failed to download document' });
    });
  } catch (err) {
    console.error('Error downloading document:', err);
    res.status(500).json({ error: 'Failed to download document' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Get User Documents
// ════════════════════════════════════════════════════════════════════
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        fileSize: true,
        downloadCount: true,
        createdAt: true,
        downloadUrl: true,
      },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (err) {
    console.error('Error fetching user documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Get All Documents (Admin)
// ════════════════════════════════════════════════════════════════════
exports.getAllDocuments = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents,
      total: documents.length,
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Delete Document (Admin)
// ════════════════════════════════════════════════════════════════════
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, document.filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Update Document Status
// ════════════════════════════════════════════════════════════════════
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Document status updated',
      data: document,
    });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Get Document Statistics (Admin)
// ════════════════════════════════════════════════════════════════════
exports.getDocumentStats = async (req, res) => {
  try {
    const totalDocuments = await prisma.document.count();
    const activeDocuments = await prisma.document.count({
      where: { status: 'active' },
    });
    const totalDownloads = await prisma.document.aggregate({
      _sum: { downloadCount: true },
    });

    res.json({
      success: true,
      data: {
        totalDocuments,
        activeDocuments,
        totalDownloads: totalDownloads._sum.downloadCount || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching document stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
