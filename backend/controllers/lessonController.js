const pool = require('../config/db');

// Update lesson progress (watched time)
const updateLessonProgress = async (req, res) => {
  const {
    lessonId
  } = req.params;
  const {
    studentId,
    watchedSeconds
  } = req.body; // TODO: Get studentId from JWT token

  try {
    // Check if progress record exists
    const existingProgress = await pool.query(
      `SELECT * FROM student_lesson_progress 
       WHERE student_id = $1 AND lesson_id = $2`,
      [studentId, lessonId]
    );

    // Get lesson duration to check completion
    const lessonQuery = await pool.query(
      `SELECT duration_s FROM lessons WHERE id = $1`,
      [lessonId]
    );

    if (lessonQuery.rows.length === 0) {
      return res.status(404).json({
        error: 'Lesson not found'
      });
    }

    const lessonDuration = lessonQuery.rows[0].duration_s;
    const isCompleted = lessonDuration ? watchedSeconds >= lessonDuration * 0.9 : false;

    if (existingProgress.rows.length === 0) {
      // Insert new progress
      await pool.query(
        `INSERT INTO student_lesson_progress 
         (student_id, lesson_id, watched_s, is_completed, last_seen_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [studentId, lessonId, watchedSeconds, isCompleted]
      );
    } else {
      // Update existing progress
      await pool.query(
        `UPDATE student_lesson_progress 
         SET watched_s = $3, is_completed = $4, last_seen_at = NOW()
         WHERE student_id = $1 AND lesson_id = $2`,
        [studentId, lessonId, watchedSeconds, isCompleted]
      );
    }

    // Update overall course progress
    await updateCourseProgress(studentId, lessonId);

    res.json({
      success: true,
      watchedSeconds,
      isCompleted
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

// Helper function to update course progress
const updateCourseProgress = async (studentId, lessonId) => {
  try {
    // Get course_id from lesson
    const courseQuery = await pool.query(
      `SELECT m.course_id 
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lessonId]
    );

    if (courseQuery.rows.length === 0) return;

    const courseId = courseQuery.rows[0].course_id;

    // Calculate progress percentage
    const progressQuery = await pool.query(
      `SELECT 
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN slp.is_completed = true THEN 1 END) as completed_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       LEFT JOIN student_lesson_progress slp 
         ON l.id = slp.lesson_id AND slp.student_id = $1
       WHERE m.course_id = $2`,
      [studentId, courseId]
    );

    const {
      total_lessons,
      completed_lessons
    } = progressQuery.rows[0];
    const percent = total_lessons > 0 ?
      Math.round((completed_lessons / total_lessons) * 100) :
      0;

    // Upsert course progress
    await pool.query(
      `INSERT INTO student_course_progress (student_id, course_id, percent, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET percent = $3, updated_at = NOW()`,
      [studentId, courseId, percent]
    );

  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};

// Mark lesson as completed
const markLessonComplete = async (req, res) => {
  const {
    lessonId
  } = req.params;
  const {
    studentId
  } = req.body; // TODO: Get from JWT token

  try {
    await pool.query(
      `INSERT INTO student_lesson_progress 
       (student_id, lesson_id, is_completed, last_seen_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (student_id, lesson_id)
       DO UPDATE SET is_completed = true, last_seen_at = NOW()`,
      [studentId, lessonId]
    );

    await updateCourseProgress(studentId, lessonId);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

module.exports = {
  updateLessonProgress,
  markLessonComplete
};