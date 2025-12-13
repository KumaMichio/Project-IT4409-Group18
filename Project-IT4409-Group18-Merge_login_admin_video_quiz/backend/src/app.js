const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');

function createExpressApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

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

  // Mount existing routes
  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/modules', require('./routes/module.routes')); // Direct access for update/delete
  app.use('/api/quizzes', quizRoutes);

  // Mount new routes
  app.use('/api/auth', authRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/revenue', revenueRoutes);
  app.use('/api/admin/system', systemRoutes);
  app.use('/api/admin/users', userRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'LMS Backend is running'
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createExpressApp;
