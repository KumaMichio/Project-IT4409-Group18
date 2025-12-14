const quizService = require('../services/quiz.service');

class QuizController {
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const includeCorrectAnswers = req.query.includeCorrectAnswers === 'true';
      const quiz = await quizService.getQuiz(quizId, includeCorrectAnswers);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // If includeCorrectAnswers, send full data; otherwise hide correct answers
      if (includeCorrectAnswers) {
        return res.json(quiz);
      }

      // Don't send is_correct to frontend before submission
      const quizData = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          options: q.options.map(opt => ({
            id: opt.id,
            option_text: opt.option_text,
            position: opt.position
          }))
        }))
      };

      res.json(quizData);
    } catch (error) {
      console.error('Error getting quiz:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createAttempt(req, res) {
    try {
      const { quizId } = req.params;
      const studentId = req.user?.id; // Get from authenticated user

      if (!studentId) {
        console.error('[CREATE ATTEMPT] No studentId in req.user:', req.user);
        return res.status(401).json({ message: 'Authentication required' });
      }

      console.log(`[CREATE ATTEMPT] QuizId: ${quizId}, StudentId: ${studentId}`);
      const attempt = await quizService.createAttempt(quizId, studentId);
      console.log(`[CREATE ATTEMPT] Success:`, attempt);
      res.json({ 
        attemptId: attempt.id,
        id: attempt.id,
        startedAt: attempt.started_at,
        submitted_at: attempt.submitted_at,
        score: attempt.score,
        passed: attempt.passed
      });
    } catch (error) {
      console.error('[CREATE ATTEMPT] Error:', error.message);
      console.error('[CREATE ATTEMPT] Stack:', error.stack);
      if (error.message === 'Attempt limit exceeded') {
        return res.status(403).json({ message: 'Bạn đã hết lượt làm bài' });
      }
      if (error.message === 'Already passed') {
        return res.status(403).json({ 
          message: 'Bạn đã hoàn thành quiz này',
          alreadyPassed: true 
        });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  async submitAttempt(req, res) {
    try {
      const { quizId, attemptId } = req.params;
      const { answers } = req.body;

      const result = await quizService.submitAttempt(quizId, attemptId, answers);
      res.json(result);
    } catch (error) {
      console.error('Error submitting attempt:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getQuizzesByCourse(req, res) {
    try {
      const { courseId } = req.params;
      const quizzes = await quizService.getQuizzesByCourse(courseId);
      res.json(quizzes);
    } catch (error) {
      console.error('Error getting quizzes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getStudentAttempts(req, res) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id; // Get from authenticated user

      const attempts = await quizService.getStudentAttempts(quizId, studentId);
      res.json(attempts);
    } catch (error) {
      console.error('Error getting attempts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAttemptAnswers(req, res) {
    try {
      const { attemptId } = req.params;
      const answers = await quizService.getAttemptAnswers(attemptId);
      res.json(answers);
    } catch (error) {
      console.error('Error getting attempt answers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new QuizController();
