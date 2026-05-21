const db = require('../utils/db');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  try {
    const { customerId, customerName, customerPan, fiscalYear, month, category: rawCategory, displayTitle } = req.body;
    const files = req.files;

    console.log('📂 Multiple Document Upload Request:', { 
      customerId, 
      fiscalYear, 
      month,
      category: rawCategory,
      filesCount: files ? files.length : 0
    });

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    let targetCustomerId = customerId;
    if (customerId === 'me' || !customerId || req.userRole !== 'admin') {
      targetCustomerId = req.userId;
    }

    const parsedCustomerId = parseInt(targetCustomerId);
    if (isNaN(parsedCustomerId)) {
      files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
      return res.status(400).json({ error: 'Invalid Customer ID' });
    }

    // Normalize category to GST, ITR, or Others
    let category = 'Others';
    if (rawCategory) {
      const upper = rawCategory.toUpperCase();
      if (upper === 'GST') category = 'GST';
      else if (upper === 'ITR') category = 'ITR';
      else category = 'Others';
    }

    // Create organized directory structure
    const rootUploadDir = path.resolve(process.cwd(), 'uploads');
    const customerDir = path.join(rootUploadDir, parsedCustomerId.toString());
    const yearDir = path.join(customerDir, fiscalYear || 'general');
    const categoryDir = path.join(yearDir, category.toLowerCase());
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const uploadedDocuments = [];
    const titles = Array.isArray(displayTitle) ? displayTitle : [displayTitle];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uniqueFilename = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${file.originalname}`;
      const finalPath = path.join(categoryDir, uniqueFilename);

      // Use copy + unlink
      fs.copyFileSync(file.path, finalPath);
      fs.unlinkSync(file.path);

      // Use specific title if provided, otherwise fallback to original filename
      const finalDisplayName = titles[i] || displayTitle || file.originalname;
      
      const result = await db.query(`
        INSERT INTO Document (userId, downloadUrl, fileSize, fileName, uploadedBy, category, fiscalYear, month, title, type, status, fileType, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())
      `, [
        parsedCustomerId,
        `/api/documents/download/${uniqueFilename}`,
        file.size,
        uniqueFilename,
        parseInt(req.userId) || 1,
        category,
        fiscalYear || '',
        month || null,
        finalDisplayName,
        req.userRole === 'admin' ? 'admin-upload' : 'user-upload',
        file.mimetype
      ]);

      uploadedDocuments.push({
        id: result.insertId,
        fileName: uniqueFilename,
        originalName: finalDisplayName,
        category: category,
        fiscalYear: fiscalYear,
        month: month || null,
        fileSize: file.size
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      data: uploadedDocuments,
    });
  } catch (err) {
    console.error('❌ Error uploading documents:', err);
    if (req.files) {
      req.files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    }
    res.status(500).json({ error: 'Failed to upload documents: ' + err.message });
  }
};


// ════════════════════════════════════════════════════════════════════
// Download Document (User)
// ════════════════════════════════════════════════════════════════════
exports.downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.userId;
    console.log(`📥 Download request: ${filename} (User: ${userId}, Role: ${req.userRole})`);

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }


    // Find document in database
    const [document] = await db.query('SELECT * FROM Document WHERE fileName = ?', [filename]);

    if (!document) {
      return res.status(404).json({ error: 'Document not found in database' });
    }

    // Verify user has access to this document
    if (document.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check file exists on filesystem
    const rootUploadDir = path.resolve(process.cwd(), 'uploads');
    
    const findFile = (dir, target) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findFile(fullPath, target);
          if (found) return found;
        } else if (file === target) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = findFile(rootUploadDir, filename);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server storage' });
    }

    // Set response headers
    const mimeType = document.fileType || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // Ensure filename in header has extension if originalName doesn't
    let downloadName = document.title || document.fileName;
    const ext = path.extname(document.fileName);
    if (ext && !downloadName.toLowerCase().endsWith(ext.toLowerCase())) {
      downloadName += ext;
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);


    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download document' });
      }
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
    const userId = req.params.userId || req.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const documents = await db.query(`
      SELECT id, title, description, type, 
             fileSize, createdAt, downloadUrl, category, fiscalYear, month
      FROM Document
      WHERE userId = ? AND status = 'active'
      ORDER BY createdAt DESC
    `, [userId]);

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
    const { category, search, fiscalYear } = req.query;
    let sql = `
      SELECT d.*, u.name as customerName, u.pan as customerPan
      FROM Document d
      LEFT JOIN User u ON d.userId = u.id
      WHERE d.status != 'deleted'
    `;
    const params = [];

    if (category) {
      sql += ` AND d.category = ?`;
      params.push(category);
    }
    if (fiscalYear) {
      sql += ` AND d.fiscalYear = ?`;
      params.push(fiscalYear);
    }
    if (search) {
      sql += ` AND (d.title LIKE ? OR u.name LIKE ? OR u.pan LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY d.createdAt DESC`;

    const documents = await db.query(sql, params);

    res.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          title: doc.title,
          customerId: doc.userId,
          customerName: doc.customerName,
          customerPan: doc.customerPan,
          category: doc.category,
          fiscalYear: doc.fiscalYear,
          month: doc.month,
          status: doc.status,
          fileSize: doc.fileSize,
          uploadedAt: doc.createdAt,
          downloadUrl: doc.downloadUrl,
        })),
      },
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

    const [document] = await db.query('SELECT * FROM Document WHERE id = ?', [documentId]);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem if possible
    // (Search for it since we don't store full path in DB)
    const rootUploadDir = path.resolve(process.cwd(), 'uploads');
    const findFile = (dir, target) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findFile(fullPath, target);
          if (found) return found;
        } else if (file === target) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = findFile(rootUploadDir, document.fileName);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Soft delete from database
    await db.query("UPDATE Document SET status = 'deleted' WHERE id = ?", [documentId]);

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
// Archive Document (Admin)
// ════════════════════════════════════════════════════════════════════
exports.archiveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const [document] = await db.query('SELECT * FROM Document WHERE id = ?', [documentId]);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Set status to archived
    await db.query("UPDATE Document SET status = 'archived' WHERE id = ?", [documentId]);

    res.json({
      success: true,
      message: 'Document archived successfully',
    });
  } catch (err) {
    console.error('Error archiving document:', err);
    res.status(500).json({ error: 'Failed to archive document' });
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

    await db.query('UPDATE Document SET status = ? WHERE id = ?', [status, documentId]);

    res.json({
      success: true,
      message: 'Document status updated',
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
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalDocuments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeDocuments
      FROM Document
      WHERE status != 'deleted'
    `);

    res.json({
      success: true,
      data: {
        totalDocuments: stats.totalDocuments || 0,
        activeDocuments: stats.activeDocuments || 0,
        totalDownloads: 0, // Not tracked in new schema
      },
    });
  } catch (err) {
    console.error('Error fetching document stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// ════════════════════════════════════════════════════════════════════
// Get User Documents By Fiscal Year (User Dashboard - Month Grid View)
// ════════════════════════════════════════════════════════════════════
exports.getUserDocumentsByFY = async (req, res) => {
  try {
    const userId = req.userId;
    const { fy } = req.query;

    if (!fy) {
      return res.status(400).json({ error: 'Fiscal year (fy) required. e.g. fy=2025-26' });
    }

    // Support both "2025-26" and "FY2025-26" formats from admin
    const fyVariants = [fy, `FY${fy}`];

    const documents = await db.query(`
      SELECT id, title, fileName, fileType, fileSize, category, fiscalYear, month, downloadUrl, createdAt, status
      FROM Document
      WHERE userId = ?
        AND (fiscalYear = ? OR fiscalYear = ?)
        AND status = 'active'
      ORDER BY createdAt DESC
    `, [userId, fyVariants[0], fyVariants[1]]);

    // Organize into month-wise buckets
    const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

    const byMonth = {};
    MONTHS.forEach(m => { byMonth[m] = []; });
    byMonth['General'] = []; // For docs without a month

    documents.forEach(doc => {
      const m = doc.month;
      if (m && byMonth[m] !== undefined) {
        byMonth[m].push(doc);
      } else {
        byMonth['General'].push(doc);
      }
    });

    // Category grouping
    const byCategory = {
      GST: documents.filter(d => d.category?.toUpperCase() === 'GST'),
      ITR: documents.filter(d => d.category?.toUpperCase() === 'ITR'),
      Others: documents.filter(d => !['GST', 'ITR'].includes(d.category?.toUpperCase())),
    };

    res.json({
      success: true,
      data: {
        documents,
        byMonth,
        byCategory,
        fiscalYear: fy,
        total: documents.length,
      }
    });
  } catch (err) {
    console.error('Error in getUserDocumentsByFY:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};


// ════════════════════════════════════════════════════════════════════
// Get Available Financial Years (User)
// ════════════════════════════════════════════════════════════════════
exports.getFinancialYears = async (req, res) => {
  try {
    const userId = req.userId;

    const rows = await db.query(`
      SELECT DISTINCT fiscalYear
      FROM Document
      WHERE userId = ? AND status = 'active' AND fiscalYear IS NOT NULL AND fiscalYear != ''
      ORDER BY fiscalYear DESC
    `, [userId]);

    const years = rows.map(r => r.fiscalYear);

    // Always include all standard FY options 2021-22 to 2026-27
    const standard = ['FY2026-27','FY2025-26','FY2024-25','FY2023-24','FY2022-23','FY2021-22',
                      '2026-27','2025-26','2024-25','2023-24','2022-23','2021-22'];

    // Normalize: convert FY2025-26 → 2025-26 and deduplicate
    const normalizeYear = (y) => y.replace(/^FY/i, '');
    const allRaw = [...new Set([...years, ...standard])];
    const normalized = [...new Set(allRaw.map(normalizeYear))].sort((a, b) => b.localeCompare(a));

    res.json({ success: true, data: { years: normalized } });
  } catch (err) {
    console.error('Error fetching financial years:', err);
    res.status(500).json({ error: 'Failed to fetch financial years' });
  }
};

