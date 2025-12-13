const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runSqlFile(pool, filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running ${path.basename(filePath)}...`);
    await pool.query(sql);
    console.log(`✅ Successfully executed ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error executing ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function main() {
  // 1. Connect to 'postgres' db to create target db if not exists
  const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to default db first
  };

  const targetDbName = process.env.DB_DATABASE;

  console.log('Connecting to postgres...');
  let pool = new Pool(dbConfig);

  try {
    // Check if database exists
    const res = await pool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
    
    if (res.rows.length === 0) {
      console.log(`Database ${targetDbName} does not exist. Creating...`);
      // Cannot run CREATE DATABASE inside a transaction block, so we use simple query
      await pool.end(); // Close pool to postgres
      
      // Create new pool just for creation (auto-commit)
      const createDbPool = new Pool(dbConfig);
      await createDbPool.query(`CREATE DATABASE "${targetDbName}"`);
      await createDbPool.end();
      console.log(`✅ Database ${targetDbName} created.`);
    } else {
      console.log(`Database ${targetDbName} already exists.`);
      await pool.end();
    }

    // 2. Connect to target DB
    console.log(`Connecting to ${targetDbName}...`);
    pool = new Pool({
      ...dbConfig,
      database: targetDbName,
    });

    // 3. Run SQL files
    const rootDir = path.join(__dirname, '../../../');
    const databaseSqlPath = path.join(rootDir, 'database.sql');
    const seedSqlPath = path.join(rootDir, 'seed.sql');

    if (fs.existsSync(databaseSqlPath)) {
      await runSqlFile(pool, databaseSqlPath);
    } else {
      console.error('❌ database.sql not found at', databaseSqlPath);
    }

    if (fs.existsSync(seedSqlPath)) {
      await runSqlFile(pool, seedSqlPath);
    } else {
      console.error('❌ seed.sql not found at', seedSqlPath);
    }

    console.log('\n✨ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
  } finally {
    await pool.end();
  }
}

main();
