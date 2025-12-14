const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const profileController = require('../controllers/profile.controller');

// All routes require authentication
router.use(authMiddleware);

// Get current user's profile
router.get('/me', profileController.getMyProfile);

// Update current user's profile
router.put('/me', profileController.updateMyProfile);

// Upload avatar
router.post('/avatar', uploadAvatar, profileController.uploadAvatar);

// Get public profile of any user
router.get('/:userId', profileController.getPublicProfile);

module.exports = router;

