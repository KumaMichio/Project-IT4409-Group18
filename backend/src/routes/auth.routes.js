const express = require('express');
const {
  signupController,
  signinController,
  meController,
} = require('../controllers/auth.controller');

const router = express.Router();

// Giữ nguyên path như server.js cũ:
router.post('/signup', signupController);
router.post('/signin', signinController);
router.get('/me', meController);

module.exports = router;