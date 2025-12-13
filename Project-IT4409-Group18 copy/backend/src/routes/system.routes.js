const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const systemController = require('../controllers/system.controller');

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

router.get(
  '/maintenance-mode',
  authMiddleware,
  requireRole('ADMIN'),
  systemController.getMaintenanceMode
);

router.put(
  '/maintenance-mode',
  authMiddleware,
  requireRole('ADMIN'),
  systemController.setMaintenanceMode
);

module.exports = router;

