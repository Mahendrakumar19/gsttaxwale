const prisma = require('../utils/prisma');

// Create a new ticket (user support)
async function createTicket(req, res) {
  const { subject, description, category, priority } = req.body;
  const userId = req.user.id;

  if (!subject || !description || !category) {
    return res.status(400).json({ error: 'Subject, description, and category are required' });
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      subject,
      description,
      category,
      priority: priority || 'medium'
    },
    include: { user: true }
  });

  res.json({ data: { ticket }, message: 'Ticket created successfully' });
}

// Get all tickets (admin only)
async function getAllTickets(req, res) {
  const tickets = await prisma.ticket.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
  });

  res.json({ data: { tickets } });
}

// Get user's tickets
async function getUserTickets(req, res) {
  const userId = req.user.id;
  
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { tickets } });
}

// Get ticket by ID
async function getTicket(req, res) {
  const { id } = req.params;
  
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json({ data: { ticket } });
}

// Update ticket status (admin)
async function updateTicket(req, res) {
  const { id } = req.params;
  const { status, resolution, priority, assignedTo } = req.body;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (resolution) updateData.resolution = resolution;
  if (priority) updateData.priority = priority;
  if (assignedTo) updateData.assignedTo = assignedTo;
  if (status === 'resolved' || status === 'closed') {
    updateData.resolvedAt = new Date();
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: updateData,
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  res.json({ data: { ticket: updatedTicket }, message: 'Ticket updated successfully' });
}

// Delete ticket (admin only)
async function deleteTicket(req, res) {
  const { id } = req.params;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  await prisma.ticket.delete({ where: { id } });

  res.json({ message: 'Ticket deleted successfully' });
}

module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicket,
  updateTicket,
  deleteTicket
};
