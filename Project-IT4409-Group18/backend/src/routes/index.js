const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recommendationRoutes = require('./recommendation.routes');
const revenueRoutes = require('./revenue.routes');
const systemRoutes = require('./system.routes');
const userRoutes = require('./user.routes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/api/recommendations', recommendationRoutes);
router.use('/api/revenue', revenueRoutes);
router.use('/api/admin/system', systemRoutes);
router.use('/api/admin/users', userRoutes);

module.exports = router;
