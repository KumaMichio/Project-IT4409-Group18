// lib/db.ts
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Trong môi trường dev thì log cảnh báo để bạn biết
  console.warn(
    "[DB] DATABASE_URL is not set — Postgres connections sẽ fail cho đến khi bạn cấu hình nó trong .env.local"
  );
}

const pool = new Pool({
  connectionString,
  // Nếu sau này deploy lên cloud (Railway, Render, Supabase...) có thể cần:
  // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export default pool;
