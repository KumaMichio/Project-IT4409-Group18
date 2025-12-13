const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Get quiz by ID (Public/Student view - hides answers)
router.get('/:quizId', quizController.getQuiz);

// Get quiz by ID (Instructor view - shows answers)
router.get('/:quizId/instructor', quizController.getInstructorQuiz);

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
