const pool = require('../config/db');
const orderRepository = require('../repositories/order.repository');
const paymentRepository = require('../repositories/payment.repository');
const cartRepository = require('../repositories/cart.repository');
const VNPay = require('../utils/payment.vnpay');
const paymentConfig = require('../config/payment');

// Initialize VNPay
const vnpay = new VNPay(paymentConfig.vnpay);
const { useTestMode } = paymentConfig;

class PaymentService {
  /**
   * Get checkout info from cart
   */
  async getCheckoutInfo(userId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const cartItems = await cartRepository.getCartItems(cart.id);
    
    if (cartItems.length === 0) {
      throw { status: 400, message: 'Giỏ hàng trống' };
    }

    // Calculate total
    const totalAmountCents = cartItems.reduce((sum, item) => sum + item.price_cents, 0);

    return {
      cartItems,
      totalAmountCents,
      itemCount: cartItems.length
    };
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(userId, paymentProvider = 'VNPAY') {
    // Get cart items
    const cart = await cartRepository.getOrCreateCart(userId);
    const cartItems = await cartRepository.getCartItems(cart.id);

    if (cartItems.length === 0) {
      throw { status: 400, message: 'Giỏ hàng trống' };
    }

    // Cart items are already filtered by is_published = true in getCartItems
    // No need to validate again

    // Calculate total
    const totalAmountCents = cartItems.reduce((sum, item) => sum + item.price_cents, 0);

    // If total is 0 (all free courses), enroll directly without payment
    if (totalAmountCents === 0) {
      // Create order with status PAID immediately
      const order = await orderRepository.createOrder(
        userId,
        0,
        'VND',
        paymentProvider
      );

      // Add order items
      for (const item of cartItems) {
        await orderRepository.addOrderItem(order.id, item.course_id, 0);
      }

      // Create payment record with status PAID
      const payment = await paymentRepository.createPayment(
        order.id,
        paymentProvider,
        0,
        'VND'
      );

      // Mark order and payment as PAID
      await orderRepository.updateOrderStatus(order.id, 'PAID');
      await paymentRepository.updatePaymentStatus(payment.id, 'PAID', null, null);

      // Create enrollments for all courses
      await this.createEnrollmentsFromOrder(order.id, userId);

      // Clear cart
      await cartRepository.clearCart(cart.id);

      return {
        order,
        payment,
        isFree: true
      };
    }

    // Paid courses - normal flow
    // Create order
    const order = await orderRepository.createOrder(
      userId,
      totalAmountCents,
      'VND',
      paymentProvider
    );

    // Add order items
    for (const item of cartItems) {
      await orderRepository.addOrderItem(order.id, item.course_id, item.price_cents);
    }

    // Create payment record
    const payment = await paymentRepository.createPayment(
      order.id,
      paymentProvider,
      totalAmountCents,
      'VND'
    );

    return {
      order,
      payment,
      isFree: false
    };
  }

  /**
   * Generate payment URL
   */
  generatePaymentUrl(order, ipAddress = '127.0.0.1') {
    if (order.payment_provider === 'VNPAY') {
      // If in test mode, return a test URL that simulates payment
      if (useTestMode) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Return a test URL that will simulate successful payment
        return `${frontendUrl}/payments/test-payment?orderNumber=${order.order_number}&status=success`;
      }
      return vnpay.createPaymentUrl(order, ipAddress);
    }
    throw { status: 400, message: 'Payment provider not supported' };
  }

  /**
   * Process VNPay return/callback
   */
  async processVNPayCallback(vnp_Params) {
    // In test mode, skip signature verification
    if (!useTestMode) {
      // Verify signature
      if (!vnpay.verifyReturnUrl(vnp_Params)) {
        throw { status: 400, message: 'Invalid signature' };
      }
    } else {
      console.log('⚠️  TEST MODE: Skipping signature verification');
    }

    const orderInfo = vnpay.extractOrderInfo(vnp_Params);
    const order = await orderRepository.getOrderByOrderNumber(orderInfo.orderNumber);

    if (!order) {
      throw { status: 404, message: 'Order not found' };
    }

    // Get payment record
    const payment = await paymentRepository.getPaymentByOrderId(order.id);
    if (!payment) {
      throw { status: 404, message: 'Payment not found' };
    }

    // Check if already processed
    if (payment.status === 'PAID' && order.status === 'PAID') {
      return { order, payment, success: true, alreadyProcessed: true };
    }

    if (orderInfo.responseCode === '00') {
      // Payment successful
      await paymentRepository.updatePaymentStatus(
        payment.id,
        'PAID',
        orderInfo.transactionNo,
        orderInfo.rawData
      );

      await orderRepository.updateOrderStatus(order.id, 'PAID');

      // Create enrollments for all courses in order
      await this.createEnrollmentsFromOrder(order.id, order.user_id);

      // Clear cart
      const cart = await cartRepository.getOrCreateCart(order.user_id);
      await cartRepository.clearCart(cart.id);

      return { order, payment, success: true };
    } else {
      // Payment failed
      await paymentRepository.updatePaymentStatus(
        payment.id,
        'FAILED',
        orderInfo.transactionNo,
        orderInfo.rawData
      );

      await orderRepository.updateOrderStatus(order.id, 'FAILED');

      return { order, payment, success: false };
    }
  }

  /**
   * Create enrollments from order
   */
  async createEnrollmentsFromOrder(orderId, userId) {
    const order = await orderRepository.getOrderWithItems(orderId);
    
    if (!order || !order.items) {
      throw { status: 404, message: 'Order not found' };
    }

    const enrollments = [];
    for (const item of order.items) {
      try {
        // Check if already enrolled
        const existingResult = await pool.query(
          `SELECT id FROM enrollments 
           WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
          [item.course_id, userId]
        );

        if (existingResult.rows.length === 0) {
          // Create enrollment
          const enrollmentResult = await pool.query(
            `INSERT INTO enrollments (course_id, student_id, status)
             VALUES ($1, $2, 'ACTIVE')
             ON CONFLICT (course_id, student_id) 
             DO UPDATE SET status = 'ACTIVE', enrolled_at = NOW()
             RETURNING *`,
            [item.course_id, userId]
          );
          enrollments.push(enrollmentResult.rows[0]);
        }
      } catch (error) {
        console.error(`Error creating enrollment for course ${item.course_id}:`, error);
        // Continue with other courses
      }
    }

    return enrollments;
  }

  /**
   * Get order detail
   */
  async getOrderDetail(orderId, userId) {
    const order = await orderRepository.getOrderWithItems(orderId);
    
    if (!order) {
      throw { status: 404, message: 'Order not found' };
    }

    // Check if user owns this order
    if (order.user_id !== userId) {
      throw { status: 403, message: 'Access denied' };
    }

    return order;
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId, limit = 50, offset = 0) {
    return await orderRepository.getUserOrders(userId, limit, offset);
  }
}

module.exports = new PaymentService();

