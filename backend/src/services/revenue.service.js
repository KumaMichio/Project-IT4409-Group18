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

async function getAdminRevenueByDate(from, to, groupBy = 'day') {
  const range = normalizeDateRange(from, to);
  const data = await revenueModel.getRevenueByDate(range.from, range.to, groupBy);
  return { from: range.from, to: range.to, data };
}

async function getAdminRevenueByTag(from, to) {
  const range = normalizeDateRange(from, to);
  const result = await revenueModel.getRevenueByTag(range.from, range.to);
  return { from: range.from, to: range.to, data: result };
}

async function getAdminRevenueByCourse(from, to) {
  const range = normalizeDateRange(from, to);
  const result = await revenueModel.getRevenueByCourse(range.from, range.to);
  return { from: range.from, to: range.to, data: result };
}

async function getInstructorRevenue(instructorId, from, to) {
  const range = normalizeDateRange(from, to);
  const courses = await revenueModel.getRevenueByInstructorCourses(
    instructorId,
    range.from,
    range.to
  );
  
  // Calculate totals from courses array
  const total_revenue = courses.reduce((sum, course) => {
    return sum + parseFloat(course.total_revenue || 0);
  }, 0);
  
  const total_students = courses.reduce((sum, course) => {
    return sum + parseInt(course.total_students || 0);
  }, 0);
  
  // Format courses array to match frontend expectation
  const formattedCourses = courses.map(course => ({
    course_id: course.course_id,
    title: course.course_title,
    revenue: course.total_revenue ? String(course.total_revenue) : '0',
    students: parseInt(course.total_students || 0)
  }));
  
  return {
    total_revenue: String(total_revenue),
    total_students: total_students,
    courses: formattedCourses
  };
}

module.exports = {
  getAdminRevenueSummary,
  getAdminRevenueByCourse,
  getInstructorRevenue,
  getAdminRevenueByDate,
  getAdminRevenueByTag,
};