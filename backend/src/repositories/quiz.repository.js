const db = require('../config/db');

class QuizRepository {
  async getQuizById(quizId, includeCorrectAnswers = false) {
    const quizResult = await db.query(
      `SELECT id, course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score
       FROM quizzes
       WHERE id = $1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return null;
    }

    const quiz = quizResult.rows[0];

    // Get questions with options
    const questionsResult = await db.query(
      `SELECT qq.id, qq.question, qq.qtype, qq.position, qq.points
       FROM quiz_questions qq
       WHERE qq.quiz_id = $1
       ORDER BY qq.position`,
      [quizId]
    );

    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        // Only include is_correct field if explicitly requested (after submission)
        const selectFields = includeCorrectAnswers
          ? 'id, option_text, is_correct, position'
          : 'id, option_text, position';
        
        const optionsResult = await db.query(
          `SELECT ${selectFields}
           FROM quiz_options
           WHERE question_id = $1
           ORDER BY position`,
          [question.id]
        );

        return {
          ...question,
          options: optionsResult.rows.map(opt => 
            includeCorrectAnswers 
              ? opt 
              : { ...opt, is_correct: false } // Send false by default to hide answer
          )
        };
      })
    );

    return {
      ...quiz,
      questions
    };
  }

  async getAttemptCount(quizId, studentId) {
    // Count all submitted attempts
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NOT NULL`,
      [quizId, studentId]
    );
    return parseInt(result.rows[0].count);
  }

  // Check if student has any passed attempt
  async hasPassedAttempt(quizId, studentId) {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NOT NULL AND passed = true`,
      [quizId, studentId]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Count passed attempts (for limit checking after passing)
  async getPassedAttemptCount(quizId, studentId) {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NOT NULL AND passed = true`,
      [quizId, studentId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get pending attempt (not yet submitted) for a student
  async getPendingAttempt(quizId, studentId) {
    const result = await db.query(
      `SELECT id, attempt_no, started_at
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NULL
       ORDER BY started_at DESC
       LIMIT 1`,
      [quizId, studentId]
    );
    return result.rows[0] || null;
  }

  async createAttempt(quizId, studentId, attemptNo) {
    const result = await db.query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, attempt_no, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, started_at`,
      [quizId, studentId, attemptNo]
    );
    return result.rows[0];
  }

  async submitAttempt(attemptId, score, passed) {
    await db.query(
      `UPDATE quiz_attempts
       SET submitted_at = NOW(), score = $2, passed = $3
       WHERE id = $1`,
      [attemptId, score, passed]
    );
  }

  async saveAnswer(attemptId, questionId, selectedOptionIds, isCorrect) {
    await db.query(
      `INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_ids, is_correct)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET selected_option_ids = $3, is_correct = $4`,
      [attemptId, questionId, selectedOptionIds, isCorrect]
    );
  }

  async getQuizzesByCourse(courseId) {
    const result = await db.query(
      `SELECT q.id, q.lesson_id, q.title, q.time_limit_s, q.attempts_allowed, q.pass_score,
              l.title as lesson_title
       FROM quizzes q
       LEFT JOIN lessons l ON q.lesson_id = l.id
       WHERE q.course_id = $1
       ORDER BY q.id`,
      [courseId]
    );
    return result.rows;
  }

  async getStudentAttempts(quizId, studentId) {
    const result = await db.query(
      `SELECT id, attempt_no, started_at, submitted_at, score, passed
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2
       ORDER BY attempt_no DESC`,
      [quizId, studentId]
    );
    return result.rows;
  }
}

module.exports = new QuizRepository();
