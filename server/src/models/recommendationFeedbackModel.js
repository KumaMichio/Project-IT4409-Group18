const db = require('../config/db');

async function upsertFeedback(userId, courseId, action) {
  const query = `
    INSERT INTO recommendation_feedback (user_id, course_id, action)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET action = EXCLUDED.action, updated_at = NOW()
    RETURNING *;
  `;
  const { rows } = await db.query(query, [userId, courseId, action]);
  return rows[0];
}

async function getFeedbackByUser(userId) {
  const query = `
    SELECT * FROM recommendation_feedback
    WHERE user_id = $1
    ORDER BY updated_at DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
}

async function getHiddenCourseIds(userId) {
  const query = `
    SELECT course_id
    FROM recommendation_feedback
    WHERE user_id = $1
      AND action IN ('NOT_INTERESTED', 'HIDE');
  `;
  const { rows } = await db.query(query, [userId]);
  return rows.map((r) => r.course_id);
}

module.exports = {
  upsertFeedback,
  getFeedbackByUser,
  getHiddenCourseIds,
};
