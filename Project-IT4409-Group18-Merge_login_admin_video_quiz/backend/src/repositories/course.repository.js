const pool = require('../config/db');

class CourseRepository {
  async checkEnrollment(courseId, studentId) {
    const result = await pool.query(
      `SELECT id, status FROM enrollments 
       WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
      [courseId, studentId]
    );
    return result.rows[0];
  }

  async getCourseById(courseId) {
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.thumbnail_url, 
              u.full_name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );
    return result.rows[0];
  }

  async getModulesByCourseId(courseId) {
    const result = await pool.query(
      `SELECT m.id, m.title, m.position
       FROM modules m
       WHERE m.course_id = $1
       ORDER BY m.position`,
      [courseId]
    );
    return result.rows;
  }

  async getLessonsByCourseId(courseId, studentId) {
    const result = await pool.query(
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
    return result.rows;
  }

  async getLessonsByCourseIdForInstructor(courseId) {
    const result = await pool.query(
      `SELECT 
        l.id, l.module_id, l.title, l.position, l.duration_s, l.requires_quiz_pass,
        la.url as video_url,
        (SELECT id FROM quizzes q WHERE q.lesson_id = l.id LIMIT 1) as quiz_id
       FROM lessons l
       LEFT JOIN lesson_assets la ON l.id = la.lesson_id AND la.asset_kind = 'VIDEO'
       WHERE l.module_id IN (
         SELECT id FROM modules WHERE course_id = $1
       )
       ORDER BY l.position`,
      [courseId]
    );
    return result.rows;
  }

  async getAssetsByCourseId(courseId) {
    const result = await pool.query(
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
    return result.rows;
  }

  async getQuizzesByCourseId(courseId) {
    const result = await pool.query(
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
    return result.rows;
  }

  async getCourseProgress(studentId, courseId) {
    const result = await pool.query(
      `SELECT percent, updated_at
       FROM student_course_progress
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    return result.rows[0];
  }

  async upsertCourseProgress(studentId, courseId, percent) {
    await pool.query(
      `INSERT INTO student_course_progress (student_id, course_id, percent, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET percent = $3, updated_at = NOW()`,
      [studentId, courseId, percent]
    );
  }

  async getCourseIdByLessonId(lessonId) {
    const result = await pool.query(
      `SELECT m.course_id 
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lessonId]
    );
    return result.rows[0]?.course_id;
  }

  async calculateCourseProgress(studentId, courseId) {
    const result = await pool.query(
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
    return result.rows[0];
  }

  async getCourseDetailById(courseId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.title, c.description, c.thumbnail_url, c.price_cents, 
        c.currency, c.lang, c.created_at, c.updated_at,
        u.id as instructor_id, u.full_name as instructor_name, u.avatar_url as instructor_avatar,
        ip.bio as instructor_bio, ip.headline as instructor_headline
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );
    return result.rows[0];
  }

  async getInstructorCourseById(courseId, instructorId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.title, c.description, c.thumbnail_url, c.price_cents, 
        c.currency, c.lang, c.created_at, c.updated_at, c.is_published,
        u.id as instructor_id, u.full_name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1 AND c.instructor_id = $2`,
      [courseId, instructorId]
    );
    return result.rows[0];
  }

  async getCourseStats(courseId) {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT l.id) as total_lessons,
        COALESCE(SUM(l.duration_s), 0) as total_duration_s,
        COUNT(DISTINCT m.id) as total_modules
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON m.id = l.module_id
       WHERE c.id = $1`,
      [courseId]
    );
    return result.rows[0];
  }

  async getCourseReviews(courseId, limit = 10) {
    const result = await pool.query(
      `SELECT 
        cr.id, cr.rating, cr.comment, cr.created_at,
        u.full_name as student_name, u.avatar_url as student_avatar
       FROM course_reviews cr
       JOIN users u ON cr.student_id = u.id
       WHERE cr.course_id = $1
       ORDER BY cr.created_at DESC
       LIMIT $2`,
      [courseId, limit]
    );
    return result.rows;
  }

  async getCourseRating(courseId) {
    const result = await pool.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
       FROM course_reviews
       WHERE course_id = $1`,
      [courseId]
    );
    return result.rows[0];
  }

  async checkStudentEnrollment(courseId, studentId) {
    const result = await pool.query(
      `SELECT id, status, enrolled_at FROM enrollments 
       WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId]
    );
    return result.rows[0];
  }

  async getRelatedCourses(courseId, limit = 8) {
    const result = await pool.query(
      `WITH current_course AS (
        SELECT instructor_id FROM courses WHERE id = $1
      ),
      same_instructor AS (
        SELECT 
          c.id, c.title, c.slug, c.description, c.price_cents, c.thumbnail_url,
          u.full_name as instructor_name,
          COUNT(DISTINCT e.student_id) as total_students,
          COALESCE(AVG(cr.rating), 0) as avg_rating,
          1 as priority
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.instructor_id = (SELECT instructor_id FROM current_course)
          AND c.id != $1
          AND c.is_published = true
        GROUP BY c.id, u.full_name
      ),
      popular_courses AS (
        SELECT 
          c.id, c.title, c.slug, c.description, c.price_cents, c.thumbnail_url,
          u.full_name as instructor_name,
          COUNT(DISTINCT e.student_id) as total_students,
          COALESCE(AVG(cr.rating), 0) as avg_rating,
          2 as priority
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.id != $1
          AND c.is_published = true
          AND c.id NOT IN (SELECT id FROM same_instructor)
        GROUP BY c.id, u.full_name
        ORDER BY total_students DESC, avg_rating DESC
        LIMIT $2
      )
      SELECT * FROM same_instructor
      UNION ALL
      SELECT * FROM popular_courses
      ORDER BY priority, total_students DESC, avg_rating DESC
      LIMIT $2`,
      [courseId, limit]
    );
    return result.rows;
  }

  async createCourse(instructorId, { title, slug, description, price_cents, thumbnail_url, is_published }) {
    const result = await pool.query(
      `INSERT INTO courses (instructor_id, title, slug, description, price_cents, thumbnail_url, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [instructorId, title, slug, description, price_cents || 0, thumbnail_url, is_published || false]
    );
    return result.rows[0];
  }

  async updateCourse(courseId, { title, slug, description, price_cents, thumbnail_url, is_published }) {
    const result = await pool.query(
      `UPDATE courses 
       SET title = COALESCE($2, title),
           slug = COALESCE($3, slug),
           description = COALESCE($4, description),
           price_cents = COALESCE($5, price_cents),
           thumbnail_url = COALESCE($6, thumbnail_url),
           is_published = COALESCE($7, is_published),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [courseId, title, slug, description, price_cents, thumbnail_url, is_published]
    );
    return result.rows[0];
  }

  async deleteCourse(courseId) {
    await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
  }

  async getCoursesByInstructorId(instructorId) {
    const result = await pool.query(
      `SELECT c.*, 
        COUNT(DISTINCT e.student_id) as total_students,
        COALESCE(AVG(cr.rating), 0) as avg_rating
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
       LEFT JOIN course_reviews cr ON c.id = cr.course_id
       WHERE c.instructor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [instructorId]
    );
    return result.rows;
  }

  async getStudentsByCourseId(courseId) {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url, e.enrolled_at, e.status,
              COALESCE(scp.percent, 0) as progress
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       LEFT JOIN student_course_progress scp ON e.course_id = scp.course_id AND e.student_id = scp.student_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );
    return result.rows;
  }
}

module.exports = new CourseRepository();
