const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Check DATABASE_URL before importing db
if (!process.env.DATABASE_URL) {
  console.error(
    '\n❌ DATABASE_URL is not set!\n' +
    'Please create a .env file in the backend directory.\n' +
    'See backend/.env.example for reference.\n' +
    '\nExample:\n' +
    'DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course\n'
  );
  process.exit(1);
}

const { pool } = require('../config/db');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PW || 'Admin123!';
  const name = process.env.SEED_ADMIN_NAME || 'System Admin';
  const role = 'ADMIN'; // Database enum value

  console.log('🔧 Starting admin seed script...');
  console.log('📧 Email:', email);
  console.log('👤 Name:', name);

  const pwHash = await bcrypt.hash(password, 10);

  // Kiểm tra xem admin đã tồn tại chưa
  const res = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND role = $2 LIMIT 1',
    [email, role]
  );

  if (res.rows.length > 0) {
    console.log('Admin user already exists:', email);
    console.log('Admin ID:', res.rows[0].id);
    return;
  }

  // Tạo admin user mới (id sẽ được database tự động generate - BIGSERIAL)
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role`,
    [email, pwHash, name, role]
  );

  const admin = result.rows[0];
  console.log('✅ Created admin user successfully!');
  console.log('Email:', admin.email);
  console.log('Name:', admin.full_name);
  console.log('Role:', admin.role);
  console.log('ID:', admin.id);
  console.log('\n📝 Login credentials:');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    if (e.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection refused. Please check:');
      console.error('1. Is PostgreSQL running?');
      console.error('2. Is DATABASE_URL correct in .env file?');
      console.error('3. Try: docker-compose up -d (if using docker)');
    } else if (e.code === '42P01') {
      console.error('\n💡 Database or table does not exist.');
      console.error('Please run database.sql first to create the database schema.');
    } else if (e.message.includes('DATABASE_URL')) {
      console.error('\n💡 Please set DATABASE_URL in .env file');
    }
    process.exit(1);
  });
