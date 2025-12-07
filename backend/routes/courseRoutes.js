const express = require('express');
const router = express.Router();
const {
  getCourseContent,
  getCourseProgress
} = require('../controllers/courseController');

// GET /api/courses/:courseId/content - Get course modules, lessons, assets
router.get('/:courseId/content', getCourseContent);

// GET /api/courses/:courseId/progress - Get course progress
router.get('/:courseId/progress', getCourseProgress);

module.exports = router;