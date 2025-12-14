const cartService = require('../services/cart.service');

/**
 * Get user's cart
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartData = await cartService.getUserCart(userId);
    res.json(cartData);
  } catch (error) {
    console.error('Error fetching cart:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to fetch cart'
    });
  }
};

/**
 * Add course to cart
 * POST /api/cart/items
 * Body: { courseId: number }
 */
const addItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const cartItem = await cartService.addCourseToCart(userId, courseId);
    res.status(201).json({
      message: 'Đã thêm khóa học vào giỏ hàng',
      cartItem
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Remove course from cart
 * DELETE /api/cart/items/:courseId
 */
const removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    await cartService.removeCourseFromCart(userId, parseInt(courseId));
    res.json({
      message: 'Đã xóa khóa học khỏi giỏ hàng'
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const removedCount = await cartService.clearUserCart(userId);
    res.json({
      message: 'Đã xóa toàn bộ giỏ hàng',
      removedCount
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get cart summary
 * GET /api/cart/summary
 */
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await cartService.getCartSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  clearCart,
  getSummary
};

