const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    '\n❌ [DB] DATABASE_URL is not set!\n' +
    'Please create a .env file in the backend directory with:\n' +
    'DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course\n' +
    '\nOr set it as an environment variable.\n'
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
});

// Test connection on startup (non-blocking, only in non-test env)
if (process.env.NODE_ENV !== 'test') {
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      console.error('\nPlease check:');
      console.error('1. Is PostgreSQL running?');
      console.error('2. Is DATABASE_URL correct?');
      console.error('3. Does the database exist?');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
}

module.exports = { pool };
