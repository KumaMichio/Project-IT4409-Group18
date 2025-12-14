const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  updateLessonProgress,
  markLessonComplete
} = require('../controllers/lesson.controller');


router.post('/:lessonId/progress', authMiddleware, updateLessonProgress);


router.post('/:lessonId/complete', authMiddleware, markLessonComplete);

module.exports = router;