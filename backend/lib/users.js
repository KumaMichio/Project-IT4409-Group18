const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn('[DB] DATABASE_URL is not set — Postgres connections will fail until you configure it');
}

const pool = new Pool({ connectionString });

// Columns used by the app: id, email, password_hash, full_name, role

async function getUsers() {
    const res = await pool.query('SELECT id, email, password_hash, full_name, role FROM users ORDER BY id');
    return res.rows.map(r => ({
        id: r.id,
        name: r.full_name,
        email: r.email,
        passwordHash: r.password_hash,
        role: r.role,
    }));
}

async function findUserByEmail(email) {
    const res = await pool.query(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email]
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
        id: r.id,
        name: r.full_name,
        email: r.email,
        passwordHash: r.password_hash,
        role: r.role,
    };
}

async function addUser(user) {
    // user: { id, name, email, passwordHash, role }
    const id = user.id || null;
    const fullName = user.name || null;
    const passwordHash = user.passwordHash || user.password_hash || null;
    const role = user.role || 'student';

    await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, user.email, passwordHash, fullName, role]
    );
}

module.exports = {
    getUsers,
    findUserByEmail,
    addUser,
};
