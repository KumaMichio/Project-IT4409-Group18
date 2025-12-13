const pool = require('../config/db');

class OrderRepository {
  /**
   * Generate unique order number
   */
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Create order
   */
  async createOrder(userId, totalAmountCents, currency = 'VND', paymentProvider = null) {
    const orderNumber = this.generateOrderNumber();
    const result = await pool.query(
      `INSERT INTO orders (user_id, order_number, total_amount_cents, currency, payment_provider)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, orderNumber, totalAmountCents, currency, paymentProvider]
    );
    return result.rows[0];
  }

  /**
   * Add item to order
   */
  async addOrderItem(orderId, courseId, priceCents) {
    const result = await pool.query(
      `INSERT INTO order_items (order_id, course_id, price_cents)
       VALUES ($1, $2, $3)
       ON CONFLICT (order_id, course_id) DO NOTHING
       RETURNING *`,
      [orderId, courseId, priceCents]
    );
    return result.rows[0];
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get order by order number
   */
  async getOrderByOrderNumber(orderNumber) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE order_number = $1`,
      [orderNumber]
    );
    return result.rows[0] || null;
  }

  /**
   * Get order with items
   */
  async getOrderWithItems(orderId) {
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT 
        oi.id, oi.order_id, oi.course_id, oi.price_cents, oi.created_at,
        c.title, c.slug, c.thumbnail_url, c.description,
        u.full_name as instructor_name
       FROM order_items oi
       JOIN courses c ON oi.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows
    };
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    if (status === 'PAID') {
      const result = await pool.query(
        `UPDATE orders 
         SET status = $2, completed_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [orderId, status]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `UPDATE orders 
         SET status = $2, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [orderId, status]
      );
      return result.rows[0];
    }
  }

  /**
   * Update order payment provider
   */
  async updateOrderPaymentProvider(orderId, provider) {
    const result = await pool.query(
      `UPDATE orders 
       SET payment_provider = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId, provider]
    );
    return result.rows[0];
  }
}

module.exports = new OrderRepository();

