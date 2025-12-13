const pool = require('../config/db');

async function getSystemOverview() {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'INSTRUCTOR') AS total_instructors,
      (SELECT COUNT(*) FROM courses) AS total_courses,
      (SELECT COUNT(*) FROM courses WHERE is_published = TRUE) AS published_courses,
      (SELECT COUNT(*) FROM payments
        WHERE status = 'PAID'
          AND created_at::date = CURRENT_DATE) AS today_transactions,
      (SELECT COALESCE(SUM(amount_cents),0) FROM payments
        WHERE status = 'PAID'
          AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) AS month_revenue
  `;
  const { rows } = await pool.query(query);
  return rows[0];
}

module.exports = {
  getSystemOverview,
};
