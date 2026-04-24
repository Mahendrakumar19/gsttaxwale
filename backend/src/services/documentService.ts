// Document Management Service - Handles document uploads, organization, admin uploads
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xlsx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload user document
 */
export async function uploadDocument(
  userId: string,
  file: any,
  documentType: string,
  category?: string,
  year?: number
) {
  try {
    // Validate file type and size
    if (!file || !file.filename) {
      throw new Error('No file provided');
    }

    const ext = path.extname(file.filename).substring(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`File type .${ext} not allowed`);
    }

    if (file.size && file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Save file
    const uploadDir = path.join(UPLOAD_DIR, 'user-documents', userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${documentType}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Move or copy file to upload directory
    if ('mv' in file) {
      await file.mv(filePath);
    } else {
      fs.copyFileSync(file.path, filePath);
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        documentType,
        fileName,
        filePath: `/uploads/user-documents/${userId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        category: category || 'general',
        year: year || new Date().getFullYear(),
        uploadedAt: new Date(),
        isAdminUploaded: false,
        uploadMetadata: {
          originalName: file.filename,
          uploadedFrom: 'user-portal',
          ipAddress: '', // Set by controller
        },
      },
    });

    return document;
  } catch (error: any) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
}

/**
 * Admin upload document (for user)
 */
export async function adminUploadDocument(
  userId: string,
  file: any,
  documentType: string,
  adminId: string,
  category?: string,
  year?: number,
  notes?: string
) {
  try {
    if (!file || !file.filename) {
      throw new Error('No file provided');
    }

    const ext = path.extname(file.filename).substring(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`File type .${ext} not allowed`);
    }

    // Save file in admin uploads directory
    const uploadDir = path.join(UPLOAD_DIR, 'admin-uploads', userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `admin_${documentType}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    if ('mv' in file) {
      await file.mv(filePath);
    } else {
      fs.copyFileSync(file.path, filePath);
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        documentType,
        fileName,
        filePath: `/uploads/admin-uploads/${userId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        category: category || 'admin-provided',
        year: year || new Date().getFullYear(),
        uploadedAt: new Date(),
        isAdminUploaded: true,
        uploadMetadata: {
          originalName: file.filename,
          uploadedBy: adminId,
          uploadedFrom: 'admin-panel',
          notes: notes,
        },
      },
    });

    return document;
  } catch (error: any) {
    throw new Error(`Admin document upload failed: ${error.message}`);
  }
}

/**
 * Get user documents with filtering
 */
export async function getUserDocuments(
  userId: string,
  filters?: {
    category?: string;
    documentType?: string;
    year?: number;
    isAdminUploaded?: boolean;
  }
) {
  try {
    const where: any = { userId };

    if (filters?.category) where.category = filters.category;
    if (filters?.documentType) where.documentType = filters.documentType;
    if (filters?.year) where.year = filters.year;
    if (filters?.isAdminUploaded !== undefined) where.isAdminUploaded = filters.isAdminUploaded;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        filePath: true,
        category: true,
        year: true,
        fileSize: true,
        uploadedAt: true,
        isAdminUploaded: true,
      },
    });

    return documents;
  } catch (error: any) {
    throw new Error(`Failed to get user documents: ${error.message}`);
  }
}

/**
 * Organize documents by category and year
 */
export async function getDocumentsOrganized(userId: string) {
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { category: 'asc' }, { uploadedAt: 'desc' }],
    });

    // Group by year, then category
    const organized = documents.reduce(
      (acc: any, doc) => {
        if (!acc[doc.year]) acc[doc.year] = {};
        if (!acc[doc.year][doc.category]) acc[doc.year][doc.category] = [];
        acc[doc.year][doc.category].push(doc);
        return acc;
      },
      {} as Record<number, Record<string, any[]>>
    );

    return organized;
  } catch (error: any) {
    throw new Error(`Failed to organize documents: ${error.message}`);
  }
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string, userId: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.userId !== userId) {
      throw new Error('Document not found or unauthorized');
    }

    // Delete physical file
    const filePath = path.join(UPLOAD_DIR, '..', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true, message: 'Document deleted' };
  } catch (error: any) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Get document categories for grouping
 */
export async function getDocumentCategories() {
  return [
    'general',
    'gst-invoice',
    'gst-return',
    'bank-statement',
    'purchase-bill',
    'expense-receipt',
    'itr-related',
    'audit-report',
    'admin-provided',
    'other',
  ];
}

/**
 * Search documents by content (filename/type)
 */
export async function searchDocuments(userId: string, query: string) {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        OR: [
          { documentType: { contains: query, mode: 'insensitive' } },
          { fileName: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  } catch (error: any) {
    throw new Error(`Document search failed: ${error.message}`);
  }
}

/**
 * Get document stats for user
 */
export async function getDocumentStats(userId: string) {
  try {
    const total = await prisma.document.count({
      where: { userId },
    });

    const byCategory = await prisma.document.groupBy({
      by: ['category'],
      where: { userId },
      _count: true,
    });

    const byYear = await prisma.document.groupBy({
      by: ['year'],
      where: { userId },
      _count: true,
    });

    const userUploaded = await prisma.document.count({
      where: { userId, isAdminUploaded: false },
    });

    const adminUploaded = await prisma.document.count({
      where: { userId, isAdminUploaded: true },
    });

    return {
      totalDocuments: total,
      userUploaded,
      adminUploaded,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      byYear: byYear.map((y) => ({
        year: y.year,
        count: y._count,
      })),
    };
  } catch (error: any) {
    throw new Error(`Failed to get document stats: ${error.message}`);
  }
}

/**
 * Get all documents for user (admin view)
 */
export async function getAllUserDocuments(userId: string) {
  try {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  } catch (error: any) {
    throw new Error(`Failed to get all documents: ${error.message}`);
  }
}

export default {
  uploadDocument,
  adminUploadDocument,
  getUserDocuments,
  getDocumentsOrganized,
  deleteDocument,
  getDocumentCategories,
  searchDocuments,
  getDocumentStats,
  getAllUserDocuments,
};
