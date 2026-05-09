// GST Service - Professional GST profile management
const db = require('../utils/db');

async function getUserGstProfile(userId) {
  const profile = await db.findOne('GstProfile', { userId });
  const taxFilings = await db.findMany('TaxFiling', { userId });
  
  return {
    profile,
    recentFilings: taxFilings.slice(0, 5).map(f => ({
      id: f.id,
      assessmentYear: f.assessmentYear,
      status: f.status,
      totalTax: f.totalTax,
      filingStatusAdmin: f.filingStatusAdmin,
    })),
    documents: await db.findMany('Document', { userId, category: 'gst' }),
  };
}

async function updateGstCompliance(userId, complianceStatus, nextDueDate) {
  await db.update('GstProfile', { userId }, {
    complianceStatus,
    nextDueDate: new Date(nextDueDate),
    updatedAt: new Date(),
  });
  
  // Update related tax filings
  await db.update('TaxFiling', { userId }, {
    filingStatusAdmin: complianceStatus,
    updatedAt: new Date(),
  }, { limit: 1 }); // Latest filing
  
  return { success: true };
}

module.exports = {
  getUserGstProfile,
  updateGstCompliance,
};

