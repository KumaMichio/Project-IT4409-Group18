const { pool } = require('../config/db');

// ===== COURSE CHANNEL MESSAGES (UC13) =====

/**
 * Get or create course channel for a course
 */
async function getOrCreateCourseChannel(courseId) {
  // Try to get existing channel
  let res = await pool.query(
    'SELECT id, course_id, name, description, created_at FROM course_channels WHERE course_id = $1',
    [courseId]
  );

  if (res.rows.length > 0) {
    return res.rows[0];
  }

  // Create new channel if doesn't exist
  res = await pool.query(
    `INSERT INTO course_channels (course_id, name, description)
     VALUES ($1, 'General', 'Course discussion channel')
     RETURNING id, course_id, name, description, created_at`,
    [courseId]
  );

  return res.rows[0];
}

/**
 * Get channel messages with pagination
 */
async function getChannelMessages(channelId, limit = 50, beforeId = null) {
  let query = `
    SELECT 
      m.id,
      m.channel_id,
      m.user_id,
      m.content,
      m.edited_at,
      m.deleted_at,
      m.created_at,
      u.full_name as user_name,
      u.avatar_url,
      u.role
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.channel_id = $1 AND m.deleted_at IS NULL
  `;

  const params = [channelId];
  
  if (beforeId) {
    query += ` AND m.id < $2`;
    params.push(beforeId);
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await pool.query(query, params);
  return res.rows.reverse(); // Reverse to show oldest first
}

/**
 * Create a new message in channel
 */
async function createChannelMessage(channelId, userId, content) {
  const res = await pool.query(
    `INSERT INTO messages (channel_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, channel_id, user_id, content, edited_at, deleted_at, created_at`,
    [channelId, userId, content]
  );

  const message = res.rows[0];

  // Get user info for the message
  const userRes = await pool.query(
    'SELECT id, full_name, avatar_url, role FROM users WHERE id = $1',
    [userId]
  );

  return {
    ...message,
    user_name: userRes.rows[0]?.full_name,
    avatar_url: userRes.rows[0]?.avatar_url,
    role: userRes.rows[0]?.role,
  };
}

/**
 * Update a message
 */
async function updateMessage(messageId, userId, content) {
  const res = await pool.query(
    `UPDATE messages 
     SET content = $1, edited_at = now()
     WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
     RETURNING id, channel_id, user_id, content, edited_at, deleted_at, created_at`,
    [content, messageId, userId]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const message = res.rows[0];

  // Get user info
  const userRes = await pool.query(
    'SELECT id, full_name, avatar_url, role FROM users WHERE id = $1',
    [userId]
  );

  return {
    ...message,
    user_name: userRes.rows[0]?.full_name,
    avatar_url: userRes.rows[0]?.avatar_url,
    role: userRes.rows[0]?.role,
  };
}

/**
 * Delete a message (soft delete)
 */
async function deleteMessage(messageId, userId) {
  const res = await pool.query(
    `UPDATE messages 
     SET deleted_at = now()
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [messageId, userId]
  );

  return res.rows.length > 0;
}

// ===== DIRECT MESSAGES (UC14) =====

/**
 * Get or create DM thread between student and instructor
 */
async function getOrCreateDMThread(studentId, instructorId) {
  // Try to get existing thread
  let res = await pool.query(
    `SELECT id, student_id, instructor_id, created_at 
     FROM dm_threads 
     WHERE (student_id = $1 AND instructor_id = $2) 
        OR (student_id = $2 AND instructor_id = $1)`,
    [studentId, instructorId]
  );

  if (res.rows.length > 0) {
    return res.rows[0];
  }

  // Create new thread
  res = await pool.query(
    `INSERT INTO dm_threads (student_id, instructor_id)
     VALUES ($1, $2)
     RETURNING id, student_id, instructor_id, created_at`,
    [studentId, instructorId]
  );

  return res.rows[0];
}

/**
 * Get DM messages with pagination
 */
async function getDMMessages(threadId, limit = 50, beforeId = null) {
  let query = `
    SELECT 
      dm.id,
      dm.thread_id,
      dm.sender_id,
      dm.content,
      dm.is_read,
      dm.read_at,
      dm.edited_at,
      dm.deleted_at,
      dm.created_at,
      u.full_name as sender_name,
      u.avatar_url as sender_avatar,
      u.role as sender_role
    FROM dm_messages dm
    JOIN users u ON dm.sender_id = u.id
    WHERE dm.thread_id = $1 AND dm.deleted_at IS NULL
  `;

  const params = [threadId];
  
  if (beforeId) {
    query += ` AND dm.id < $2`;
    params.push(beforeId);
  }

  query += ` ORDER BY dm.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await pool.query(query, params);
  return res.rows.reverse(); // Reverse to show oldest first
}

/**
 * Create a new DM message
 */
async function createDMMessage(threadId, senderId, content) {
  const res = await pool.query(
    `INSERT INTO dm_messages (thread_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, thread_id, sender_id, content, is_read, read_at, edited_at, deleted_at, created_at`,
    [threadId, senderId, content]
  );

  const message = res.rows[0];

  // Get sender info
  const userRes = await pool.query(
    'SELECT id, full_name, avatar_url, role FROM users WHERE id = $1',
    [senderId]
  );

  return {
    ...message,
    sender_name: userRes.rows[0]?.full_name,
    sender_avatar: userRes.rows[0]?.avatar_url,
    sender_role: userRes.rows[0]?.role,
  };
}

/**
 * Mark DM messages as read
 */
async function markDMMessagesAsRead(threadId, userId) {
  const res = await pool.query(
    `UPDATE dm_messages 
     SET is_read = TRUE, read_at = now()
     WHERE thread_id = $1 AND sender_id != $2 AND is_read = FALSE
     RETURNING id`,
    [threadId, userId]
  );

  return res.rowCount;
}

/**
 * Get unread message count for a user in DM threads
 */
async function getUnreadDMCount(userId) {
  const res = await pool.query(
    `SELECT COUNT(*) as count
     FROM dm_messages dm
     JOIN dm_threads dt ON dm.thread_id = dt.id
     WHERE (dt.student_id = $1 OR dt.instructor_id = $1)
       AND dm.sender_id != $1
       AND dm.is_read = FALSE
       AND dm.deleted_at IS NULL`,
    [userId]
  );

  return parseInt(res.rows[0]?.count || 0);
}

/**
 * Get all DM threads for a user (student or instructor)
 */
async function getUserDMThreads(userId) {
  const res = await pool.query(
    `SELECT 
      dt.id as thread_id,
      dt.student_id,
      dt.instructor_id,
      dt.created_at,
      s.full_name as student_name,
      s.avatar_url as student_avatar,
      i.full_name as instructor_name,
      i.avatar_url as instructor_avatar,
      (SELECT COUNT(*) FROM dm_messages 
       WHERE thread_id = dt.id 
       AND sender_id != $1 
       AND is_read = FALSE 
       AND deleted_at IS NULL) as unread_count,
      (SELECT content FROM dm_messages 
       WHERE thread_id = dt.id 
       AND deleted_at IS NULL 
       ORDER BY created_at DESC LIMIT 1) as last_message_content,
      (SELECT created_at FROM dm_messages 
       WHERE thread_id = dt.id 
       AND deleted_at IS NULL 
       ORDER BY created_at DESC LIMIT 1) as last_message_at
    FROM dm_threads dt
    LEFT JOIN users s ON dt.student_id = s.id
    LEFT JOIN users i ON dt.instructor_id = i.id
    WHERE dt.student_id = $1 OR dt.instructor_id = $1
    ORDER BY last_message_at DESC NULLS LAST`,
    [userId]
  );

  return res.rows;
}

/**
 * Check if user is enrolled in course (for channel access)
 */
async function isUserEnrolledInCourse(userId, courseId) {
  const res = await pool.query(
    `SELECT 1 FROM enrollments 
     WHERE student_id = $1 AND course_id = $2 AND status = 'ACTIVE'
     LIMIT 1`,
    [userId, courseId]
  );

  return res.rows.length > 0;
}

/**
 * Check if user is course instructor
 */
async function isCourseInstructor(userId, courseId) {
  const res = await pool.query(
    `SELECT 1 FROM courses 
     WHERE id = $1 AND instructor_id = $2
     LIMIT 1`,
    [courseId, userId]
  );

  return res.rows.length > 0;
}

module.exports = {
  // Course channel
  getOrCreateCourseChannel,
  getChannelMessages,
  createChannelMessage,
  updateMessage,
  deleteMessage,
  // DM
  getOrCreateDMThread,
  getDMMessages,
  createDMMessage,
  markDMMessagesAsRead,
  getUnreadDMCount,
  getUserDMThreads,
  // Access control
  isUserEnrolledInCourse,
  isCourseInstructor,
};

