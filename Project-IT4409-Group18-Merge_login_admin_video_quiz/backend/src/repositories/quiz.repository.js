const db = require('../config/db');

class QuizRepository {
  async getQuizById(quizId) {
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
        const optionsResult = await db.query(
          `SELECT id, option_text, is_correct, position
           FROM quiz_options
           WHERE question_id = $1
           ORDER BY position`,
          [question.id]
        );

        return {
          ...question,
          options: optionsResult.rows
        };
      })
    );

    return {
      ...quiz,
      questions
    };
  }

  async getAttemptCount(quizId, studentId) {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM quiz_attempts
       WHERE quiz_id = $1 AND student_id = $2`,
      [quizId, studentId]
    );
    return parseInt(result.rows[0].count);
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

  async createQuiz(quizData) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const { course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score, questions } = quizData;

      const quizResult = await client.query(
        `INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score]
      );
      const quizId = quizResult.rows[0].id;

      if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const qResult = await client.query(
            `INSERT INTO quiz_questions (quiz_id, question, qtype, position, points)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [quizId, q.question, q.qtype, i + 1, q.points || 1]
          );
          const qId = qResult.rows[0].id;

          if (q.options && q.options.length > 0) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = q.options[j];
              await client.query(
                `INSERT INTO quiz_options (question_id, option_text, is_correct, position)
                 VALUES ($1, $2, $3, $4)`,
                [qId, opt.option_text, opt.is_correct, j + 1]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      return { id: quizId, ...quizData };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async deleteQuiz(quizId) {
    await db.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
  }
}

module.exports = new QuizRepository();
