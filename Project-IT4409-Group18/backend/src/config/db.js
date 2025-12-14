const { Pool } = require('pg');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_PASSWORD'];
const dbName = process.env.DB_DATABASE || process.env.DB_NAME;
const dbPort = process.env.DB_PORT || 5432;

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required database environment variables:', missingVars.join(', '));
  console.error('   Please check your .env file in the backend directory.');
}

if (!dbName) {
  console.error('❌ Missing DB_DATABASE or DB_NAME environment variable');
  console.error('   Please set DB_DATABASE in your .env file.');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName,
  password: process.env.DB_PASSWORD,
  port: dbPort,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err);
  console.error('   Error code:', err.code);
  console.error('   Error message:', err.message);
});

// Handle connection errors
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

pool.on('remove', (client) => {
  console.log('⚠️  Database client removed from pool');
});

// Test database connection
async function testConnection() {
  try {
    // Check if required env vars are set
    if (missingVars.length > 0 || !dbName) {
      console.error('❌ Cannot test connection: Missing required environment variables');
      return false;
    }

    console.log('🔄 Attempting to connect to database...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${dbPort}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${process.env.DB_USER}`);
    
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
    
    // Provide specific troubleshooting tips
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 Tip: Check DB_HOST in .env file. Use "localhost" for local development.');
      console.error('   💡 Tip: Make sure PostgreSQL is running.');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Tip: Make sure PostgreSQL is running.');
      console.error('   💡 Tip: Check DB_PORT in .env file (default is 5432).');
      console.error('   💡 Tip: Try: docker ps (if using Docker) or pg_isready (if installed locally)');
    }
    if (error.code === '28P01') {
      console.error('   💡 Tip: Check DB_USER and DB_PASSWORD in .env file.');
      console.error('   💡 Tip: Verify credentials match your PostgreSQL setup.');
    }
    if (error.code === '3D000') {
      console.error('   💡 Tip: Database does not exist. Check DB_DATABASE in .env file.');
      console.error('   💡 Tip: Create the database: CREATE DATABASE ' + dbName + ';');
    }
    if (error.code === 'ETIMEDOUT') {
      console.error('   💡 Tip: Connection timeout. Check if PostgreSQL is accessible.');
      console.error('   💡 Tip: Verify firewall settings and network connectivity.');
    }
    
    return false;
  }
}

// Export pool as default for backward compatibility
// Also export as named export for new code
module.exports = pool;
module.exports.pool = pool;
module.exports.testConnection = testConnection;
