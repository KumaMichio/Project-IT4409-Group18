const express = require('express');
const router = express.Router();
const {
  updateLessonProgress,
  markLessonComplete
} = require('../controllers/lessonController');

// POST /api/lessons/:lessonId/progress - Update lesson watch progress
router.post('/:lessonId/progress', updateLessonProgress);

// POST /api/lessons/:lessonId/complete - Mark lesson as completed
router.post('/:lessonId/complete', markLessonComplete);

module.exports = router;