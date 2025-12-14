const chatService = require('../services/chat.service');
const { verifyToken } = require('../utils/jwt');

/**
 * Socket.IO authentication middleware
 */
function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    socket.userId = payload.id || payload.userId; // Support both formats
    socket.userRole = payload.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
}

/**
 * Setup chat socket handlers
 */
function setupChatSocket(io) {
  // Namespace for course channels
  const channelNamespace = io.of('/chat/channel');
  channelNamespace.use(socketAuth);

  // Namespace for direct messages
  const dmNamespace = io.of('/chat/dm');
  dmNamespace.use(socketAuth);

  // ===== COURSE CHANNEL SOCKETS (UC13) =====

  channelNamespace.on('connection', (socket) => {
    console.log(`[Channel] User ${socket.userId} connected`);

    // Join course channel room
    socket.on('join:course', async ({ courseId }) => {
      try {
        // Verify access
        await chatService.getCourseChannel(courseId, socket.userId);
        
        const room = `course:${courseId}`;
        socket.join(room);
        console.log(`[Channel] User ${socket.userId} joined ${room}`);

        socket.emit('joined:course', { courseId, room });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave course channel room
    socket.on('leave:course', ({ courseId }) => {
      const room = `course:${courseId}`;
      socket.leave(room);
      console.log(`[Channel] User ${socket.userId} left ${room}`);
    });

    // Send message to course channel
    socket.on('message:send', async ({ courseId, content }) => {
      try {
        const message = await chatService.sendChannelMessage(courseId, socket.userId, content);
        
        // Broadcast to all users in the course channel
        const room = `course:${courseId}`;
        channelNamespace.to(room).emit('message:new', { message });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Edit message
    socket.on('message:edit', async ({ messageId, content }) => {
      try {
        const message = await chatService.editChannelMessage(messageId, socket.userId, content);
        
        // Find which course this message belongs to
        // We need to get channel_id from message, then course_id from channel
        const { pool } = require('../config/db');
        const res = await pool.query(
          `SELECT cc.course_id 
           FROM messages m
           JOIN course_channels cc ON m.channel_id = cc.id
           WHERE m.id = $1`,
          [messageId]
        );

        if (res.rows.length > 0) {
          const courseId = res.rows[0].course_id;
          const room = `course:${courseId}`;
          channelNamespace.to(room).emit('message:updated', { message });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Delete message
    socket.on('message:delete', async ({ messageId }) => {
      try {
        await chatService.deleteChannelMessage(messageId, socket.userId);
        
        // Find course and broadcast
        const { pool } = require('../config/db');
        const res = await pool.query(
          `SELECT cc.course_id 
           FROM messages m
           JOIN course_channels cc ON m.channel_id = cc.id
           WHERE m.id = $1`,
          [messageId]
        );

        if (res.rows.length > 0) {
          const courseId = res.rows[0].course_id;
          const room = `course:${courseId}`;
          channelNamespace.to(room).emit('message:deleted', { messageId });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Channel] User ${socket.userId} disconnected`);
    });
  });

  // ===== DIRECT MESSAGE SOCKETS (UC14) =====

  dmNamespace.on('connection', (socket) => {
    console.log(`[DM] User ${socket.userId} connected`);

    // Join DM thread room
    socket.on('join:thread', async ({ studentId, instructorId }) => {
      try {
        const thread = await chatService.getDMThread(
          String(studentId),
          String(instructorId),
          socket.userId
        );
        const room = `thread:${thread.id}`;
        socket.join(room);
        console.log(`[DM] User ${socket.userId} joined ${room}`);

        socket.emit('joined:thread', { threadId: thread.id, room });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave DM thread room
    socket.on('leave:thread', ({ threadId }) => {
      const room = `thread:${threadId}`;
      socket.leave(room);
      console.log(`[DM] User ${socket.userId} left ${room}`);
    });

    // Send DM message
    socket.on('message:send', async ({ studentId, instructorId, content }) => {
      try {
        // Ensure IDs are properly converted
        const message = await chatService.sendDMMessage(
          String(studentId),
          String(instructorId),
          socket.userId,
          content
        );

        // Get thread ID
        const thread = await chatService.getDMThread(
          String(studentId),
          String(instructorId),
          socket.userId
        );
        const room = `thread:${thread.id}`;

        // Broadcast to both users in the thread
        dmNamespace.to(room).emit('message:new', { message });

        // Mark as read for sender
        const chatRepository = require('../repositories/chat.repository');
        await chatRepository.markDMMessagesAsRead(thread.id, socket.userId);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Mark messages as read
    socket.on('messages:read', async ({ studentId, instructorId }) => {
      try {
        const thread = await chatService.getDMThread(
          String(studentId),
          String(instructorId),
          socket.userId
        );
        const chatRepository = require('../repositories/chat.repository');
        await chatRepository.markDMMessagesAsRead(thread.id, socket.userId);

        const room = `thread:${thread.id}`;
        dmNamespace.to(room).emit('messages:read', { threadId: thread.id, userId: socket.userId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[DM] User ${socket.userId} disconnected`);
    });
  });

  return { channelNamespace, dmNamespace };
}

module.exports = { setupChatSocket };

