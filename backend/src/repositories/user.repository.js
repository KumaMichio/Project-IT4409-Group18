const { pool } = require('../config/db');
const crypto = require('crypto');

// map 1 row từ DB -> object dùng trong app
function mapRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
  };
}

async function getUsers() {
  const res = await pool.query(
    'SELECT id, email, password_hash, full_name, role FROM users ORDER BY id'
  );
  return res.rows.map(mapRow);
}

async function findUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, email, password_hash, full_name, role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );
  return mapRow(res.rows[0]);
}

/**
 * addUser: giữ đúng signature cũ
 * user: { id, name, email, passwordHash, role }
 */
async function addUser(user) {
  const id =
    user.id ||
    (crypto.randomUUID?.() ||
      String(Date.now()) + String(Math.floor(Math.random() * 1000)));

  const fullName = user.name || user.full_name || null;
  const passwordHash = user.passwordHash || user.password_hash || null;
  const role = user.role || 'student';

  await pool.query(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, user.email, passwordHash, fullName, role]
  );

  return {
    id,
    name: fullName,
    email: user.email,
    role,
  };
}

/**
 * createUser: alias cho addUser để service khác có thể dùng tên mới
 */
async function createUser({ name, email, passwordHash, role = 'student' }) {
  return addUser({ name, email, passwordHash, role });
}

module.exports = {
  getUsers,
  findUserByEmail,
  addUser,
  createUser,
};
