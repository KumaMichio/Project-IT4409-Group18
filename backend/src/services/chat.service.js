const chatRepository = require('../repositories/chat.repository');
const AppError = require('../utils/AppError');

// ===== COURSE CHANNEL MESSAGES (UC13) =====

/**
 * Get course channel and verify access
 */
async function getCourseChannel(courseId, userId) {
  // Check if user is enrolled or is instructor
  const isEnrolled = await chatRepository.isUserEnrolledInCourse(userId, courseId);
  const isInstructor = await chatRepository.isCourseInstructor(userId, courseId);

  if (!isEnrolled && !isInstructor) {
    throw new AppError(403, 'Bạn cần đăng ký khóa học để tham gia chat', 'FORBIDDEN');
  }

  const channel = await chatRepository.getOrCreateCourseChannel(courseId);
  return channel;
}

/**
 * Get channel messages
 */
async function getChannelMessages(courseId, userId, limit = 50, beforeId = null) {
  // Verify access
  await getCourseChannel(courseId, userId);

  const channel = await chatRepository.getOrCreateCourseChannel(courseId);
  const messages = await chatRepository.getChannelMessages(channel.id, limit, beforeId);

  return {
    channel,
    messages,
  };
}

/**
 * Send message to course channel
 */
async function sendChannelMessage(courseId, userId, content) {
  if (!content || content.trim().length === 0) {
    throw new AppError(400, 'Nội dung tin nhắn không được để trống', 'INVALID_INPUT');
  }

  // Verify access
  await getCourseChannel(courseId, userId);

  const channel = await chatRepository.getOrCreateCourseChannel(courseId);
  const message = await chatRepository.createChannelMessage(channel.id, userId, content);

  return message;
}

/**
 * Edit channel message
 */
async function editChannelMessage(messageId, userId, content) {
  if (!content || content.trim().length === 0) {
    throw new AppError(400, 'Nội dung tin nhắn không được để trống', 'INVALID_INPUT');
  }

  const message = await chatRepository.updateMessage(messageId, userId, content);

  if (!message) {
    throw new AppError(404, 'Không tìm thấy tin nhắn hoặc bạn không có quyền chỉnh sửa', 'NOT_FOUND');
  }

  return message;
}

/**
 * Delete channel message
 */
async function deleteChannelMessage(messageId, userId) {
  const deleted = await chatRepository.deleteMessage(messageId, userId);

  if (!deleted) {
    throw new AppError(404, 'Không tìm thấy tin nhắn hoặc bạn không có quyền xóa', 'NOT_FOUND');
  }

  return { success: true };
}

// ===== DIRECT MESSAGES (UC14) =====

/**
 * Get or create DM thread between student and instructor
 */
async function getDMThread(studentId, instructorId, currentUserId) {
  // Convert all IDs to integers for comparison
  const studentIdInt = parseInt(studentId);
  const instructorIdInt = parseInt(instructorId);
  const currentUserIdInt = parseInt(currentUserId);

  // Verify current user is either student or instructor
  if (currentUserIdInt !== studentIdInt && currentUserIdInt !== instructorIdInt) {
    throw new AppError(403, 'Bạn không có quyền truy cập cuộc trò chuyện này', 'FORBIDDEN');
  }

  // Verify roles
  const studentRes = await require('../repositories/user.repository').findUserById(studentId);
  const instructorRes = await require('../repositories/user.repository').findUserById(instructorId);

  if (!studentRes || !instructorRes) {
    throw new AppError(404, 'Không tìm thấy người dùng', 'NOT_FOUND');
  }

  // Normalize role để so sánh (chấp nhận cả frontend format 'teacher' và database format 'INSTRUCTOR')
  const normalizeRole = (role) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r === 'teacher') return 'instructor'; // Map teacher -> instructor
    return r;
  };

  const studentRole = normalizeRole(studentRes.role);
  const instructorRole = normalizeRole(instructorRes.role);

  if (studentRole !== 'student') {
    throw new AppError(400, 'Người dùng đầu tiên phải là học viên', 'INVALID_INPUT');
  }

  if (instructorRole !== 'instructor') {
    throw new AppError(400, 'Người dùng thứ hai phải là giảng viên', 'INVALID_INPUT');
  }

  const thread = await chatRepository.getOrCreateDMThread(studentId, instructorId);
  return thread;
}

/**
 * Get DM messages
 */
async function getDMMessages(studentId, instructorId, currentUserId, limit = 50, beforeId = null) {
  const thread = await getDMThread(studentId, instructorId, currentUserId);
  const messages = await chatRepository.getDMMessages(thread.id, limit, beforeId);

  // Mark messages as read
  await chatRepository.markDMMessagesAsRead(thread.id, currentUserId);

  return {
    thread,
    messages,
  };
}

/**
 * Send DM message
 */
async function sendDMMessage(studentId, instructorId, senderId, content) {
  if (!content || content.trim().length === 0) {
    throw new AppError(400, 'Nội dung tin nhắn không được để trống', 'INVALID_INPUT');
  }

  // Convert all IDs to integers for comparison
  const studentIdInt = parseInt(studentId);
  const instructorIdInt = parseInt(instructorId);
  const senderIdInt = parseInt(senderId);

  // Verify sender is part of the thread
  if (senderIdInt !== studentIdInt && senderIdInt !== instructorIdInt) {
    throw new AppError(403, 'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này', 'FORBIDDEN');
  }

  const thread = await getDMThread(studentId, instructorId, senderId);
  const message = await chatRepository.createDMMessage(thread.id, senderIdInt, content);

  return message;
}

/**
 * Get user's DM threads
 */
async function getUserDMThreads(userId) {
  const threads = await chatRepository.getUserDMThreads(userId);
  return threads;
}

/**
 * Get unread DM count
 */
async function getUnreadDMCount(userId) {
  const count = await chatRepository.getUnreadDMCount(userId);
  return { unreadCount: count };
}

module.exports = {
  // Course channel
  getCourseChannel,
  getChannelMessages,
  sendChannelMessage,
  editChannelMessage,
  deleteChannelMessage,
  // DM
  getDMThread,
  getDMMessages,
  sendDMMessage,
  getUserDMThreads,
  getUnreadDMCount,
};

