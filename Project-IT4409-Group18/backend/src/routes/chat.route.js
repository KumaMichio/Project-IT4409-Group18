const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

// Debug middleware to log all requests to chat routes
router.use((req, res, next) => {
  console.log(`[CHAT ROUTER] ${req.method} ${req.originalUrl || req.url}`, {
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  next();
});

// ===== BOT CHAT ROUTES (Move to top to avoid route conflicts) =====
// These routes are defined first to ensure they match before parameterized routes

// Test route to verify routing works (no auth required for testing)
router.get('/bot/test', (req, res) => {
  console.log('✅ GET /api/chat/bot/test - Route test successful');
  res.json({ 
    message: 'Bot route is working', 
    path: '/api/chat/bot/test',
    timestamp: new Date().toISOString()
  });
});

// Get bot chat messages
router.get('/bot/messages', authRequired, (req, res, next) => {
  console.log('✅ GET /api/chat/bot/messages - Request received', {
    user: req.user ? { id: req.user.id } : 'no user',
    query: req.query
  });
  chatController.getBotMessages(req, res, next);
});

// Send message to bot
router.post('/bot/messages', authRequired, (req, res, next) => {
  console.log('✅ POST /api/chat/bot/messages - Request received', { 
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    user: req.user ? { id: req.user.id } : 'no user',
    hasAuth: !!req.headers.authorization
  });
  chatController.sendBotMessage(req, res, next);
});

// All other chat routes require authentication
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

// Catch-all route for debugging - should not match if routes above are correct
router.use('*', (req, res, next) => {
  console.log('⚠️  [CHAT ROUTER] Unmatched route:', req.method, req.originalUrl || req.url);
  res.status(404).json({
    error: 'Route not found in chat router',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    availableRoutes: [
      'GET /api/chat/bot/test',
      'GET /api/chat/bot/messages',
      'POST /api/chat/bot/messages'
    ]
  });
});

module.exports = router;

