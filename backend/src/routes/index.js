const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recommendationRoutes = require('./recommendation.routes');
const revenueRoutes = require('./revenue.routes');
const systemRoutes = require('./system.routes');
const userRoutes = require('./user.routes');
const reviewRoutes = require('./review.routes');
const profileRoutes = require('./profile.routes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/api/recommendations', recommendationRoutes);
router.use('/api/revenue', revenueRoutes);
router.use('/api/admin/system', systemRoutes);
router.use('/api/admin/users', userRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/profile', profileRoutes);

module.exports = router;
