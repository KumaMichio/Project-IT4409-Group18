const pool = require('../config/db');

class ReviewRepository {
  async checkEnrollment(courseId, studentId) {
    const result = await pool.query(
      `SELECT id FROM enrollments 
       WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
      [courseId, studentId]
    );
    return result.rows.length > 0;
  }

  async getStudentReview(courseId, studentId) {
    const result = await pool.query(
      `SELECT id, course_id, student_id, rating, comment, created_at
       FROM course_reviews
       WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId]
    );
    return result.rows[0] || null;
  }

  async getReviewById(reviewId) {
    const result = await pool.query(
      `SELECT id, course_id, student_id, rating, comment, created_at
       FROM course_reviews
       WHERE id = $1`,
      [reviewId]
    );
    return result.rows[0] || null;
  }

  async createReview(courseId, studentId, rating, comment) {
    const result = await pool.query(
      `INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, course_id, student_id, rating, comment, created_at`,
      [courseId, studentId, rating, comment]
    );
    return result.rows[0];
  }

  async updateReview(reviewId, rating, comment) {
    const result = await pool.query(
      `UPDATE course_reviews
       SET rating = $2, comment = $3
       WHERE id = $1
       RETURNING id, course_id, student_id, rating, comment, created_at`,
      [reviewId, rating, comment]
    );
    return result.rows[0];
  }

  async deleteReview(reviewId) {
    await pool.query(
      `DELETE FROM course_reviews WHERE id = $1`,
      [reviewId]
    );
  }
}

module.exports = new ReviewRepository();

