const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function resetPassword() {
  const email = 'teacher1@test.com';
  const newPassword = 'password123';
  
  console.log(`Resetting password for ${email}...`);

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [hash, email]
    );

    if (res.rowCount > 0) {
      console.log(`✅ Password reset successfully for ${email}`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log(`❌ User ${email} not found`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

resetPassword();
