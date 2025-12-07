import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import pool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_this';

export async function GET(req: Request) {
  try {
    // Support token from Authorization header or HttpOnly cookie
    const auth = req.headers.get('authorization') || '';
    let token: string | null = null;
    const parts = String(auth).split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const c of cookies) {
        if (c.startsWith('token=')) {
          token = c.substring('token='.length);
          break;
        }
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    let payload: any;
    try { payload = jwt.verify(token, JWT_SECRET); } catch (e) { payload = null; }
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const res = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [payload.id]);
    const user = res.rows[0];
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ user: { id: user.id, name: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
