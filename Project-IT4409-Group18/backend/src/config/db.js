const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE || process.env.DB_NAME, // Support both DB_DATABASE and DB_NAME
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('📅 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 Tip: Check DB_HOST in .env file. Use "localhost" for local development.');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Tip: Make sure PostgreSQL is running and DB_PORT is correct.');
    }
    if (error.code === '28P01') {
      console.error('   💡 Tip: Check DB_USER and DB_PASSWORD in .env file.');
    }
    if (error.code === '3D000') {
      console.error('   💡 Tip: Database does not exist. Check DB_DATABASE in .env file.');
    }
    return false;
  }
}

// Export pool as default for backward compatibility
// Also export as named export for new code
module.exports = pool;
module.exports.pool = pool;
module.exports.testConnection = testConnection;
