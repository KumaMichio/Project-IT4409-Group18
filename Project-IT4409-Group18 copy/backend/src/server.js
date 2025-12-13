require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupChatSocket } = require('./sockets/chat.socket');

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Setup chat socket handlers
setupChatSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});
