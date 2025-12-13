const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const userController = require('../controllers/user.controller');

// Tất cả routes yêu cầu admin
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Get all users
router.get('/', userController.getAllUsers);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

// Get user by id
router.get('/:id', userController.getUserById);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;


