const pool = require('../config/db');

async function createLog(userId, action, detail, targetType = null, targetId = null) {
  const query = `
    INSERT INTO audit_logs (actor_id, action, target_type, target_id, meta)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    userId || null,
    action,
    targetType || 'system',
    targetId || null,
    detail ? JSON.stringify(detail) : null,
  ]);
  return rows[0];
}

async function getLogs(limit = 50, actionFilter) {
  let query = `
    SELECT l.id AS log_id, l.actor_id AS user_id, u.full_name, l.action, l.meta AS detail, l.created_at
    FROM audit_logs l
    LEFT JOIN users u ON u.id = l.actor_id
  `;
  const params = [];
  if (actionFilter) {
    params.push(actionFilter);
    query += ` WHERE l.action = $1`;
  }
  query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const { rows } = await pool.query(query, params);
  return rows;
}

module.exports = {
  createLog,
  getLogs,
};
