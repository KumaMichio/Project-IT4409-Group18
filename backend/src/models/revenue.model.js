const pool = require('../config/db');

/**
 * Admin summary revenue
 */
async function getRevenueSummary(from, to) {
  const query = `
    SELECT
      COALESCE(SUM(amount), 0) AS total_revenue,
      COUNT(*) FILTER (WHERE status = 'PAID') AS total_paid_transactions,
      COUNT(DISTINCT course_id) AS total_courses
    FROM payments
    WHERE status = 'PAID'
      AND paid_at BETWEEN $1 AND $2;
  `;
  const { rows } = await pool.query(query, [from, to]);
  return rows[0];
}

/**
 * Revenue by course (Admin)
 */
async function getRevenueByCourse(from, to) {
  const query = `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      u.full_name AS instructor_name,
      COALESCE(SUM(p.amount), 0) AS total_revenue,
      COUNT(p.id) FILTER (WHERE p.status = 'PAID') AS total_students
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN payments p ON p.course_id = c.id
      AND p.status = 'PAID'
      AND p.paid_at BETWEEN $1 AND $2
    GROUP BY c.id, c.title, u.full_name
    ORDER BY total_revenue DESC;
  `;
  const { rows } = await pool.query(query, [from, to]);
  return rows;
}

/**
 * Revenue by course for a specific instructor
 */
async function getRevenueByInstructorCourses(instructorId, from, to) {
  const query = `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      COALESCE(SUM(p.amount), 0) AS total_revenue,
      COUNT(p.id) FILTER (WHERE p.status = 'PAID') AS total_students
    FROM courses c
    LEFT JOIN payments p
      ON p.course_id = c.id
      AND p.status = 'PAID'
      AND p.paid_at BETWEEN $1 AND $2
    WHERE c.instructor_id = $3
    GROUP BY c.id, c.title
    ORDER BY total_revenue DESC;
  `;
  const { rows } = await pool.query(query, [from, to, instructorId]);
  return rows;
}

module.exports = {
  getRevenueSummary,
  getRevenueByCourse,
  getRevenueByInstructorCourses,
};
