const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

// All chat routes require authentication
router.use(authRequired);

// ===== COURSE CHANNEL ROUTES (UC13) =====

// Get course channel
router.get('/course/:courseId/channel', chatController.getCourseChannel);

// Get channel messages
router.get('/course/:courseId/messages', chatController.getChannelMessages);

// Send message to channel
router.post('/course/:courseId/messages', chatController.sendChannelMessage);

// Edit message
router.put('/messages/:messageId', chatController.editMessage);

// Delete message
router.delete('/messages/:messageId', chatController.deleteMessage);

// ===== DIRECT MESSAGE ROUTES (UC14) =====

// Get user's DM threads
router.get('/dm/threads', chatController.getDMThreads);

// Get unread DM count
router.get('/dm/unread-count', chatController.getUnreadDMCount);

// Get DM thread
router.get('/dm/:studentId/:instructorId', chatController.getDMThread);

// Get DM messages
router.get('/dm/:studentId/:instructorId/messages', chatController.getDMMessages);

// Send DM message
router.post('/dm/:studentId/:instructorId/messages', chatController.sendDMMessage);

// Get user info for chat context
router.get('/users/:userId', chatController.getChatUserInfo);

// Get list of instructors (for students to start new DM)
router.get('/instructors', chatController.getInstructors);

// ===== BOT CHAT ROUTES =====

// Get bot chat messages
router.get('/bot/messages', chatController.getBotMessages);

// Send message to bot
router.post('/bot/messages', chatController.sendBotMessage);

module.exports = router;

