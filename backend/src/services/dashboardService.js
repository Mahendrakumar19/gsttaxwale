const { APIError } = require('../utils/helpers');

// Placeholder for report and user data access
// In a real app, these would be imported from a database module

// ────────────────────────────────────────────────────────────────────
// GET DASHBOARD DATA (User Dashboard)
// ────────────────────────────────────────────────────────────────────
async function getDashboard(userId, allReports = []) {
  // Filter reports for this user
  const userReports = allReports.filter(r => r.userId === userId);
  
  // Calculate statistics
  const totalReports = userReports.length;
  const completedReports = userReports.filter(r => r.status === 'completed').length;
  const pendingReports = userReports.filter(r => r.status === 'pending').length;
  const failedReports = userReports.filter(r => r.status === 'failed').length;

  // Calculate average tax saved (mock calculation)
  const totalTaxSaved = completedReports * 500; // Mock: $500 per completed report

  return {
    totalReports,
    completedReports,
    pendingReports,
    failedReports,
    totalTaxSaved,
    summary: {
      totalReports,
      completedReports,
      pendingReports,
      averageProcessingTime: '2-3 days', // Mock value
    },
    recentReports: userReports.slice(0, 5),
  };
}

// ────────────────────────────────────────────────────────────────────
// GET ADMIN ANALYTICS (Admin Dashboard)
// ────────────────────────────────────────────────────────────────────
async function getAdminAnalytics(allUsers = [], allReports = []) {
  // Calculate user stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.status === 'active').length;

  // Calculate report stats
  const totalReports = allReports.length;
  const completedReports = allReports.filter(r => r.status === 'completed').length;
  const pendingReports = allReports.filter(r => r.status === 'pending').length;
  const failedReports = allReports.filter(r => r.status === 'failed').length;

  // Calculate financial metrics
  const totalRevenue = completedReports * 100; // Mock: $100 per completed report
  const successRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;

  return {
    totalUsers,
    activeUsers,
    totalReports,
    completedReports,
    pendingReports,
    failedReports,
    totalRevenue,
    successRate: Math.round(successRate),
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: 0, // Mock value
    },
    reports: {
      total: totalReports,
      completed: completedReports,
      pending: pendingReports,
      failed: failedReports,
    },
    performance: {
      averageProcessingTime: '2-3 days', // Mock value
      successRate: Math.round(successRate),
    },
  };
}

module.exports = {
  getDashboard,
  getAdminAnalytics,
};
