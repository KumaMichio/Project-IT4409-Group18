const quizRepository = require('../repositories/quiz.repository');

class QuizService {
  async getQuiz(quizId, includeCorrectAnswers = false) {
    return await quizRepository.getQuizById(quizId, includeCorrectAnswers);
  }

  async createAttempt(quizId, studentId) {
    console.log(`[SERVICE] createAttempt called - quizId: ${quizId}, studentId: ${studentId}`);
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if student has already passed the quiz FIRST
    const hasPassed = await quizRepository.hasPassedAttempt(quizId, studentId);
    console.log(`[SERVICE] hasPassed result: ${hasPassed}`);
    
    if (hasPassed) {
      // Student has already passed - return the passed attempt for review
      console.log(`[SERVICE] Student already passed this quiz, returning passed attempt for review`);
      const passedAttempt = await quizRepository.getPassedAttempt(quizId, studentId);
      return passedAttempt;
    }

    // Check if there's a pending attempt (not yet submitted)
    const pendingAttempt = await quizRepository.getPendingAttempt(quizId, studentId);
    if (pendingAttempt) {
      console.log(`[SERVICE] Found pending attempt #${pendingAttempt.attempt_no}, returning existing attempt`);
      return pendingAttempt;
    }
    
    if (hasPassed) {
      // Student has already passed - don't allow retake
      console.log(`[SERVICE] Student already passed this quiz, no retakes allowed`);
      throw new Error('Already passed');
    }
    
    // Student hasn't passed yet, allow unlimited attempts until they pass
    const attemptCount = await quizRepository.getAttemptCount(quizId, studentId);
    const attemptNo = attemptCount + 1;
    console.log(`[SERVICE] Student hasn't passed yet, creating attempt #${attemptNo} (unlimited until pass)`);
    return await quizRepository.createAttempt(quizId, studentId, attemptNo);
  }

  async submitAttempt(quizId, attemptId, answers) {
    // Get quiz with correct answers for grading
    const quiz = await quizRepository.getQuizById(quizId, true);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    console.log('[SUBMIT] Quiz ID:', quizId);
    console.log('[SUBMIT] Attempt ID:', attemptId);
    console.log('[SUBMIT] Answers received:', JSON.stringify(answers, null, 2));
    console.log('[SUBMIT] Quiz questions:', quiz.questions.map(q => ({ id: q.id, question: q.question })));

    let totalScore = 0;
    let earnedScore = 0;

    // Grade each answer
    for (const question of quiz.questions) {
      totalScore += question.points;
      
      // Convert question.id to number for comparison
      const questionId = parseInt(question.id);
      const answer = answers.find(a => a.questionId === questionId);
      if (!answer) {
        console.log(`[SUBMIT] Question ${questionId}: No answer provided`);
        continue;
      }

      const correctOptionIds = question.options
        .filter(opt => opt.is_correct)
        .map(opt => parseInt(opt.id)); // Convert to number

      const selectedIds = (answer.selectedOptionIds || []).map(id => parseInt(id)); // Convert to number
      
      console.log(`[SUBMIT] Question ${questionId}:`);
      console.log(`  - Correct IDs: [${correctOptionIds.join(', ')}]`);
      console.log(`  - Selected IDs: [${selectedIds.join(', ')}]`);
      
      // Check if answer is correct
      const isCorrect = 
        correctOptionIds.length === selectedIds.length &&
        correctOptionIds.every(id => selectedIds.includes(id)) &&
        selectedIds.every(id => correctOptionIds.includes(id));

      console.log(`  - Is Correct: ${isCorrect}`);

      if (isCorrect) {
        earnedScore += question.points;
      }

      // Save answer (use questionId for consistency)
      await quizRepository.saveAnswer(attemptId, questionId, selectedIds, isCorrect);
    }

    console.log(`[SUBMIT] Total Score: ${earnedScore}/${totalScore}`);

    const scorePercent = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = scorePercent >= quiz.pass_score;

    console.log(`[SUBMIT] Score Percent: ${scorePercent}%`);
    console.log(`[SUBMIT] Pass Score Required: ${quiz.pass_score}%`);
    console.log(`[SUBMIT] Passed: ${passed}`);

    await quizRepository.submitAttempt(attemptId, earnedScore, passed);

    return {
      score: earnedScore,
      totalPoints: totalScore,
      scorePercent,
      passed,
      passScore: quiz.pass_score,
      // Return quiz with correct answers for display
      quiz
    };
  }

  async getQuizzesByCourse(courseId) {
    return await quizRepository.getQuizzesByCourse(courseId);
  }

  async getStudentAttempts(quizId, studentId) {
    return await quizRepository.getStudentAttempts(quizId, studentId);
  }

  async getAttemptAnswers(attemptId) {
    return await quizRepository.getAttemptAnswers(attemptId);
  }
}

module.exports = new QuizService();
