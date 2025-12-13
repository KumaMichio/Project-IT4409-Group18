const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Get quiz by ID
router.get('/:quizId', quizController.getQuiz);

// Create quiz attempt
router.post('/:quizId/attempts', quizController.createAttempt);

// Submit quiz attempt
router.post('/:quizId/attempts/:attemptId/submit', quizController.submitAttempt);

// Get student attempts
router.get('/:quizId/attempts', quizController.getStudentAttempts);

// Create quiz
router.post('/', quizController.createQuiz);

// Delete quiz
router.delete('/:quizId', quizController.deleteQuiz);

module.exports = router;
