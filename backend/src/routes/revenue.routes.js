const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const revenueController = require('../controllers/revenue.controller');

// Admin routes
router.get(
  '/admin/summary',
  authMiddleware,
  requireRole('ADMIN'),
  revenueController.getAdminSummary
);

router.get(
  '/admin/by-course',
  authMiddleware,
  requireRole('ADMIN'),
  revenueController.getAdminByCourse
);

router.get(
  '/admin/by-date',
  authMiddleware,
  requireRole('ADMIN'),
  revenueController.getAdminRevenueByDate
);

router.get(
  '/admin/by-tag',
  authMiddleware,
  requireRole('ADMIN'),
  revenueController.getAdminRevenueByTag
);

// Instructor routes
router.get(
  '/instructor/my-courses',
  authMiddleware,
  requireRole('INSTRUCTOR'),
  revenueController.getInstructorRevenue
);

module.exports = router;
