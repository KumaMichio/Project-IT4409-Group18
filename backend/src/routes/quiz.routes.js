const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All quiz routes require authentication
router.use(authMiddleware);

// Get quiz by ID
router.get('/:quizId', quizController.getQuiz);

// Create quiz attempt
router.post('/:quizId/attempts', quizController.createAttempt);

// Submit quiz attempt
router.post('/:quizId/attempts/:attemptId/submit', quizController.submitAttempt);

// Get student attempts
router.get('/:quizId/attempts', quizController.getStudentAttempts);

// Get specific attempt answers
router.get('/:quizId/attempts/:attemptId/answers', quizController.getAttemptAnswers);

module.exports = router;
