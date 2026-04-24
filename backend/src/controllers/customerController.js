const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all customers (admin only)
async function getAllCustomers(req, res) {
  const customers = await prisma.user.findMany({
    where: { role: 'user' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      pan: true,
      city: true,
      state: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          taxFilings: true,
          payments: true,
          tickets: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: { customers } });
}

// Get customer details (admin only)
async function getCustomerDetails(req, res) {
  const { id } = req.params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      taxFilings: {
        select: { id: true, assessmentYear: true, status: true, totalTax: true, createdAt: true }
      },
      payments: {
        select: { id: true, amount: true, status: true, createdAt: true }
      },
      tickets: {
        select: { id: true, subject: true, status: true, priority: true, createdAt: true }
      },
      inquiryLogs: {
        select: { id: true, inquiryType: true, status: true, createdAt: true }
      },
      referralsGiven: {
        select: { id: true, refereeEmail: true, referralStatus: true, commissionAmount: true, createdAt: true }
      }
    }
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Calculate totals
  const totalPaid = customer.payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
  const totalTaxFiled = customer.taxFilings.reduce((sum, t) => sum + (t.status === 'filed' ? 1 : 0), 0);

  res.json({ 
    data: { 
      customer,
      stats: {
        totalPaid,
        totalTaxFiled,
        totalTickets: customer.tickets.length,
        totalInquiries: customer.inquiryLogs.length,
        totalReferrals: customer.referralsGiven.length,
        totalReferralCommission: customer.referralsGiven.reduce((sum, r) => sum + (r.commissionAmount || 0), 0)
      }
    } 
  });
}

// Search customers (admin)
async function searchCustomers(req, res) {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  const customers = await prisma.user.findMany({
    where: {
      role: 'user',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { pan: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      pan: true,
      city: true,
      status: true,
      createdAt: true
    },
    take: 20
  });

  res.json({ data: { customers } });
}

// Get customer by email
async function getCustomerByEmail(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const customer = await prisma.user.findUnique({
    where: { email },
    include: {
      taxFilings: { select: { id: true, assessmentYear: true, status: true } },
      payments: { select: { id: true, amount: true, status: true } },
      referralsGiven: { select: { id: true, commissionAmount: true } }
    }
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ data: { customer } });
}

module.exports = {
  getAllCustomers,
  getCustomerDetails,
  searchCustomers,
  getCustomerByEmail
};
