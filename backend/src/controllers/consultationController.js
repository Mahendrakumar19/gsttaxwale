const db = require('../utils/db');

// Create a consultation (admin creates for user)
async function createConsultation(req, res) {
  try {
    const { userId, subject, description, consultationType, scheduledDate } = req.body;
    const adminId = req.userId || req.user?.id;

    if (!userId || !subject || !description || !consultationType) {
      return res.status(400).json({ error: 'User ID, subject, description, and consultation type are required' });
    }

    const result = await db.query(
      'INSERT INTO Consultation (userId, adminId, subject, description, consultationType, scheduledDate, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, "assigned", NOW(), NOW())',
      [userId, adminId, subject, description, consultationType, scheduledDate ? new Date(scheduledDate) : null]
    );

    const [consultation] = await db.query(`
      SELECT c.*, u.name as userName, u.email as userEmail, a.name as adminName, a.email as adminEmail
      FROM Consultation c
      LEFT JOIN User u ON c.userId = u.id
      LEFT JOIN User a ON c.adminId = a.id
      WHERE c.id = ?
    `, [result.insertId]);

    const formatted = {
      ...consultation,
      user: consultation.userName ? { id: consultation.userId, name: consultation.userName, email: consultation.userEmail } : null,
      admin: consultation.adminName ? { id: consultation.adminId, name: consultation.adminName, email: consultation.adminEmail } : null
    };

    res.json({ data: { consultation: formatted }, message: 'Consultation created successfully' });
  } catch (err) {
    console.error('❌ Create consultation error:', err);
    res.status(500).json({ error: 'Failed to create consultation: ' + err.message });
  }
}

// Get user's consultations
async function getUserConsultations(req, res) {
  try {
    const userId = req.userId || req.user?.id;

    const consultations = await db.query(`
      SELECT c.*, a.name as adminName, a.email as adminEmail
      FROM Consultation c
      LEFT JOIN User a ON c.adminId = a.id
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC
    `, [userId]);

    const formattedConsultations = consultations.map(c => ({
      ...c,
      admin: c.adminName ? { id: c.adminId, name: c.adminName, email: c.adminEmail } : null
    }));

    res.json({ data: { consultations: formattedConsultations } });
  } catch (err) {
    console.error('❌ Get user consultations error:', err);
    res.status(500).json({ error: 'Failed to fetch user consultations: ' + err.message });
  }
}

// Get all consultations (admin)
async function getAllConsultations(req, res) {
  try {
    const consultations = await db.query(`
      SELECT c.*, u.name as userName, u.email as userEmail, a.name as adminName, a.email as adminEmail
      FROM Consultation c
      LEFT JOIN User u ON c.userId = u.id
      LEFT JOIN User a ON c.adminId = a.id
      ORDER BY c.createdAt DESC
    `);

    const formattedConsultations = consultations.map(c => ({
      ...c,
      user: c.userName ? { id: c.userId, name: c.userName, email: c.userEmail } : null,
      admin: c.adminName ? { id: c.adminId, name: c.adminName, email: c.adminEmail } : null
    }));

    res.json({ data: { consultations: formattedConsultations } });
  } catch (err) {
    console.error('❌ Get all consultations error:', err);
    res.status(500).json({ error: 'Failed to fetch consultations: ' + err.message });
  }
}

// Get consultation by ID
async function getConsultation(req, res) {
  try {
    const { id } = req.params;

    const [consultation] = await db.query(`
      SELECT c.*, u.name as userName, u.email as userEmail, a.name as adminName, a.email as adminEmail
      FROM Consultation c
      LEFT JOIN User u ON c.userId = u.id
      LEFT JOIN User a ON c.adminId = a.id
      WHERE c.id = ?
    `, [parseInt(id)]);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const formattedConsultation = {
      ...consultation,
      user: consultation.userName ? { id: consultation.userId, name: consultation.userName, email: consultation.userEmail } : null,
      admin: consultation.adminName ? { id: consultation.adminId, name: consultation.adminName, email: consultation.adminEmail } : null
    };

    res.json({ data: { consultation: formattedConsultation } });
  } catch (err) {
    console.error('❌ Get consultation by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch consultation: ' + err.message });
  }
}

// Update consultation (admin - add document, change status)
async function updateConsultation(req, res) {
  try {
    const { id } = req.params;
    const { status, documentName, documentUrl, completedAt, scheduledDate } = req.body;

    const [consultation] = await db.query('SELECT * FROM Consultation WHERE id = ?', [parseInt(id)]);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (documentName !== undefined) {
      updates.push('documentName = ?');
      params.push(documentName);
    }
    if (documentUrl !== undefined) {
      updates.push('documentUrl = ?');
      params.push(documentUrl);
    }
    if (scheduledDate) {
      updates.push('scheduledDate = ?');
      params.push(new Date(scheduledDate));
    }
    if (status === 'completed' && !completedAt) {
      updates.push('completedAt = NOW()');
    } else if (completedAt) {
      updates.push('completedAt = ?');
      params.push(new Date(completedAt));
    }

    updates.push('updatedAt = NOW()');
    params.push(parseInt(id));

    await db.query(`UPDATE Consultation SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedConsultation] = await db.query(`
      SELECT c.*, u.name as userName, u.email as userEmail, a.name as adminName, a.email as adminEmail
      FROM Consultation c
      LEFT JOIN User u ON c.userId = u.id
      LEFT JOIN User a ON c.adminId = a.id
      WHERE c.id = ?
    `, [parseInt(id)]);

    const formattedConsultation = {
      ...updatedConsultation,
      user: updatedConsultation.userName ? { id: updatedConsultation.userId, name: updatedConsultation.userName, email: updatedConsultation.userEmail } : null,
      admin: updatedConsultation.adminName ? { id: updatedConsultation.adminId, name: updatedConsultation.adminName, email: updatedConsultation.adminEmail } : null
    };

    res.json({ data: { consultation: formattedConsultation }, message: 'Consultation updated successfully' });
  } catch (err) {
    console.error('❌ Update consultation error:', err);
    res.status(500).json({ error: 'Failed to update consultation: ' + err.message });
  }
}

// Get consultation stats (admin dashboard)
async function getConsultationStats(req, res) {
  try {
    const stats = await db.query(`
      SELECT status, consultationType, COUNT(id) as count
      FROM Consultation
      GROUP BY status, consultationType
    `);

    res.json({ data: { stats } });
  } catch (err) {
    console.error('❌ Get consultation stats error:', err);
    res.status(500).json({ error: 'Failed to fetch consultation stats: ' + err.message });
  }
}

// Get consultation download URL (user can download document)
async function getConsultationDocument(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id;

    const [consultation] = await db.query('SELECT userId, documentUrl, documentName FROM Consultation WHERE id = ?', [parseInt(id)]);

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
  } catch (err) {
    console.error('❌ Get consultation document error:', err);
    res.status(500).json({ error: 'Failed to fetch consultation document: ' + err.message });
  }
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
