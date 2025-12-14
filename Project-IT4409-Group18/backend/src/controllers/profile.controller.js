const profileService = require('../services/profile.service');
const path = require('path');

/**
 * GET /api/profile/me
 * Get current user's profile
 */
async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await profileService.getMyProfile(userId);
    res.json({ profile });
  } catch (err) {
    if (err instanceof profileService.ProfileServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/profile/:userId
 * Get public profile of any user
 */
async function getPublicProfile(req, res, next) {
  try {
    const { userId } = req.params;
    const profile = await profileService.getPublicProfile(userId);
    res.json({ profile });
  } catch (err) {
    if (err instanceof profileService.ProfileServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * PUT /api/profile/me
 * Update current user's profile
 */
async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;

    const profile = await profileService.updateProfile(userId, userRole, updates);
    res.json({ profile });
  } catch (err) {
    if (err instanceof profileService.ProfileServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/profile/avatar
 * Upload avatar
 */
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file ảnh được upload' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const profile = await profileService.updateProfile(userId, userRole, {
      avatar_url: avatarUrl
    });

    res.json({ 
      profile,
      avatar_url: avatarUrl 
    });
  } catch (err) {
    if (err instanceof profileService.ProfileServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  uploadAvatar,
};

