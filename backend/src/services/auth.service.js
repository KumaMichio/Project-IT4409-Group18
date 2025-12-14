const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  findUserByEmail,
  addUser,
  getUsers,
} = require('../repositories/user.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_this';

class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Đăng ký
async function signup({ name, email, password, role }) {
  if (!name || !email || !password) {
    throw new AuthError(400, 'Missing fields');
  }

  // Map role từ frontend sang database enum
  // Frontend: 'student' hoặc 'teacher'
  // Database: 'STUDENT' hoặc 'INSTRUCTOR'
  // Không cho phép đăng ký admin
  const normalizedRole = (role || 'student').toLowerCase();
  
  // Chỉ cho phép student và teacher (teacher -> INSTRUCTOR)
  if (!['student', 'teacher'].includes(normalizedRole)) {
    throw new AuthError(400, 'Invalid role. Only student and teacher roles are allowed for registration.');
  }

  // Map role sang database enum format
  const dbRole = normalizedRole === 'student' ? 'STUDENT' : 'INSTRUCTOR';

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Không tạo id nữa, để database tự động generate BIGSERIAL
  const user = { name, email, passwordHash, role: dbRole };
  const createdUser = await addUser(user);

  // Map role từ database enum về frontend format cho token và response
  const frontendRole = dbRole === 'STUDENT' ? 'student' : 'teacher';
  
  const token = signToken({
    id: createdUser.id,
    email: createdUser.email,
    role: frontendRole, // Token dùng frontend format
    name: createdUser.name,
  });

  return {
    token,
    user: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: frontendRole, // Response dùng frontend format
    },
  };
}

// Đăng nhập
async function signin({ email, password }) {
  if (!email || !password) {
    throw new AuthError(400, 'Missing fields');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(401, 'Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AuthError(401, 'Invalid credentials');
  }

  // mapRow đã map role từ database enum về frontend format
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role, // Đã được map trong mapRow
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Đã được map trong mapRow
    },
  };
}

// Lấy thông tin từ token
async function getMeFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new AuthError(401, 'Invalid token');
  }

  const users = await getUsers();
  const user = users.find((u) => u.id === payload.id);
  if (!user) {
    throw new AuthError(404, 'Not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
  };
}

module.exports = {
  signup,
  signin,
  getMeFromToken,
  AuthError,
};