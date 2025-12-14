const pool = require('../config/db');

class CartRepository {
  /**
   * Get or create cart for user
   * @param {number} userId
   * @returns {Promise<Object>} Cart object
   */
  async getOrCreateCart(userId) {
    // Try to get existing cart
    let result = await pool.query(
      `SELECT id, user_id, created_at, updated_at 
       FROM carts 
       WHERE user_id = $1`,
      [userId]
    );

    // If cart doesn't exist, create it
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO carts (user_id) 
         VALUES ($1) 
         RETURNING id, user_id, created_at, updated_at`,
        [userId]
      );
    }

    return result.rows[0];
  }

  /**
   * Get cart items with course details
   * @param {number} cartId
   * @returns {Promise<Array>} Array of cart items with course info
   */
  async getCartItems(cartId) {
    const result = await pool.query(
      `SELECT 
        ci.id,
        ci.cart_id,
        ci.course_id,
        ci.added_at,
        c.title,
        c.slug,
        c.description,
        c.thumbnail_url,
        c.price_cents,
        c.currency,
        u.id as instructor_id,
        u.full_name as instructor_name,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT cr.id) as review_count
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
       LEFT JOIN course_reviews cr ON c.id = cr.course_id
       WHERE ci.cart_id = $1 AND c.is_published = true
       GROUP BY ci.id, ci.cart_id, ci.course_id, ci.added_at, 
                c.id, c.title, c.slug, c.description, c.thumbnail_url, 
                c.price_cents, c.currency, u.id, u.full_name
       ORDER BY ci.added_at DESC`,
      [cartId]
    );
    return result.rows;
  }

  /**
   * Add course to cart
   * @param {number} cartId
   * @param {number} courseId
   * @returns {Promise<Object>} Cart item object
   */
  async addCartItem(cartId, courseId) {
    // Update cart updated_at
    await pool.query(
      `UPDATE carts SET updated_at = now() WHERE id = $1`,
      [cartId]
    );

    const result = await pool.query(
      `INSERT INTO cart_items (cart_id, course_id) 
       VALUES ($1, $2) 
       ON CONFLICT (cart_id, course_id) DO NOTHING
       RETURNING id, cart_id, course_id, added_at`,
      [cartId, courseId]
    );
    return result.rows[0];
  }

  /**
   * Remove course from cart
   * @param {number} cartId
   * @param {number} courseId
   * @returns {Promise<boolean>} True if item was removed
   */
  async removeCartItem(cartId, courseId) {
    // Update cart updated_at
    await pool.query(
      `UPDATE carts SET updated_at = now() WHERE id = $1`,
      [cartId]
    );

    const result = await pool.query(
      `DELETE FROM cart_items 
       WHERE cart_id = $1 AND course_id = $2`,
      [cartId, courseId]
    );
    return result.rowCount > 0;
  }

  /**
   * Clear all items from cart
   * @param {number} cartId
   * @returns {Promise<number>} Number of items removed
   */
  async clearCart(cartId) {
    // Update cart updated_at
    await pool.query(
      `UPDATE carts SET updated_at = now() WHERE id = $1`,
      [cartId]
    );

    const result = await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );
    return result.rowCount;
  }

  /**
   * Get cart summary (count and total price)
   * @param {number} cartId
   * @returns {Promise<Object>} { itemCount, totalPrice }
   */
  async getCartSummary(cartId) {
    const result = await pool.query(
      `SELECT 
        COUNT(ci.id) as item_count,
        COALESCE(SUM(c.price_cents), 0) as total_price_cents
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       WHERE ci.cart_id = $1 AND c.is_published = true`,
      [cartId]
    );
    
    // Handle empty cart case
    if (!result.rows || result.rows.length === 0) {
      return {
        itemCount: 0,
        totalPriceCents: 0
      };
    }
    
    return {
      itemCount: parseInt(result.rows[0].item_count) || 0,
      totalPriceCents: parseInt(result.rows[0].total_price_cents) || 0
    };
  }

  /**
   * Check if course exists and is published
   * @param {number} courseId
   * @returns {Promise<Object|null>} Course object or null
   */
  async checkCourseExists(courseId) {
    const result = await pool.query(
      `SELECT id, title, price_cents, is_published 
       FROM courses 
       WHERE id = $1`,
      [courseId]
    );
    return result.rows[0] || null;
  }

  /**
   * Check if user is enrolled in course
   * @param {number} userId
   * @param {number} courseId
   * @returns {Promise<boolean>} True if enrolled
   */
  async checkEnrollment(userId, courseId) {
    const result = await pool.query(
      `SELECT id FROM enrollments 
       WHERE student_id = $1 AND course_id = $2 AND status = 'ACTIVE'`,
      [userId, courseId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get cart item count (for limit validation)
   * @param {number} cartId
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartItemCount(cartId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );
    return parseInt(result.rows[0].count) || 0;
  }
}

module.exports = new CartRepository();

