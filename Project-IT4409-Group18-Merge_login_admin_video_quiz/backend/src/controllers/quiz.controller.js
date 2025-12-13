const quizService = require('../services/quiz.service');

class QuizController {
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await quizService.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
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
      const { studentId } = req.body;

      console.log(`[CREATE ATTEMPT] QuizId: ${quizId}, StudentId: ${studentId}`);
      const attempt = await quizService.createAttempt(quizId, studentId);
      console.log(`[CREATE ATTEMPT] Success:`, attempt);
      res.json({ attemptId: attempt.id, startedAt: attempt.started_at });
    } catch (error) {
      console.error('[CREATE ATTEMPT] Error:', error.message);
      if (error.message === 'Attempt limit exceeded') {
        return res.status(403).json({ message: 'Bạn đã hết lượt làm bài' });
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
      const { studentId } = req.query;

      const attempts = await quizService.getStudentAttempts(quizId, studentId);
      res.json(attempts);
    } catch (error) {
      console.error('Error getting attempts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createQuiz(req, res) {
    try {
      const quizData = req.body;
      const newQuiz = await quizService.createQuiz(quizData);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;
      await quizService.deleteQuiz(quizId);
      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new QuizController();
