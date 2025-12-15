const pool = require('../config/db');

/**
 * Admin summary revenue
 * Tính tổng doanh thu từ order_items.price_cents để đảm bảo khớp với doanh thu theo course
 */
async function getRevenueSummary(from, to) {
  const query = `
    SELECT
      COALESCE(SUM(oi.price_cents), 0) AS total_revenue,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'PAID') AS total_paid_transactions,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'PAID' AND p.created_at::date = CURRENT_DATE) AS today_transactions,
      COUNT(DISTINCT oi.course_id) FILTER (WHERE p.status = 'PAID') AS total_courses,
      (SELECT COUNT(DISTINCT e.student_id) 
       FROM enrollments e
       WHERE e.status = 'ACTIVE') AS total_students
    FROM payments p
    INNER JOIN orders o ON o.id = p.order_id
    INNER JOIN order_items oi ON oi.order_id = o.id
    WHERE p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2;
  `;
  const { rows } = await pool.query(query, [from, to]);
  return rows[0];
}

/**
 * Get revenue by date for chart (grouped by day or month)
 * Tính từ order_items.price_cents để nhất quán với tổng doanh thu
 */
async function getRevenueByDate(from, to, groupBy = 'day') {
  let dateFormat, dateGroup;
  if (groupBy === 'month') {
    dateFormat = 'YYYY-MM';
    dateGroup = "DATE_TRUNC('month', p.created_at)";
  } else {
    dateFormat = 'YYYY-MM-DD';
    dateGroup = "DATE_TRUNC('day', p.created_at)";
  }

  const query = `
    SELECT
      TO_CHAR(${dateGroup}, $3) AS date,
      COALESCE(SUM(oi.price_cents), 0) AS revenue
    FROM payments p
    INNER JOIN orders o ON o.id = p.order_id
    INNER JOIN order_items oi ON oi.order_id = o.id
    WHERE p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2
    GROUP BY ${dateGroup}
    ORDER BY ${dateGroup} ASC;
  `;
  const { rows } = await pool.query(query, [from, to, dateFormat]);
  return rows;
}

/**
 * Revenue by course (Admin)
 * Tính doanh thu từ order_items.price_cents để tránh double counting khi một order có nhiều courses
 */
async function getRevenueByCourse(from, to) {
  const query = `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      u.full_name AS instructor_name,
      COALESCE(SUM(oi.price_cents), 0) AS total_revenue,
      COUNT(DISTINCT o.user_id) FILTER (WHERE p.status = 'PAID') AS total_students
    FROM courses c
    JOIN users u ON c.instructor_id = u.id
    LEFT JOIN order_items oi ON oi.course_id = c.id
    LEFT JOIN orders o ON o.id = oi.order_id
    LEFT JOIN payments p ON p.order_id = o.id
      AND p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2
    GROUP BY c.id, c.title, u.full_name
    HAVING COALESCE(SUM(oi.price_cents), 0) > 0
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

/**
 * Revenue by tag (Admin)
 * Tính doanh thu theo từng tag từ các courses đã bán
 */
async function getRevenueByTag(from, to) {
  const query = `
    SELECT
      t.id AS tag_id,
      t.name AS tag_name,
      COALESCE(SUM(oi.price_cents), 0) AS total_revenue,
      COUNT(DISTINCT oi.course_id) FILTER (WHERE p.status = 'PAID') AS course_count
    FROM tags t
    INNER JOIN course_tags ct ON ct.tag_id = t.id
    INNER JOIN order_items oi ON oi.course_id = ct.course_id
    INNER JOIN orders o ON o.id = oi.order_id
    INNER JOIN payments p ON p.order_id = o.id
      AND p.status = 'PAID'
      AND p.created_at BETWEEN $1 AND $2
    GROUP BY t.id, t.name
    HAVING COALESCE(SUM(oi.price_cents), 0) > 0
    ORDER BY total_revenue DESC;
  `;
  const { rows } = await pool.query(query, [from, to]);
  return rows;
}

module.exports = {
  getRevenueSummary,
  getRevenueByCourse,
  getRevenueByInstructorCourses,
  getRevenueByDate,
  getRevenueByTag,
};
