const pool = require('../config/db');

/**
 * Get user profile with role-specific data
 */
async function getUserProfile(userId) {
  const client = await pool.connect();
  try {
    // Get basic user info
    const userResult = await client.query(
      `SELECT id, email, full_name, role, avatar_url, phone, date_of_birth, bio, website, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get role-specific profile
    let profileData = null;
    if (user.role === 'INSTRUCTOR') {
      const profileResult = await client.query(
        `SELECT bio, headline, payout_info, linkedin, twitter, facebook, 
                experience_years, specialization, updated_at
         FROM instructor_profiles WHERE user_id = $1`,
        [userId]
      );
      profileData = profileResult.rows[0] || null;
    } else if (user.role === 'STUDENT') {
      const profileResult = await client.query(
        `SELECT about, linkedin, twitter, facebook, interests, education, updated_at
         FROM student_profiles WHERE user_id = $1`,
        [userId]
      );
      profileData = profileResult.rows[0] || null;
    }

    return {
      ...user,
      profile: profileData,
    };
  } finally {
    client.release();
  }
}

/**
 * Update user basic info
 */
async function updateUserBasicInfo(userId, data) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.full_name !== undefined) {
    fields.push(`full_name = $${paramCount++}`);
    values.push(data.full_name);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(data.phone);
  }
  if (data.date_of_birth !== undefined) {
    fields.push(`date_of_birth = $${paramCount++}`);
    values.push(data.date_of_birth);
  }
  if (data.bio !== undefined) {
    fields.push(`bio = $${paramCount++}`);
    values.push(data.bio);
  }
  if (data.website !== undefined) {
    fields.push(`website = $${paramCount++}`);
    values.push(data.website);
  }
  if (data.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramCount++}`);
    values.push(data.avatar_url);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(userId);
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = now()
    WHERE id = $${paramCount}
    RETURNING id, email, full_name, role, avatar_url, phone, date_of_birth, bio, website, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Update or create instructor profile
 */
async function upsertInstructorProfile(userId, data) {
  const fields = {
    bio: data.bio,
    headline: data.headline,
    payout_info: data.payout_info,
    linkedin: data.linkedin,
    twitter: data.twitter,
    facebook: data.facebook,
    experience_years: data.experience_years,
    specialization: data.specialization,
  };

  // Remove undefined fields
  Object.keys(fields).forEach(key => {
    if (fields[key] === undefined) delete fields[key];
  });

  if (Object.keys(fields).length === 0) {
    return null;
  }

  const columns = Object.keys(fields);
  const values = Object.values(fields);
  const placeholders = values.map((_, i) => `$${i + 2}`);
  const updates = columns.map((col, i) => `${col} = $${i + 2}`);

  const query = `
    INSERT INTO instructor_profiles (user_id, ${columns.join(', ')})
    VALUES ($1, ${placeholders.join(', ')})
    ON CONFLICT (user_id) 
    DO UPDATE SET ${updates.join(', ')}, updated_at = now()
    RETURNING *
  `;

  const result = await pool.query(query, [userId, ...values]);
  return result.rows[0];
}

/**
 * Update or create student profile
 */
async function upsertStudentProfile(userId, data) {
  const fields = {
    about: data.about,
    linkedin: data.linkedin,
    twitter: data.twitter,
    facebook: data.facebook,
    interests: data.interests,
    education: data.education,
  };

  // Remove undefined fields
  Object.keys(fields).forEach(key => {
    if (fields[key] === undefined) delete fields[key];
  });

  if (Object.keys(fields).length === 0) {
    return null;
  }

  const columns = Object.keys(fields);
  const values = Object.values(fields);
  const placeholders = values.map((_, i) => `$${i + 2}`);
  const updates = columns.map((col, i) => `${col} = $${i + 2}`);

  const query = `
    INSERT INTO student_profiles (user_id, ${columns.join(', ')})
    VALUES ($1, ${placeholders.join(', ')})
    ON CONFLICT (user_id) 
    DO UPDATE SET ${updates.join(', ')}, updated_at = now()
    RETURNING *
  `;

  const result = await pool.query(query, [userId, ...values]);
  return result.rows[0];
}

/**
 * Get public profile (limited info for other users)
 */
async function getPublicProfile(userId) {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `SELECT id, full_name, role, avatar_url, bio, website, created_at
       FROM users WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get role-specific public profile
    let profileData = null;
    if (user.role === 'INSTRUCTOR') {
      const profileResult = await client.query(
        `SELECT bio, headline, linkedin, twitter, facebook, 
                experience_years, specialization
         FROM instructor_profiles WHERE user_id = $1`,
        [userId]
      );
      profileData = profileResult.rows[0] || null;
    } else if (user.role === 'STUDENT') {
      const profileResult = await client.query(
        `SELECT about, linkedin, twitter, facebook, interests, education
         FROM student_profiles WHERE user_id = $1`,
        [userId]
      );
      profileData = profileResult.rows[0] || null;
    }

    return {
      ...user,
      profile: profileData,
    };
  } finally {
    client.release();
  }
}

module.exports = {
  getUserProfile,
  updateUserBasicInfo,
  upsertInstructorProfile,
  upsertStudentProfile,
  getPublicProfile,
};
