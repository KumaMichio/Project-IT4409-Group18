const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const recommendationController = require('../controllers/recommendation.controller');

// Tất cả đều cần user login (STUDENT)
router.use(authMiddleware, requireRole('STUDENT'));

router.post('/feedback', recommendationController.postFeedback);
router.get('/feedback', recommendationController.getMyFeedback);

module.exports = router;

