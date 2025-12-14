const pool = require('../config/db');

class PaymentRepository {
  /**
   * Create payment record
   */
  async createPayment(orderId, provider, amountCents, currency = 'VND', enrollmentId = null) {
    const result = await pool.query(
      `INSERT INTO payments (order_id, enrollment_id, provider, amount_cents, currency, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [orderId, enrollmentId, provider, amountCents, currency]
    );
    return result.rows[0];
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    const result = await pool.query(
      `SELECT * FROM payments WHERE id = $1`,
      [paymentId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId) {
    const result = await pool.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, providerTxnId = null, rawPayload = null) {
    const result = await pool.query(
      `UPDATE payments 
       SET status = $2, 
           provider_txn_id = COALESCE($3, provider_txn_id),
           raw_payload = COALESCE($4, raw_payload)
       WHERE id = $1
       RETURNING *`,
      [paymentId, status, providerTxnId, rawPayload ? JSON.stringify(rawPayload) : null]
    );
    return result.rows[0];
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT p.*, o.order_number
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }
}

module.exports = new PaymentRepository();

