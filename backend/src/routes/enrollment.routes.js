const express = require('express');
const router = express.Router();
const { getMyCourses, enrollCourse } = require('../controllers/enrollment.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/enrollments/my-courses
 * @desc    Get all enrolled courses for authenticated user
 * @access  Private (Student)
 */
router.get('/my-courses', authMiddleware, getMyCourses);

/**
 * @route   POST /api/enrollments/enroll
 * @desc    Enroll in a course (for free courses)
 * @access  Private (Student)
 */
router.post('/enroll', authMiddleware, enrollCourse);

module.exports = router;

