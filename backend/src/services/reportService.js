const { APIError } = require('../utils/helpers');

// For now, in-memory storage. Replace with Prisma when DB is ready
const reports = new Map();
let reportIdCounter = 1;

// ────────────────────────────────────────────────────────────────────
// CREATE REPORT
// ────────────────────────────────────────────────────────────────────
async function createReport(userId, title, inputData) {
  if (!title || !inputData) {
    throw new APIError('Title and inputData are required', 400);
  }

  const reportId = String(reportIdCounter++);
  const report = {
    id: reportId,
    userId,
    title,
    inputData,
    resultData: null,
    pdfUrl: null,
    status: 'pending',
    processedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reports.set(reportId, report);

  return {
    id: reportId,
    message: 'Report created, processing started',
  };
}

// ────────────────────────────────────────────────────────────────────
// GET REPORT
// ────────────────────────────────────────────────────────────────────
async function getReport(userId, reportId) {
  const report = reports.get(reportId);

  if (!report) {
    throw new APIError('Report not found', 404);
  }

  if (report.userId !== userId) {
    throw new APIError('Unauthorized to access this report', 403);
  }

  return report;
}

// ────────────────────────────────────────────────────────────────────
// LIST REPORTS
// ────────────────────────────────────────────────────────────────────
async function listReports(userId, page = 1, limit = 20) {
  const userReports = Array.from(reports.values())
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const skip = (page - 1) * limit;
  const paginatedReports = userReports.slice(skip, skip + limit);

  return {
    reports: paginatedReports,
    total: userReports.length,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(userReports.length / limit),
  };
}

// ────────────────────────────────────────────────────────────────────
// UPDATE REPORT STATUS
// ────────────────────────────────────────────────────────────────────
async function updateReportStatus(reportId, status, resultData = null, pdfUrl = null) {
  const report = reports.get(reportId);

  if (!report) {
    throw new APIError('Report not found', 404);
  }

  report.status = status;
  if (resultData) report.resultData = resultData;
  if (pdfUrl) report.pdfUrl = pdfUrl;
  if (status === 'completed') {
    report.processedAt = new Date().toISOString();
  }
  report.updatedAt = new Date().toISOString();

  reports.set(reportId, report);

  return report;
}

module.exports = {
  createReport,
  getReport,
  listReports,
  updateReportStatus,
};
