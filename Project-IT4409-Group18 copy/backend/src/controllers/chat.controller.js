const chatService = require('../services/chat.service');

// ===== COURSE CHANNEL MESSAGES (UC13) =====

/**
 * GET /api/chat/course/:courseId/channel
 * Get course channel info
 */
async function getCourseChannel(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const channel = await chatService.getCourseChannel(courseId, userId);
    res.json({ channel });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/course/:courseId/messages
 * Get channel messages
 */
async function getChannelMessages(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;

    const result = await chatService.getChannelMessages(courseId, userId, limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/course/:courseId/messages
 * Send message to course channel
 */
async function sendChannelMessage(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Nội dung tin nhắn là bắt buộc' });
    }

    const message = await chatService.sendChannelMessage(courseId, userId, content);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/chat/messages/:messageId
 * Edit a message
 */
async function editMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Nội dung tin nhắn là bắt buộc' });
    }

    const message = await chatService.editChannelMessage(messageId, userId, content);
    res.json({ message });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/messages/:messageId
 * Delete a message
 */
async function deleteMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const result = await chatService.deleteChannelMessage(messageId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ===== DIRECT MESSAGES (UC14) =====

/**
 * GET /api/chat/dm/threads
 * Get user's DM threads
 */
async function getDMThreads(req, res, next) {
  try {
    const userId = req.user.id;
    const threads = await chatService.getUserDMThreads(userId);
    res.json({ threads });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/dm/unread-count
 * Get unread DM count
 */
async function getUnreadDMCount(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await chatService.getUnreadDMCount(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/dm/:studentId/:instructorId
 * Get DM thread between student and instructor
 */
async function getDMThread(req, res, next) {
  try {
    const { studentId, instructorId } = req.params;
    const userId = req.user.id;

    const thread = await chatService.getDMThread(studentId, instructorId, userId);
    res.json({ thread });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/dm/:studentId/:instructorId/messages
 * Get DM messages
 */
async function getDMMessages(req, res, next) {
  try {
    const { studentId, instructorId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;

    const result = await chatService.getDMMessages(studentId, instructorId, userId, limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/dm/:studentId/:instructorId/messages
 * Send DM message
 */
async function sendDMMessage(req, res, next) {
  try {
    const { studentId, instructorId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Nội dung tin nhắn là bắt buộc' });
    }

    const message = await chatService.sendDMMessage(studentId, instructorId, senderId, content);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/users/:userId
 * Get user info for chat (limited fields, for chat participants)
 */
async function getChatUserInfo(req, res, next) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Only allow getting info of users you're chatting with
    // This is a simple check - in production, verify they have an active thread
    const userRepository = require('../repositories/user.repository');
    const user = await userRepository.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Return limited info
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/instructors
 * Get list of instructors (for students to start new DM)
 */
async function getInstructors(req, res, next) {
  try {
    const userRepository = require('../repositories/user.repository');
    // Get all instructors (INSTRUCTOR role in database)
    const instructors = await userRepository.getUsersByRole('INSTRUCTOR');
    
    // Filter only active users and map to frontend format
    const activeInstructors = instructors
      .filter((u) => u.is_active !== false)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }));

    res.json({ instructors: activeInstructors });
  } catch (err) {
    next(err);
  }
}

// ===== BOT CHAT =====

/**
 * GET /api/chat/bot/messages
 * Get bot chat messages for current user
 */
async function getBotMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;

    const result = await chatService.getBotMessages(userId, limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/bot/messages
 * Send message to bot and get response
 */
async function sendBotMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { content, conversationHistory } = req.body; // Frontend gửi conversation history

    if (!content) {
      return res.status(400).json({ error: 'Nội dung tin nhắn là bắt buộc' });
    }

    // Pass conversation history từ frontend (không lưu vào database)
    const result = await chatService.sendBotMessage(userId, content, conversationHistory || []);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Course channel
  getCourseChannel,
  getChannelMessages,
  sendChannelMessage,
  editMessage,
  deleteMessage,
  // DM
  getDMThreads,
  getUnreadDMCount,
  getDMThread,
  getDMMessages,
  sendDMMessage,
  getChatUserInfo,
  getInstructors,
  // Bot chat
  getBotMessages,
  sendBotMessage,
};

