const db = require('../config/db');

async function createLog(userId, action, detail) {
  const query = `
    INSERT INTO activity_logs (user_id, action, detail)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    userId || null,
    action,
    detail ? JSON.stringify(detail) : null,
  ]);
  return rows[0];
}

async function getLogs(limit = 50, actionFilter) {
  let query = `
    SELECT l.log_id, l.user_id, u.full_name, l.action, l.detail, l.created_at
    FROM activity_logs l
    LEFT JOIN users u ON u.user_id = l.user_id
  `;
  const params = [];
  if (actionFilter) {
    params.push(actionFilter);
    query += ` WHERE l.action = $1`;
  }
  query += ` ORDER BY l.created_at DESC LIMIT ${limit}`;
  const { rows } = await db.query(query, params);
  return rows;
}

module.exports = {
  createLog,
  getLogs,
};
