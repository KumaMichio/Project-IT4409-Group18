const express = require('express');
const router = express.Router();
const {
  getCourseContent,
  getCourseProgress,
  getCourseDetail,
  getRelatedCourses
} = require('../controllers/course.controller');

// GET /api/courses/:courseId/content - Get course modules, lessons, assets
router.get('/:courseId/content', getCourseContent);

// GET /api/courses/:courseId/progress - Get course progress
router.get('/:courseId/progress', getCourseProgress);

// GET /api/courses/:courseId/related - Get related courses
router.get('/:courseId/related', getRelatedCourses);

// GET /api/courses/:courseId - Get course detail (for detail page)
// Must be last to avoid catching /content and /progress
router.get('/:courseId', getCourseDetail);

module.exports = router;