const express = require('express');
const cors = require('cors');

function createExpressApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  const courseRoutes = require('./routes/course.routes');
  const lessonRoutes = require('./routes/lesson.routes');
  const quizRoutes = require('./routes/quiz.routes');

  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/quizzes', quizRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'LMS Backend is running'
    });
  });

  return app;
}

module.exports = createExpressApp;
