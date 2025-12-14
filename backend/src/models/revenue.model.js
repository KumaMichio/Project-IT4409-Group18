const pool = require('../config/db');

/**
 * Admin summary revenue
 */
async function getRevenueSummary(from, to) {
  const query = `
    SELECT
      COALESCE(SUM(p.amount_cents), 0) AS total_revenue,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'PAID') AS total_paid_transactions,
      COUNT(DISTINCT oi.course_id) AS total_courses
    FROM payments p
    LEFT JOIN orders o ON o.id = p.order_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2;
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
      COALESCE(SUM(p.amount_cents), 0) AS total_revenue,
      COUNT(DISTINCT o.user_id) FILTER (WHERE p.status = 'PAID') AS total_students
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN order_items oi ON oi.course_id = c.id
    LEFT JOIN orders o ON o.id = oi.order_id
    LEFT JOIN payments p ON p.order_id = o.id
      AND p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2
    GROUP BY c.id, c.title, u.full_name
    ORDER BY total_revenue DESC;
  `;
  const { rows } = await pool.query(query, [from, to]);
  return rows;
}

/**
 * Revenue by course for a specific instructor
 * Only calculate revenue from courses that belong to this instructor
 */
async function getRevenueByInstructorCourses(instructorId, from, to) {
  const query = `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      COALESCE(SUM(oi.price_cents), 0) AS total_revenue,
      COUNT(DISTINCT o.user_id) FILTER (WHERE p.status = 'PAID') AS total_students
    FROM courses c
    INNER JOIN order_items oi ON oi.course_id = c.id
    INNER JOIN orders o ON o.id = oi.order_id
    INNER JOIN payments p ON p.order_id = o.id
      AND p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2
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
