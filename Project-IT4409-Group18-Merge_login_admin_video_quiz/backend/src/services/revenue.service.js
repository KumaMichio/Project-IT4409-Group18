const revenueModel = require('../models/revenue.model');

function normalizeDateRange(from, to) {
  // Nếu không truyền, mặc định 30 ngày gần nhất
  const now = new Date();
  const defaultTo = now.toISOString();
  const defaultFrom = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  return {
    from: from || defaultFrom,
    to: to || defaultTo,
  };
}

async function getAdminRevenueSummary(from, to) {
  const range = normalizeDateRange(from, to);
  const summary = await revenueModel.getRevenueSummary(range.from, range.to);
  return { ...summary, from: range.from, to: range.to };
}

async function getAdminRevenueByCourse(from, to) {
  const range = normalizeDateRange(from, to);
  const result = await revenueModel.getRevenueByCourse(range.from, range.to);
  return { from: range.from, to: range.to, data: result };
}

async function getInstructorRevenue(instructorId, from, to) {
  const range = normalizeDateRange(from, to);
  const data = await revenueModel.getRevenueByInstructorCourses(
    instructorId,
    range.from,
    range.to
  );
  return { from: range.from, to: range.to, data };
}

module.exports = {
  getAdminRevenueSummary,
  getAdminRevenueByCourse,
  getInstructorRevenue,
};