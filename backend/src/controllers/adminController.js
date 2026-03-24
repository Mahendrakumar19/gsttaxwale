const dashboardService = require('../services/dashboardService');
const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/helpers');

// Temporary: In-memory data stores (these will come from database in production)
let allUsers = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

let allReports = [
  {
    id: '1',
    userId: '1',
    title: '2024 Tax Return',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    title: '2023 Tax Return',
    status: 'completed',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ────────────────────────────────────────────────────────────────────
// GET ADMIN USERS
// ────────────────────────────────────────────────────────────────────
async function getUsers(req, res) {
  try {
    res.status(200).json(successResponse({ users: allUsers }, 'Users fetched successfully'));
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json(errorResponse(error.message, statusCode));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET ADMIN REPORTS
// ────────────────────────────────────────────────────────────────────
async function getReports(req, res) {
  try {
    res.status(200).json(successResponse({ reports: allReports }, 'Reports fetched successfully'));
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json(errorResponse(error.message, statusCode));
  }
}

// ────────────────────────────────────────────────────────────────────
// GET ADMIN ANALYTICS
// ────────────────────────────────────────────────────────────────────
async function getAnalytics(req, res) {
  try {
    const analytics = await dashboardService.getAdminAnalytics(allUsers, allReports);
    res.status(200).json(successResponse(analytics, 'Analytics fetched successfully'));
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json(errorResponse(error.message, statusCode));
  }
}

module.exports = {
  getUsers,
  getReports,
  getAnalytics,
};