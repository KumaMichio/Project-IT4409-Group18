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

async function testLogin() {
  const email = 'student1@test.com';
  const password = 'password123';

  console.log(`Testing login for ${email} with password: ${password}`);

  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      console.log('❌ User not found in database!');
      return;
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    console.log('Stored hash:', user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (isMatch) {
      console.log('✅ Password match! Login logic is correct.');
    } else {
      console.log('❌ Password does NOT match.');
      
      // Generate new hash
      const newHash = await bcrypt.hash(password, 10);
      console.log('Generated new hash for "password123":', newHash);
      
      // Update db
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, email]);
      console.log('✅ Updated user password in database to new hash.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testLogin();
