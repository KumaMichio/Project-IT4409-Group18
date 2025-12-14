const cartRepository = require('../repositories/cart.repository');

class CartService {
  /**
   * Get user's cart with items
   * @param {number} userId
   * @returns {Promise<Object>} Cart with items
   */
  async getUserCart(userId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const items = await cartRepository.getCartItems(cart.id);
    const summary = await cartRepository.getCartSummary(cart.id);

    return {
      cart: {
        id: cart.id,
        userId: cart.user_id,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at
      },
      items,
      summary
    };
  }

  /**
   * Add course to cart
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<Object>} Added cart item
   */
  async addCourseToCart(userId, courseId) {
    // 1. Check if course exists and is published
    const course = await cartRepository.checkCourseExists(courseId);
    if (!course) {
      throw {
        status: 404,
        message: 'Khóa học không tồn tại'
      };
    }

    if (!course.is_published) {
      throw {
        status: 400,
        message: 'Khóa học chưa được xuất bản'
      };
    }

    // 2. Check if user is already enrolled
    const isEnrolled = await cartRepository.checkEnrollment(userId, courseId);
    if (isEnrolled) {
      throw {
        status: 400,
        message: 'Bạn đã đăng ký khóa học này'
      };
    }

    // 3. Get or create cart
    const cart = await cartRepository.getOrCreateCart(userId);

    // 4. Check cart limit (50 items)
    const itemCount = await cartRepository.getCartItemCount(cart.id);
    if (itemCount >= 50) {
      throw {
        status: 400,
        message: 'Giỏ hàng đã đầy (tối đa 50 khóa học)'
      };
    }

    // 5. Check if course already in cart
    const existingItems = await cartRepository.getCartItems(cart.id);
    const alreadyInCart = existingItems.some(item => item.course_id === courseId);
    if (alreadyInCart) {
      throw {
        status: 400,
        message: 'Khóa học đã có trong giỏ hàng'
      };
    }

    // 6. Add to cart
    const cartItem = await cartRepository.addCartItem(cart.id, courseId);
    if (!cartItem) {
      throw {
        status: 400,
        message: 'Không thể thêm khóa học vào giỏ hàng'
      };
    }

    return cartItem;
  }

  /**
   * Remove course from cart
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>} True if removed
   */
  async removeCourseFromCart(userId, courseId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const removed = await cartRepository.removeCartItem(cart.id, courseId);
    
    if (!removed) {
      throw {
        status: 404,
        message: 'Khóa học không có trong giỏ hàng'
      };
    }

    return true;
  }

  /**
   * Clear user's cart
   * @param {number} userId
   * @returns {Promise<number>} Number of items removed
   */
  async clearUserCart(userId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const removedCount = await cartRepository.clearCart(cart.id);
    return removedCount;
  }

  /**
   * Get cart summary
   * @param {number} userId
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary(userId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const summary = await cartRepository.getCartSummary(cart.id);
    return summary;
  }
}

module.exports = new CartService();

