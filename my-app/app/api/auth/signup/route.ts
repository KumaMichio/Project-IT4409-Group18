import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_this";

function mapRoleToEnum(role?: string) {
  const r = (role || "student").toLowerCase();
  if (r === "teacher") return "INSTRUCTOR";
  if (r === "admin") return "ADMIN";
  return "STUDENT";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const mappedRole = mapRoleToEnum(role);

    // Prevent public creation of ADMIN
    if (mappedRole === "ADMIN") {
      return NextResponse.json({ error: "Cannot create admin via public signup" }, { status: 403 });
    }

    // check existing
    const existingRes = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingRes.rowCount > 0) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role`,
      [email, passwordHash, name, mappedRole]
    );

    const user = insertRes.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // set HttpOnly cookie
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

