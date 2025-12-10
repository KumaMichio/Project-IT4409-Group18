const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes cũ: /auth/signup, /auth/signin, /auth/me
app.use('/auth', authRoutes);

// Health check đơn giản
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
