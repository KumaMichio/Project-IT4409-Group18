const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('Please set DATABASE_URL environment variable before running this script');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });

    // Ensure table exists
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL
    );
  `);

    const dataPath = path.join(__dirname, '..', 'data', 'users.json');
    let raw;
    try {
        raw = await fs.readFile(dataPath, 'utf8');
    } catch (e) {
        console.error('No users.json found to migrate:', dataPath);
        await pool.end();
        return;
    }

    let users;
    try {
        users = JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse users.json:', e.message);
        await pool.end();
        return;
    }

    for (const u of users) {
        const id = u.id || String(Date.now()) + Math.floor(Math.random() * 1000);
        const email = u.email;
        const passwordHash = u.passwordHash || u.password_hash || '';
        const fullName = u.name || u.full_name || null;
        const role = u.role || 'student';
        try {
            await pool.query(
                `INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
                [id, email, passwordHash, fullName, role]
            );
            console.log('Inserted', email);
        } catch (err) {
            console.error('Error inserting', email, err.message);
        }
    }

    await pool.end();
    console.log('Migration complete');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
