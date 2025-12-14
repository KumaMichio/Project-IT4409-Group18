const pool = require('../config/db');
const crypto = require('crypto');

// map 1 row từ DB -> object dùng trong app
// Map role từ database enum (STUDENT, INSTRUCTOR, ADMIN) về lowercase (student, teacher, admin)
function mapRow(r) {
  if (!r) return null;
  // Map database enum về frontend format
  let role = r.role?.toLowerCase();
  if (role === 'instructor') {
    role = 'teacher'; // Map INSTRUCTOR -> teacher cho frontend
  }
  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    passwordHash: r.password_hash,
    role: role || r.role, // Fallback về original nếu không map được
    avatar_url: r.avatar_url,
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
 * Note: id sẽ được database tự động generate (BIGSERIAL), không cần truyền vào
 */
async function addUser(user) {
  const fullName = user.name || user.full_name || null;
  const passwordHash = user.passwordHash || user.password_hash || null;
  // Role phải là enum value: 'STUDENT', 'INSTRUCTOR', hoặc 'ADMIN'
  const role = user.role || 'STUDENT';

  // Không truyền id, để database tự động generate BIGSERIAL
  // Sử dụng RETURNING để lấy id vừa được tạo
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [user.email, passwordHash, fullName, role]
  );

  const id = result.rows[0].id;

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

async function findUserById(id) {
  const res = await pool.query(
    'SELECT id, email, password_hash, full_name, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return mapRow(res.rows[0]);
}

async function getUsersByRole(role) {
  // Role phải là database enum: 'STUDENT', 'INSTRUCTOR', hoặc 'ADMIN'
  const res = await pool.query(
    'SELECT id, email, full_name, role, avatar_url, is_active, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC',
    [role]
  );
  return res.rows.map((r) => {
    const mapped = mapRow(r);
    return {
      ...mapped,
      is_active: r.is_active,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}

async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`full_name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.passwordHash !== undefined) {
    fields.push(`password_hash = $${paramIndex++}`);
    values.push(updates.passwordHash);
  }
  if (updates.role !== undefined) {
    fields.push(`role = $${paramIndex++}`);
    values.push(updates.role);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(updates.is_active);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  fields.push(`updated_at = now()`);
  values.push(id);

  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, full_name, role, is_active, created_at, updated_at
  `;

  const res = await pool.query(query, values);
  const row = res.rows[0];
  if (!row) return null;

  const mapped = mapRow(row);
  return {
    ...mapped,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function deleteUser(id) {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return res.rows[0] || null;
}

module.exports = {
  getUsers,
  findUserByEmail,
  findUserById,
  getUsersByRole,
  addUser,
  createUser,
  updateUser,
  deleteUser,
};