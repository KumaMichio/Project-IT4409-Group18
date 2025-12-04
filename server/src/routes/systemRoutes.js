const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const systemController = require('../controllers/systemController');

router.get(
  '/overview',
  authMiddleware,
  requireRole('ADMIN'),
  systemController.getOverview
);

router.get(
  '/logs',
  authMiddleware,
  requireRole('ADMIN'),
  systemController.getLogs
);

module.exports = router;
