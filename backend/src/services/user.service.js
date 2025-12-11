const bcrypt = require('bcryptjs');
const {
  getUsers,
  findUserById,
  findUserByEmail,
  getUsersByRole,
  addUser,
  updateUser,
  deleteUser,
} = require('../repositories/user.repository');

class UserServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Map frontend role to database enum
function mapRoleToDb(role) {
  if (!role) return 'STUDENT';
  const normalized = role.toLowerCase();
  if (normalized === 'student') return 'STUDENT';
  if (normalized === 'teacher' || normalized === 'instructor') return 'INSTRUCTOR';
  if (normalized === 'admin') return 'ADMIN';
  return role.toUpperCase();
}

// Map database enum to frontend role
function mapRoleFromDb(role) {
  if (!role) return 'student';
  const normalized = role.toLowerCase();
  if (normalized === 'student') return 'student';
  if (normalized === 'instructor') return 'teacher';
  if (normalized === 'admin') return 'admin';
  return normalized;
}

async function getAllUsers() {
  const users = await getUsers();
  return users.map((u) => ({
    ...u,
    role: mapRoleFromDb(u.role),
  }));
}

async function getUsersByRoleType(roleType) {
  const dbRole = mapRoleToDb(roleType);
  const users = await getUsersByRole(dbRole);
  return users.map((u) => ({
    ...u,
    role: mapRoleFromDb(u.role),
  }));
}

async function getUserById(id) {
  const user = await findUserById(id);
  if (!user) {
    throw new UserServiceError(404, 'User not found');
  }
  return {
    ...user,
    role: mapRoleFromDb(user.role),
  };
}

async function createUser({ name, email, password, role }) {
  if (!name || !email || !password) {
    throw new UserServiceError(400, 'Missing required fields: name, email, password');
  }

  // Chỉ cho phép tạo STUDENT và INSTRUCTOR, không cho phép tạo ADMIN
  const normalizedRole = (role || 'student').toLowerCase();
  if (!['student', 'teacher', 'instructor'].includes(normalizedRole)) {
    throw new UserServiceError(400, 'Invalid role. Only student and instructor roles are allowed.');
  }

  // Check email exists
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new UserServiceError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const dbRole = mapRoleToDb(role || 'student');

  const createdUser = await addUser({
    name,
    email,
    passwordHash,
    role: dbRole,
  });

  return {
    ...createdUser,
    role: mapRoleFromDb(createdUser.role),
  };
}

async function updateUserById(id, updates) {
  const user = await findUserById(id);
  if (!user) {
    throw new UserServiceError(404, 'User not found');
  }

  const updateData = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }

  if (updates.email !== undefined) {
    // Check email exists (except for current user)
    const existing = await findUserByEmail(updates.email);
    if (existing && existing.id !== id) {
      throw new UserServiceError(409, 'Email already in use');
    }
    updateData.email = updates.email;
  }

  if (updates.password !== undefined) {
    if (updates.password.length < 6) {
      throw new UserServiceError(400, 'Password must be at least 6 characters');
    }
    updateData.passwordHash = await bcrypt.hash(updates.password, 10);
  }

  if (updates.role !== undefined) {
    // Chỉ cho phép thay đổi giữa STUDENT và INSTRUCTOR, không cho phép tạo ADMIN
    const normalizedRole = updates.role.toLowerCase();
    if (!['student', 'teacher', 'instructor'].includes(normalizedRole)) {
      throw new UserServiceError(400, 'Invalid role. Only student and instructor roles are allowed.');
    }
    updateData.role = mapRoleToDb(updates.role);
  }

  if (updates.is_active !== undefined) {
    updateData.is_active = updates.is_active;
  }

  const updatedUser = await updateUser(id, updateData);
  return {
    ...updatedUser,
    role: mapRoleFromDb(updatedUser.role),
  };
}

async function deleteUserById(id) {
  const user = await findUserById(id);
  if (!user) {
    throw new UserServiceError(404, 'User not found');
  }

  // Không cho phép xóa ADMIN
  if (user.role === 'ADMIN' || user.role?.toLowerCase() === 'admin') {
    throw new UserServiceError(403, 'Cannot delete admin user');
  }

  await deleteUser(id);
  return { success: true };
}

module.exports = {
  getAllUsers,
  getUsersByRoleType,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  UserServiceError,
};


