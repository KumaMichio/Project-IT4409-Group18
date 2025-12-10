const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Please set DATABASE_URL environment variable before running this script');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PW || 'Admin123!';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const role = 'admin';

  const pwHash = await bcrypt.hash(password, 10);

  // Tạo bảng nếu chưa có
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL
    );
  `);

  const res = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );

  if (res.rows.length > 0) {
    console.log('Admin user already exists:', email);
    await pool.end();
    return;
  }

  const id =
    String(Date.now()) + String(Math.floor(Math.random() * 1000));

  await pool.query(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, email, pwHash, name, role]
  );

  console.log('Created admin:', email);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
