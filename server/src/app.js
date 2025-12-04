const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const recommendationRoutes = require('./routes/recommendationRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/admin/system', systemRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
