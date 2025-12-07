const pool = require('../config/db');

// Get course details with modules and lessons
const getCourseContent = async (req, res) => {
  const {
    courseId
  } = req.params;
  const studentId = req.query.studentId; // TODO: Get from JWT token in production

  try {
    // Check if student is enrolled
    const enrollmentCheck = await pool.query(
      `SELECT id, status FROM enrollments 
       WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({
        error: 'Not enrolled in this course'
      });
    }

    // Get course details
    const courseQuery = await pool.query(
      `SELECT c.id, c.title, c.description, c.thumbnail_url, 
              u.full_name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );

    if (courseQuery.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Get modules with lessons
    const modulesQuery = await pool.query(
      `SELECT m.id, m.title, m.position
       FROM modules m
       WHERE m.course_id = $1
       ORDER BY m.position`,
      [courseId]
    );

    // Get all lessons for this course with progress
    const lessonsQuery = await pool.query(
      `SELECT 
        l.id, l.module_id, l.title, l.position, l.duration_s, l.requires_quiz_pass,
        COALESCE(slp.watched_s, 0) as watched_s,
        COALESCE(slp.is_completed, false) as is_completed
       FROM lessons l
       LEFT JOIN student_lesson_progress slp 
         ON l.id = slp.lesson_id AND slp.student_id = $2
       WHERE l.module_id IN (
         SELECT id FROM modules WHERE course_id = $1
       )
       ORDER BY l.position`,
      [courseId, studentId]
    );

    // Get lesson assets (video, PDF, quiz links)
    const assetsQuery = await pool.query(
      `SELECT 
        la.id, la.lesson_id, la.asset_kind, la.url, la.meta, la.position
       FROM lesson_assets la
       WHERE la.lesson_id IN (
         SELECT l.id FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1
       )
       ORDER BY la.position`,
      [courseId]
    );

    // Get quizzes for lessons
    const quizzesQuery = await pool.query(
      `SELECT 
        q.id, q.lesson_id, q.title, q.time_limit_s, q.attempts_allowed, q.pass_score
       FROM quizzes q
       WHERE q.lesson_id IN (
         SELECT l.id FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1
       )`,
      [courseId]
    );

    // Organize data
    const lessons = lessonsQuery.rows;
    const assets = assetsQuery.rows;
    const quizzes = quizzesQuery.rows;

    const modules = modulesQuery.rows.map(module => {
      const moduleLessons = lessons
        .filter(l => l.module_id === module.id)
        .map(lesson => ({
          ...lesson,
          assets: assets.filter(a => a.lesson_id === lesson.id),
          quiz: quizzes.find(q => q.lesson_id === lesson.id) || null
        }));

      return {
        ...module,
        lessons: moduleLessons
      };
    });

    res.json({
      course: courseQuery.rows[0],
      modules
    });

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

// Get course progress
const getCourseProgress = async (req, res) => {
  const {
    courseId
  } = req.params;
  const studentId = req.query.studentId; // TODO: Get from JWT token

  try {
    const progressQuery = await pool.query(
      `SELECT percent, updated_at
       FROM student_course_progress
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );

    if (progressQuery.rows.length === 0) {
      return res.json({
        percent: 0
      });
    }

    res.json(progressQuery.rows[0]);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

module.exports = {
  getCourseContent,
  getCourseProgress
};