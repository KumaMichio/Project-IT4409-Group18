const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middlewares/error.middleware');

function createExpressApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Serve static files (uploaded videos)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Existing Routes
  const courseRoutes = require('./routes/course.routes');
  const lessonRoutes = require('./routes/lesson.routes');
  const quizRoutes = require('./routes/quiz.routes');

  // New Routes (merged from teammate)
  const authRoutes = require('./routes/auth.routes');
  const recommendationRoutes = require('./routes/recommendation.routes');
  const revenueRoutes = require('./routes/revenue.routes');
  const systemRoutes = require('./routes/system.routes');
  const userRoutes = require('./routes/user.routes');
  const cartRoutes = require('./routes/cart.routes');
  const paymentRoutes = require('./routes/payment.routes');
  const enrollmentRoutes = require('./routes/enrollment.routes');
  const chatRoutes = require('./routes/chat.route');

  // Mount existing routes
  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/quizzes', quizRoutes);

  // Mount new routes
  app.use('/api/auth', authRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/revenue', revenueRoutes);
  app.use('/api/admin/system', systemRoutes);
  app.use('/api/admin/users', userRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  
  // Debug middleware for chat routes
  app.use('/api/chat', (req, res, next) => {
    console.log(`[APP] Chat route request: ${req.method} ${req.originalUrl}`);
    next();
  });
  app.use('/api/chat', chatRoutes);

  // Health check
  app.get('/api/health', async (req, res) => {
    const { testConnection } = require('./config/db');
    const dbStatus = await testConnection();
    
    res.json({
      status: 'OK',
      message: 'LMS Backend is running',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler for unmatched routes
  app.use('/api/*', (req, res, next) => {
    console.log('⚠️  [APP] 404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({
      error: 'Endpoint not found',
      method: req.method,
      path: req.originalUrl,
      message: 'The requested API endpoint does not exist'
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createExpressApp;
