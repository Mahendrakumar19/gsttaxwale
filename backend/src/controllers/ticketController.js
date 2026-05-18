const db = require('../utils/db');

// Create a new ticket (user support)
async function createTicket(req, res) {
  try {
    const { subject, description, category, priority } = req.body;
    const userId = req.userId || req.user?.id;

    if (!subject || !description || !category) {
      return res.status(400).json({ error: 'Subject, description, and category are required' });
    }

    const result = await db.query(
      'INSERT INTO SupportTicket (userId, subject, description, category, priority, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, "open", NOW(), NOW())',
      [userId, subject, description, category, priority || 'medium']
    );

    const [ticket] = await db.query('SELECT * FROM SupportTicket WHERE id = ?', [result.insertId]);

    res.json({ data: { ticket }, message: 'Ticket created successfully' });
  } catch (err) {
    console.error('❌ Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket: ' + err.message });
  }
}

// Get all tickets (admin only)
async function getAllTickets(req, res) {
  try {
    const tickets = await db.query(`
      SELECT t.*, u.name as userName, u.email as userEmail
      FROM SupportTicket t
      LEFT JOIN User u ON t.userId = u.id
      ORDER BY CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.createdAt DESC
    `);

    // Transform to match front-end expect of ticket.User
    const formattedTickets = tickets.map(t => ({
      ...t,
      User: t.userName ? { id: t.userId, name: t.userName, email: t.userEmail } : null
    }));

    res.json({ data: { tickets: formattedTickets } });
  } catch (err) {
    console.error('❌ Get all tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets: ' + err.message });
  }
}

// Get user's tickets
async function getUserTickets(req, res) {
  try {
    const userId = req.userId || req.user?.id;
    
    const tickets = await db.query(`
      SELECT t.*, u.name as userName, u.email as userEmail
      FROM SupportTicket t
      LEFT JOIN User u ON t.userId = u.id
      WHERE t.userId = ?
      ORDER BY t.createdAt DESC
    `, [userId]);

    const formattedTickets = tickets.map(t => ({
      ...t,
      User: t.userName ? { id: t.userId, name: t.userName, email: t.userEmail } : null
    }));

    res.json({ data: { tickets: formattedTickets } });
  } catch (err) {
    console.error('❌ Get user tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch user tickets: ' + err.message });
  }
}

// Get ticket by ID
async function getTicket(req, res) {
  try {
    const { id } = req.params;
    
    const [ticket] = await db.query(`
      SELECT t.*, u.name as userName, u.email as userEmail
      FROM SupportTicket t
      LEFT JOIN User u ON t.userId = u.id
      WHERE t.id = ?
    `, [parseInt(id)]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const formattedTicket = {
      ...ticket,
      User: ticket.userName ? { id: ticket.userId, name: ticket.userName, email: ticket.userEmail } : null
    };

    res.json({ data: { ticket: formattedTicket } });
  } catch (err) {
    console.error('❌ Get ticket by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket: ' + err.message });
  }
}

// Update ticket status (admin)
async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, resolution, priority, assignedTo } = req.body;

    const [ticket] = await db.query('SELECT * FROM SupportTicket WHERE id = ?', [parseInt(id)]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (resolution !== undefined) {
      updates.push('resolution = ?');
      params.push(resolution);
    }
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (assignedTo !== undefined) {
      updates.push('assignedTo = ?');
      params.push(assignedTo);
    }
    if (status === 'resolved' || status === 'closed') {
      updates.push('resolvedAt = NOW()');
    }

    updates.push('updatedAt = NOW()');
    params.push(parseInt(id));

    await db.query(`UPDATE SupportTicket SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedTicket] = await db.query(`
      SELECT t.*, u.name as userName, u.email as userEmail
      FROM SupportTicket t
      LEFT JOIN User u ON t.userId = u.id
      WHERE t.id = ?
    `, [parseInt(id)]);

    const formattedTicket = {
      ...updatedTicket,
      User: updatedTicket.userName ? { id: updatedTicket.userId, name: updatedTicket.userName, email: updatedTicket.userEmail } : null
    };

    res.json({ data: { ticket: formattedTicket }, message: 'Ticket updated successfully' });
  } catch (err) {
    console.error('❌ Update ticket error:', err);
    res.status(500).json({ error: 'Failed to update ticket: ' + err.message });
  }
}

// Delete ticket (admin only)
async function deleteTicket(req, res) {
  try {
    const { id } = req.params;

    const [ticket] = await db.query('SELECT * FROM SupportTicket WHERE id = ?', [parseInt(id)]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await db.query('DELETE FROM SupportTicket WHERE id = ?', [parseInt(id)]);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('❌ Delete ticket error:', err);
    res.status(500).json({ error: 'Failed to delete ticket: ' + err.message });
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicket,
  updateTicket,
  deleteTicket
};
