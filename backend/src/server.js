require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createExpressApp = require('./app');
const { setupChatSocket } = require('./sockets/chat.socket');

const app = createExpressApp();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup chat socket namespaces
setupChatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, io };
