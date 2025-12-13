const revenueService = require('../services/revenue.service');

async function getAdminSummary(req, res, next) {
  try {
    const { from, to } = req.query;
    const summary = await revenueService.getAdminRevenueSummary(from, to);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

async function getAdminByCourse(req, res, next) {
  try {
    const { from, to } = req.query;
    const result = await revenueService.getAdminRevenueByCourse(from, to);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getInstructorRevenue(req, res, next) {
  try {
    const { from, to } = req.query;
    const instructorId = req.user.id;
    const result = await revenueService.getInstructorRevenue(
      instructorId,
      from,
      to
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminSummary,
  getAdminByCourse,
  getInstructorRevenue,
};