const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const revenueController = require('../controllers/revenueController');

// Admin
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

// Instructor (giảng viên)
router.get(
  '/instructor/my-courses',
  authMiddleware,
  requireRole('INSTRUCTOR'),
  revenueController.getInstructorRevenue
);

module.exports = router;
