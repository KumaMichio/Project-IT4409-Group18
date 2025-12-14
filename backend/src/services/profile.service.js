const profileRepository = require('../repositories/profile.repository');

class ProfileServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Map role from DB to frontend
function mapRoleFromDb(role) {
  if (!role) return 'student';
  const normalized = role.toLowerCase();
  if (normalized === 'student') return 'student';
  if (normalized === 'instructor') return 'teacher';
  if (normalized === 'admin') return 'admin';
  return normalized;
}

// Format profile response
function formatProfile(data) {
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.full_name,
    role: mapRoleFromDb(data.role),
    avatar_url: data.avatar_url,
    phone: data.phone,
    date_of_birth: data.date_of_birth,
    bio: data.bio,
    website: data.website,
    created_at: data.created_at,
    updated_at: data.updated_at,
    profile: data.profile,
  };
}

/**
 * Get current user's profile
 */
async function getMyProfile(userId) {
  const profile = await profileRepository.getUserProfile(userId);
  if (!profile) {
    throw new ProfileServiceError(404, 'Profile not found');
  }
  return formatProfile(profile);
}

/**
 * Get public profile of any user
 */
async function getPublicProfile(userId) {
  const profile = await profileRepository.getPublicProfile(userId);
  if (!profile) {
    throw new ProfileServiceError(404, 'User not found');
  }
  return formatProfile(profile);
}

/**
 * Update user profile
 */
async function updateProfile(userId, userRole, updates) {
  try {
    // Update basic user info
    const basicFields = {
      full_name: updates.name || updates.full_name,
      phone: updates.phone,
      date_of_birth: updates.date_of_birth,
      bio: updates.bio,
      website: updates.website,
      avatar_url: updates.avatar_url,
    };

    // Filter out undefined values
    Object.keys(basicFields).forEach(key => {
      if (basicFields[key] === undefined) delete basicFields[key];
    });

    if (Object.keys(basicFields).length > 0) {
      await profileRepository.updateUserBasicInfo(userId, basicFields);
    }

    // Update role-specific profile
    if (userRole === 'INSTRUCTOR' && updates.profile) {
      await profileRepository.upsertInstructorProfile(userId, updates.profile);
    } else if (userRole === 'STUDENT' && updates.profile) {
      await profileRepository.upsertStudentProfile(userId, updates.profile);
    }

    // Get updated profile
    const updatedProfile = await profileRepository.getUserProfile(userId);
    return formatProfile(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new ProfileServiceError(500, 'Failed to update profile');
  }
}

module.exports = {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  ProfileServiceError,
};
