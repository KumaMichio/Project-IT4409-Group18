const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  findUserByEmail,
  addUser,          // hoặc createUser, cả hai đều có
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

  const normalizedRole = (role || 'student').toLowerCase();
  if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
    throw new AuthError(400, 'Invalid role');
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id =
    (global.crypto && global.crypto.randomUUID)
      ? global.crypto.randomUUID()
      : String(Date.now());

  const user = { id, name, email, passwordHash, role: normalizedRole };
  await addUser(user);

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
  };
}

module.exports = {
  signup,
  signin,
  getMeFromToken,
  AuthError,
};
