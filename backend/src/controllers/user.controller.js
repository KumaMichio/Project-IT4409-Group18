const userService = require('../services/user.service');

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUsersByRole(req, res, next) {
  try {
    const { role } = req.params;
    const users = await userService.getUsersByRoleType(role);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.createUser({ name, email, password, role });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof userService.UserServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await userService.updateUserById(id, updates);
    res.json(user);
  } catch (err) {
    if (err instanceof userService.UserServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await userService.deleteUserById(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    if (err instanceof userService.UserServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUsersByRole,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

