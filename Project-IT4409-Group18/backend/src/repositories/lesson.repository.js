const pool = require('../config/db');

class LessonRepository {
  async getLessonById(lessonId) {
    const result = await pool.query(
      `SELECT id, title, duration_s FROM lessons WHERE id = $1`,
      [lessonId]
    );
    return result.rows[0];
  }

  async getLessonProgress(studentId, lessonId) {
    const result = await pool.query(
      `SELECT * FROM student_lesson_progress 
       WHERE student_id = $1 AND lesson_id = $2`,
      [studentId, lessonId]
    );
    return result.rows[0];
  }

  async createLessonProgress(studentId, lessonId, watchedSeconds, isCompleted) {
    await pool.query(
      `INSERT INTO student_lesson_progress 
       (student_id, lesson_id, watched_s, is_completed, last_seen_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [studentId, lessonId, watchedSeconds, isCompleted]
    );
  }

  async updateLessonProgress(studentId, lessonId, watchedSeconds, isCompleted) {
    await pool.query(
      `UPDATE student_lesson_progress 
       SET watched_s = $3, is_completed = $4, last_seen_at = NOW()
       WHERE student_id = $1 AND lesson_id = $2`,
      [studentId, lessonId, watchedSeconds, isCompleted]
    );
  }

  async markLessonComplete(studentId, lessonId) {
    await pool.query(
      `INSERT INTO student_lesson_progress 
       (student_id, lesson_id, is_completed, last_seen_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (student_id, lesson_id)
       DO UPDATE SET is_completed = true, last_seen_at = NOW()`,
      [studentId, lessonId]
    );
  }
}

module.exports = new LessonRepository();
