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

    // Check if there's a pending attempt (not yet submitted)
    const pendingAttempt = await quizRepository.getPendingAttempt(quizId, studentId);
    if (pendingAttempt) {
      console.log(`[SERVICE] Found pending attempt #${pendingAttempt.attempt_no}, returning existing attempt`);
      return pendingAttempt;
    }

    // Check if student has already passed the quiz
    const hasPassed = await quizRepository.hasPassedAttempt(quizId, studentId);
    
    if (hasPassed) {
      // Student has already passed, check if they can retake (if attempts_allowed is set)
      // Note: attempts_allowed now limits retakes after passing
      if (quiz.attempts_allowed) {
        const passedCount = await quizRepository.getPassedAttemptCount(quizId, studentId);
        if (passedCount >= quiz.attempts_allowed) {
          console.log(`[SERVICE] Quiz already passed ${passedCount} times, limit: ${quiz.attempts_allowed}`);
          throw new Error('Attempt limit exceeded');
        }
      }
      // If no limit or under limit, allow retake
      const attemptCount = await quizRepository.getAttemptCount(quizId, studentId);
      const attemptNo = attemptCount + 1;
      console.log(`[SERVICE] Student already passed, creating retake attempt #${attemptNo}`);
      return await quizRepository.createAttempt(quizId, studentId, attemptNo);
    } else {
      // Student hasn't passed yet, allow unlimited attempts until they pass
      const attemptCount = await quizRepository.getAttemptCount(quizId, studentId);
      const attemptNo = attemptCount + 1;
      console.log(`[SERVICE] Student hasn't passed yet, creating attempt #${attemptNo} (unlimited until pass)`);
      return await quizRepository.createAttempt(quizId, studentId, attemptNo);
    }
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
