const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getCart,
  addItem,
  removeItem,
  clearCart,
  getSummary
} = require('../controllers/cart.controller');

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart - Get user's cart with items
router.get('/', getCart);

// GET /api/cart/summary - Get cart summary (count, total price)
router.get('/summary', getSummary);

// POST /api/cart/items - Add course to cart
router.post('/items', addItem);

// DELETE /api/cart/items/:courseId - Remove course from cart
router.delete('/items/:courseId', removeItem);

// DELETE /api/cart - Clear entire cart
router.delete('/', clearCart);

module.exports = router;

