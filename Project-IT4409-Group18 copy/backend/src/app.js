const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const routes = require('./routes/index');

// Import middlewares
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount all routes
app.use('/', routes);

// Error handling middleware (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;
