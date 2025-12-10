const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn(
    '[DB] DATABASE_URL is not set — Postgres connections will fail until you configure it'
  );
}

const pool = new Pool({ connectionString });

module.exports = { pool };
