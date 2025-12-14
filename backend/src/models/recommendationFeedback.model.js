const pool = require('../config/db');

async function upsertFeedback(userId, courseId, action) {
  const query = `
    INSERT INTO rec_feedback (user_id, course_id, feedback_type)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET feedback_type = EXCLUDED.feedback_type, updated_at = NOW()
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, courseId, action]);
  return rows[0];
}

async function getFeedbackByUser(userId) {
  const query = `
    SELECT * FROM rec_feedback
    WHERE user_id = $1
    ORDER BY updated_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}

async function getHiddenCourseIds(userId) {
  const query = `
    SELECT course_id
    FROM rec_feedback
    WHERE user_id = $1
      AND feedback_type IN ('NOT_INTERESTED', 'HIDE');
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows.map((r) => r.course_id);
}

module.exports = {
  upsertFeedback,
  getFeedbackByUser,
  getHiddenCourseIds,
};
