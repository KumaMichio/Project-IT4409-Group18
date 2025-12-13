const pool = require('../config/db');

class LessonRepository {
  async createLesson(moduleId, title, position, duration_s = 0, requires_quiz_pass = false) {
    const result = await pool.query(
      `INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [moduleId, title, position, duration_s, requires_quiz_pass]
    );
    return result.rows[0];
  }

  async updateLesson(lessonId, title, position, duration_s, requires_quiz_pass) {
    const result = await pool.query(
      `UPDATE lessons 
       SET title = $2, position = $3, duration_s = $4, requires_quiz_pass = $5
       WHERE id = $1
       RETURNING *`,
      [lessonId, title, position, duration_s, requires_quiz_pass]
    );
    return result.rows[0];
  }

  async deleteLesson(lessonId) {
    await pool.query(
      `DELETE FROM lessons WHERE id = $1`,
      [lessonId]
    );
  }

  async getLessonById(lessonId) {
    const result = await pool.query(
      `SELECT * FROM lessons WHERE id = $1`,
      [lessonId]
    );
    return result.rows[0];
  }

  async getLessonsByModuleId(moduleId) {
    const result = await pool.query(
      `SELECT l.*, la.url as video_url,
              (SELECT id FROM quizzes q WHERE q.lesson_id = l.id LIMIT 1) as quiz_id
       FROM lessons l
       LEFT JOIN lesson_assets la ON l.id = la.lesson_id AND la.asset_kind = 'VIDEO'
       WHERE l.module_id = $1 
       ORDER BY l.position`,
      [moduleId]
    );
    return result.rows;
  }

  async upsertLessonVideo(lessonId, videoUrl) {
    if (!videoUrl) {
      // If url is empty, delete the video asset
      await pool.query(
        `DELETE FROM lesson_assets WHERE lesson_id = $1 AND asset_kind = 'VIDEO'`,
        [lessonId]
      );
      return;
    }

    await pool.query(
      `INSERT INTO lesson_assets (lesson_id, asset_kind, url, position)
       VALUES ($1, 'VIDEO', $2, 1)
       ON CONFLICT (id) DO UPDATE 
       SET url = $2`,
      [lessonId, videoUrl]
    );
    
    // Since we don't have a unique constraint on (lesson_id, asset_kind), 
    // we should probably check if one exists first or use a more robust approach.
    // For now, let's delete existing video assets and insert new one to be safe and simple.
    await pool.query(
      `DELETE FROM lesson_assets WHERE lesson_id = $1 AND asset_kind = 'VIDEO'`,
      [lessonId]
    );
    
    await pool.query(
      `INSERT INTO lesson_assets (lesson_id, asset_kind, url, position)
       VALUES ($1, 'VIDEO', $2, 1)`,
      [lessonId, videoUrl]
    );
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
