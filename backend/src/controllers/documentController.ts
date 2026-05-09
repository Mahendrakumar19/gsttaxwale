// =============================================================================
// DOCUMENT CONTROLLER - Handle document uploads and management
// =============================================================================

const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Upload document
 */
async function uploadDocument(req, res) {
  try {
    const userId = req.user.id;
    const { documentType, financialYear } = req.body;
    const file = req.file;

    if (!file || !documentType) {
      return res.status(400).json(errorResponse('File and document type required'));
    }

    const [result] = await db.query(
      `INSERT INTO documents (user_id, document_type, financial_year, file_name, file_url, file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
      [userId, documentType, financialYear || null, file.filename, file.path, file.size]
    );

    console.log(`✅ Document uploaded: User ${userId}, Type: ${documentType}`);

    return res.status(200).json(
      successResponse('Document uploaded successfully', {
        documentId: result.insertId,
        fileName: file.filename,
      })
    );
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return res.status(500).json(errorResponse('Failed to upload document'));
  }
}

/**
 * Get user's documents
 */
async function getUserDocuments(req, res) {
  try {
    const userId = req.user.id;
    const { documentType, financialYear } = req.query;

    let query = 'SELECT * FROM documents WHERE user_id = ?';
    let params = [userId];

    if (documentType) {
      query += ' AND document_type = ?';
      params.push(documentType);
    }

    if (financialYear) {
      query += ' AND financial_year = ?';
      params.push(financialYear);
    }

    query += ' ORDER BY created_at DESC';

    const [documents] = await db.query(query, params);

    return res.status(200).json(
      successResponse('Documents retrieved', {
        documents,
        total: documents.length,
      })
    );
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return res.status(500).json(errorResponse('Failed to fetch documents'));
  }
}

/**
 * Delete document
 */
async function deleteDocument(req, res) {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const [doc] = await db.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (!doc) {
      return res.status(404).json(errorResponse('Document not found'));
    }

    await db.query('DELETE FROM documents WHERE id = ?', [documentId]);

    console.log(`✅ Document deleted: ID ${documentId}`);

    return res.status(200).json(successResponse('Document deleted successfully'));
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return res.status(500).json(errorResponse('Failed to delete document'));
  }
}

/**
 * Get financial years available for user
 */
async function getFinancialYears(req, res) {
  try {
    const userId = req.user.id;

    const [years] = await db.query(
      `SELECT DISTINCT financial_year FROM documents WHERE user_id = ? AND financial_year IS NOT NULL
       ORDER BY financial_year DESC`,
      [userId]
    );

    return res.status(200).json(
      successResponse('Financial years retrieved', {
        years: years.map(y => y.financial_year),
      })
    );
  } catch (error) {
    console.error('❌ Error fetching financial years:', error);
    return res.status(500).json(errorResponse('Failed to fetch financial years'));
  }
}

module.exports = {
  uploadDocument,
  getUserDocuments,
  deleteDocument,
  getFinancialYears,
};
