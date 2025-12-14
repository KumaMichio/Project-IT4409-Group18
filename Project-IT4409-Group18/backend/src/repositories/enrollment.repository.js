const pool = require('../config/db');

class EnrollmentRepository {
  /**
   * Get all enrolled courses for a student
   * @param {number} studentId
   * @returns {Promise<Array>} Array of enrollments with course details
   */
  async getStudentEnrollments(studentId) {
    const result = await pool.query(
      `SELECT 
        e.id as enrollment_id,
        e.status as enrollment_status,
        e.enrolled_at,
        e.expires_at,
        c.id as course_id,
        c.title,
        c.slug,
        c.description,
        c.thumbnail_url,
        c.price_cents,
        c.currency,
        u.id as instructor_id,
        u.full_name as instructor_name,
        u.avatar_url as instructor_avatar,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        COUNT(DISTINCT cr.id) as review_count,
        COALESCE(scp.percent, 0) as progress_percent
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      LEFT JOIN student_course_progress scp ON c.id = scp.course_id AND scp.student_id = e.student_id
      WHERE e.student_id = $1 AND e.status = 'ACTIVE'
      GROUP BY e.id, e.status, e.enrolled_at, e.expires_at,
               c.id, c.title, c.slug, c.description, c.thumbnail_url,
               c.price_cents, c.currency, u.id, u.full_name, u.avatar_url,
               scp.percent
      ORDER BY e.enrolled_at DESC`,
      [studentId]
    );
    return result.rows;
  }

  /**
   * Get enrollment count for a student
   * @param {number} studentId
   * @returns {Promise<number>} Total enrollment count
   */
  async getStudentEnrollmentCount(studentId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total
       FROM enrollments
       WHERE student_id = $1 AND status = 'ACTIVE'`,
      [studentId]
    );
    return parseInt(result.rows[0].total);
  }

  /**
   * Enroll student in a course
   * @param {number} studentId
   * @param {number} courseId
   * @returns {Promise<Object>} Enrollment object
   */
  async enrollCourse(studentId, courseId) {
    // Check if course exists and is published
    const courseResult = await pool.query(
      `SELECT id, price_cents, is_published FROM courses WHERE id = $1`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      throw { status: 404, message: 'Khóa học không tồn tại' };
    }

    const course = courseResult.rows[0];
    if (!course.is_published) {
      throw { status: 400, message: 'Khóa học chưa được xuất bản' };
    }

    // Check if already enrolled
    const existingResult = await pool.query(
      `SELECT id FROM enrollments 
       WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
      [courseId, studentId]
    );

    if (existingResult.rows.length > 0) {
      throw { status: 400, message: 'Bạn đã đăng ký khóa học này' };
    }

    // Create enrollment
    const result = await pool.query(
      `INSERT INTO enrollments (course_id, student_id, status)
       VALUES ($1, $2, 'ACTIVE')
       ON CONFLICT (course_id, student_id) 
       DO UPDATE SET status = 'ACTIVE', enrolled_at = NOW()
       RETURNING *`,
      [courseId, studentId]
    );

    return result.rows[0];
  }
}

module.exports = new EnrollmentRepository();

