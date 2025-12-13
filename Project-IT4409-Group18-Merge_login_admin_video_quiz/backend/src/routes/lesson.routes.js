const express = require('express');
const router = express.Router();
const {
  updateLessonProgress,
  markLessonComplete,
  updateLesson,
  deleteLesson
} = require('../controllers/lesson.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// INSTRUCTOR ROUTES
router.put('/:lessonId', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), updateLesson);
router.delete('/:lessonId', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), deleteLesson);

// STUDENT ROUTES
router.post('/:lessonId/progress', updateLessonProgress);
router.post('/:lessonId/complete', markLessonComplete);

module.exports = router;