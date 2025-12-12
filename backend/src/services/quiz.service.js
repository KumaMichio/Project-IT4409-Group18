const quizRepository = require('../repositories/quiz.repository');

class QuizService {
  async getQuiz(quizId) {
    return await quizRepository.getQuizById(quizId);
  }

  async createAttempt(quizId, studentId) {
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if student has exceeded attempt limit
    const attemptCount = await quizRepository.getAttemptCount(quizId, studentId);
    if (quiz.attempts_allowed && attemptCount >= quiz.attempts_allowed) {
      throw new Error('Attempt limit exceeded');
    }

    const attemptNo = attemptCount + 1;
    return await quizRepository.createAttempt(quizId, studentId, attemptNo);
  }

  async submitAttempt(quizId, attemptId, answers) {
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let totalScore = 0;
    let earnedScore = 0;

    // Grade each answer
    for (const question of quiz.questions) {
      totalScore += question.points;
      
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer) continue;

      const correctOptionIds = question.options
        .filter(opt => opt.is_correct)
        .map(opt => opt.id);

      const selectedIds = answer.selectedOptionIds || [];
      
      // Check if answer is correct
      const isCorrect = 
        correctOptionIds.length === selectedIds.length &&
        correctOptionIds.every(id => selectedIds.includes(id)) &&
        selectedIds.every(id => correctOptionIds.includes(id));

      if (isCorrect) {
        earnedScore += question.points;
      }

      // Save answer
      await quizRepository.saveAnswer(attemptId, question.id, selectedIds, isCorrect);
    }

    const scorePercent = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = scorePercent >= quiz.pass_score;

    await quizRepository.submitAttempt(attemptId, earnedScore, passed);

    return {
      score: earnedScore,
      totalPoints: totalScore,
      scorePercent,
      passed,
      passScore: quiz.pass_score
    };
  }

  async getQuizzesByCourse(courseId) {
    return await quizRepository.getQuizzesByCourse(courseId);
  }

  async getStudentAttempts(quizId, studentId) {
    return await quizRepository.getStudentAttempts(quizId, studentId);
  }
}

module.exports = new QuizService();
