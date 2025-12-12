const express = require('express');
const router = express.Router();
const {
  updateLessonProgress,
  markLessonComplete
} = require('../controllers/lesson.controller');


router.post('/:lessonId/progress', updateLessonProgress);


router.post('/:lessonId/complete', markLessonComplete);

module.exports = router;