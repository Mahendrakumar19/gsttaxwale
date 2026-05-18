const db = require('../utils/db');

// Log a customer inquiry
async function createInquiry(req, res) {
  try {
    const { inquiryType, content, contactInfo } = req.body;
    const userId = req.userId || req.user?.id || null;

    if (!inquiryType || !content) {
      return res.status(400).json({ error: 'Inquiry type and content are required' });
    }

    const result = await db.query(
      'INSERT INTO InquiryLog (userId, inquiryType, content, contactInfo, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, "pending", NOW(), NOW())',
      [userId, inquiryType, content, contactInfo || null]
    );

    const [inquiry] = await db.query('SELECT * FROM InquiryLog WHERE id = ?', [result.insertId]);

    res.json({ data: { inquiry }, message: 'Inquiry logged successfully' });
  } catch (err) {
    console.error('❌ Create inquiry error:', err);
    res.status(500).json({ error: 'Failed to create inquiry: ' + err.message });
  }
}

// Get all inquiries (admin only)
async function getAllInquiries(req, res) {
  try {
    const inquiries = await db.query(`
      SELECT i.*, u.name as userName, u.email as userEmail
      FROM InquiryLog i
      LEFT JOIN User u ON i.userId = u.id
      ORDER BY i.createdAt DESC
    `);

    const formattedInquiries = inquiries.map(i => ({
      ...i,
      user: i.userName ? { id: i.userId, name: i.userName, email: i.userEmail } : null
    }));

    res.json({ data: { inquiries: formattedInquiries } });
  } catch (err) {
    console.error('❌ Get all inquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries: ' + err.message });
  }
}

// Get user's inquiries
async function getUserInquiries(req, res) {
  try {
    const userId = req.userId || req.user?.id;

    const inquiries = await db.query(`
      SELECT i.*, u.name as userName, u.email as userEmail
      FROM InquiryLog i
      LEFT JOIN User u ON i.userId = u.id
      WHERE i.userId = ?
      ORDER BY i.createdAt DESC
    `, [userId]);

    const formattedInquiries = inquiries.map(i => ({
      ...i,
      user: i.userName ? { id: i.userId, name: i.userName, email: i.userEmail } : null
    }));

    res.json({ data: { inquiries: formattedInquiries } });
  } catch (err) {
    console.error('❌ Get user inquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch user inquiries: ' + err.message });
  }
}

// Get inquiry by ID
async function getInquiry(req, res) {
  try {
    const { id } = req.params;

    const [inquiry] = await db.query(`
      SELECT i.*, u.name as userName, u.email as userEmail
      FROM InquiryLog i
      LEFT JOIN User u ON i.userId = u.id
      WHERE i.id = ?
    `, [parseInt(id)]);

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const formattedInquiry = {
      ...inquiry,
      user: inquiry.userName ? { id: inquiry.userId, name: inquiry.userName, email: inquiry.userEmail } : null
    };

    res.json({ data: { inquiry: formattedInquiry } });
  } catch (err) {
    console.error('❌ Get inquiry error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiry: ' + err.message });
  }
}

// Update inquiry status and add notes (admin)
async function updateInquiry(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, contactedAt, followUpDate } = req.body;

    const [inquiry] = await db.query('SELECT * FROM InquiryLog WHERE id = ?', [parseInt(id)]);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (contactedAt) {
      updates.push('contactedAt = ?');
      params.push(new Date(contactedAt));
    }
    if (followUpDate) {
      updates.push('followUpDate = ?');
      params.push(new Date(followUpDate));
    }

    updates.push('updatedAt = NOW()');
    params.push(parseInt(id));

    await db.query(`UPDATE InquiryLog SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedInquiry] = await db.query(`
      SELECT i.*, u.name as userName, u.email as userEmail
      FROM InquiryLog i
      LEFT JOIN User u ON i.userId = u.id
      WHERE i.id = ?
    `, [parseInt(id)]);

    const formattedInquiry = {
      ...updatedInquiry,
      user: updatedInquiry.userName ? { id: updatedInquiry.userId, name: updatedInquiry.userName, email: updatedInquiry.userEmail } : null
    };

    res.json({ data: { inquiry: formattedInquiry }, message: 'Inquiry updated successfully' });
  } catch (err) {
    console.error('❌ Update inquiry error:', err);
    res.status(500).json({ error: 'Failed to update inquiry: ' + err.message });
  }
}

// Get inquiry stats (admin dashboard)
async function getInquiryStats(req, res) {
  try {
    const stats = await db.query(`
      SELECT inquiryType, status, COUNT(id) as count
      FROM InquiryLog
      GROUP BY inquiryType, status
    `);

    res.json({ data: { stats } });
  } catch (err) {
    console.error('❌ Get inquiry stats error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiry stats: ' + err.message });
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  getUserInquiries,
  getInquiry,
  updateInquiry,
  getInquiryStats
};
