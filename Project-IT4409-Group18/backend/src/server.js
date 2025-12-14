require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createExpressApp = require('./app');
const { setupChatSocket } = require('./sockets/chat.socket');
const { testConnection } = require('./config/db');

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

// Start server with database connection check
async function startServer() {
  console.log('🔄 Checking database connection...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but may not work properly.');
    console.error('   Please check your .env file and ensure PostgreSQL is running.');
  }
  
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    if (dbConnected) {
      console.log('✅ Server is ready to accept requests!');
    }
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = { app, server, io };
