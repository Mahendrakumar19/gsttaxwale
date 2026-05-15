const db = require('../utils/db');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  try {
    const { customerId, customerName, customerPan, fiscalYear, category: rawCategory, displayTitle } = req.body;
    const files = req.files;

    console.log('📂 Multiple Document Upload Request:', { 
      customerId, 
      fiscalYear, 
      category: rawCategory,
      filesCount: files ? files.length : 0
    });

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    if (!customerId) {
      files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const parsedCustomerId = parseInt(customerId);
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
    const customerDir = path.join(rootUploadDir, customerId.toString());
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
        INSERT INTO Document (userId, fileUrl, fileSize, filename, uploadedBy, category, financialYear, originalName, documentType, visible, mimeType, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())
      `, [
        parsedCustomerId,
        `/api/documents/download/${uniqueFilename}`,
        file.size,
        uniqueFilename,
        req.userId?.toString() || '1',
        category,
        fiscalYear || '',
        finalDisplayName,
        req.userRole === 'admin' ? 'admin-upload' : 'user-upload',
        file.mimetype
      ]);

      uploadedDocuments.push({
        id: result.insertId,
        fileName: uniqueFilename,
        originalName: finalDisplayName,
        category: category,
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
    const [document] = await db.query('SELECT * FROM Document WHERE filename = ?', [filename]);

    if (!document) {
      return res.status(404).json({ error: 'Document not found in database' });
    }

    // Verify user has access to this document
    if (document.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check file exists on filesystem
    const rootUploadDir = path.resolve(process.cwd(), 'uploads');
    
    // We need to find where the file is. Since we store relative paths in the code usually,
    // but the DB only has filename, we might need a search or a fixed structure.
    // However, the uploadDocument function creates: uploads/[customerId]/[financialYear]/[category]/[filename]
    // Let's search for the file in the uploads directory recursively if needed, 
    // or rely on a better path storage. 
    // For now, let's look in the standard place if we can reconstruct it.
    
    // Wait, the DB has fileUrl which contains the download path.
    // Let's find the file by searching the uploads directory for the filename.
    
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
    const mimeType = document.mimeType || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // Ensure filename in header has extension if originalName doesn't
    let downloadName = document.originalName || document.filename;
    const ext = path.extname(document.filename);
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
      SELECT id, originalName as title, notes as description, documentType as type, 
             fileSize, uploadedAt as createdAt, fileUrl as downloadUrl
      FROM Document
      WHERE userId = ? AND visible = 1 AND deletedAt IS NULL
      ORDER BY uploadedAt DESC
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
      WHERE d.deletedAt IS NULL
    `;
    const params = [];

    if (category) {
      sql += ` AND d.category = ?`;
      params.push(category);
    }
    if (fiscalYear) {
      sql += ` AND d.financialYear = ?`;
      params.push(fiscalYear);
    }
    if (search) {
      sql += ` AND (d.originalName LIKE ? OR u.name LIKE ? OR u.pan LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY d.uploadedAt DESC`;

    const documents = await db.query(sql, params);

    res.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          fileName: doc.filename,
          customerId: doc.userId,
          customerName: doc.customerName,
          customerPan: doc.customerPan,
          category: doc.category,
          fiscalYear: doc.financialYear,
          status: doc.visible ? 'active' : 'inactive',
          fileSize: doc.fileSize,
          uploadedAt: doc.uploadedAt,
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

    const filePath = findFile(rootUploadDir, document.filename);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Soft delete from database
    await db.query('UPDATE Document SET deletedAt = NOW(), visible = 0 WHERE id = ?', [documentId]);

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

    // Set visible to 0 for archiving
    await db.query('UPDATE Document SET visible = 0 WHERE id = ?', [documentId]);

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

    await db.query('UPDATE Document SET visible = ? WHERE id = ?', [status === 'active' ? 1 : 0, documentId]);

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
// Archive Document (Admin)
// ════════════════════════════════════════════════════════════════════
exports.archiveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    await db.query("UPDATE Document SET visible = 0, category = 'archived' WHERE id = ?", [documentId]);

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
// Get Document Statistics (Admin)
// ════════════════════════════════════════════════════════════════════
exports.getDocumentStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalDocuments,
        SUM(CASE WHEN visible = 1 THEN 1 ELSE 0 END) as activeDocuments
      FROM Document
      WHERE deletedAt IS NULL
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
// FLOW 2: USER OPENS DOCUMENT PAGE (Grouped)
// ════════════════════════════════════════════════════════════════════
exports.getGroupedDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    const { fy } = req.query;

    if (!fy) {
      return res.status(400).json({ error: 'Financial year (fy) is required' });
    }

    const documents = await db.query(`
      SELECT * FROM Document 
      WHERE userId = ? 
      AND (financialYear = ? OR financialYear = ?)
      AND visible = 1 
      AND deletedAt IS NULL
      ORDER BY uploadedAt DESC
    `, [userId, fy, `FY${fy}`]);

    // Grouping logic: ITR, GST, OTHER (Case-insensitive)
    const grouped = {
      ITR: documents.filter(d => d.category?.toUpperCase() === 'ITR'),
      GST: documents.filter(d => d.category?.toUpperCase() === 'GST'),
      OTHER: documents.filter(d => !['ITR', 'GST'].includes(d.category?.toUpperCase()))
    };


    res.json({
      success: true,
      data: grouped
    });
  } catch (err) {
    console.error('Error in getGroupedDocuments:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

