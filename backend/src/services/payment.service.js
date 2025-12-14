const pool = require('../config/db');
const orderRepository = require('../repositories/order.repository');
const paymentRepository = require('../repositories/payment.repository');
const cartRepository = require('../repositories/cart.repository');
const VNPay = require('../utils/payment.vnpay');
const SePay = require('../utils/payment.sepay');
const paymentConfig = require('../config/payment');

// Initialize payment gateways
const vnpay = new VNPay(paymentConfig.vnpay);
const sepay = new SePay(paymentConfig.sepay);
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
   * Note: SePay returns a Promise, VNPay returns synchronously
   */
  async generatePaymentUrl(order, ipAddress = '127.0.0.1') {
    if (order.payment_provider === 'VNPAY') {
      // If in test mode, return a test URL that simulates payment
      if (useTestMode) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Return a test URL that will simulate successful payment
        return `${frontendUrl}/payments/test-payment?orderNumber=${order.order_number}&status=success`;
      }
      return vnpay.createPaymentUrl(order, ipAddress);
    }
    
    if (order.payment_provider === 'SEPAY') {
      // SePay uses async API call
      // SePay có thể trả về object { paymentUrl, qrCodeUrl } hoặc chỉ string paymentUrl
      try {
        const result = await sepay.createPaymentUrl(order, ipAddress);
        return result;
      } catch (error) {
        console.error('SePay payment URL generation error:', error);
        throw { status: 500, message: error.message || 'Failed to create SePay payment URL' };
      }
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

  /**
   * Process SePay return/callback
   * SePay redirect về return_url sau khi thanh toán
   */
  async processSePayCallback(params) {
    console.log('=== SePay Return Callback ===');
    console.log('Query params:', params);

    // Verify signature nếu có
    if (params.signature && !sepay.verifySignature(params)) {
      throw { status: 400, message: 'Invalid SePay signature' };
    }

    const orderInfo = sepay.extractOrderInfo(params);
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

    // Process based on status
    if (orderInfo.status === 'success' || orderInfo.status === 'paid' || orderInfo.status === 'completed') {
      // Payment successful
      await paymentRepository.updatePaymentStatus(
        payment.id,
        'PAID',
        orderInfo.transactionNo,
        JSON.stringify(orderInfo.rawData)
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
        JSON.stringify(orderInfo.rawData)
      );

      await orderRepository.updateOrderStatus(order.id, 'FAILED');

      return { order, payment, success: false };
    }
  }

  /**
   * Parse order number từ SePay webhook content/description
   * Format: "QAFXEL0318  SEPAY8655 1  ORD20251214269" hoặc "ORD-20251214-269"
   * Order number format trong DB: ORD-YYYYMMDD-XXX (có dấu gạch ngang)
   */
  parseOrderNumberFromSePay(webhookData) {
    // Thử lấy trực tiếp từ các field
    let orderNumber = webhookData.order_id || webhookData.orderId || webhookData.order_number;
    
    if (orderNumber) {
      return orderNumber;
    }

    // Parse từ content hoặc description
    const content = webhookData.content || webhookData.description || '';
    
    // Tìm pattern: ORD-YYYYMMDD-XXX hoặc ORDYYYYMMDDXXX
    // Format trong DB: ORD-20251214-269
    // Format trong SePay: ORD20251214269 (không có dấu gạch)
    const patterns = [
      /ORD-(\d{4})-(\d{2})-(\d{2})-(\d+)/,  // ORD-2025-12-14-269
      /ORD-(\d{8})-(\d+)/,                   // ORD-20251214-269 (format chuẩn)
      /ORD(\d{8})(\d{1,3})/,                 // ORD20251214269 (không có dấu gạch)
      /ORD(\d{11,})/,                        // ORD20251214269 (any length >= 11)
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        // Reconstruct order number về format chuẩn: ORD-YYYYMMDD-XXX
        if (match[0].includes('-')) {
          // Format có dấu gạch ngang: ORD-20251214-269
          orderNumber = match[0];
        } else {
          // Format không có dấu gạch: ORD20251214269 -> ORD-20251214-269
          // Format: ORD + YYYYMMDD (8 chữ số) + số thứ tự (1-3 chữ số)
          const fullMatch = match[0];
          if (fullMatch.length >= 11) {
            const datePart = fullMatch.substring(3, 11); // YYYYMMDD (8 chữ số)
            const numberPart = fullMatch.substring(11);  // Số thứ tự
            orderNumber = `ORD-${datePart}-${numberPart}`;
          } else {
            // Fallback: giữ nguyên nếu không đủ độ dài
            orderNumber = fullMatch;
          }
        }
        console.log('✅ Parsed order number from content:', orderNumber, '(from:', match[0], ')');
        return orderNumber;
      }
    }

    // Nếu không tìm thấy, log để debug
    console.warn('⚠️  Could not parse order number from content/description');
    console.warn('   Content:', content);
    console.warn('   Description:', webhookData.description);
    return null;
  }

  /**
   * Process SePay webhook
   * SePay gửi webhook khi có update về payment
   */
  async processSePayWebhook(webhookData) {
    console.log('=== SePay Webhook Received ===');
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

    // Parse order number từ webhook data
    // SePay format: order number có thể nằm trong content/description
    let orderId = this.parseOrderNumberFromSePay(webhookData);

    if (!orderId) {
      throw { status: 400, message: 'Missing order_id in webhook data. Could not parse from content/description.' };
    }

    // Map SePay webhook fields
    // SePay gửi: transferType: 'in' = payment received
    const transferType = webhookData.transferType;
    const status = transferType === 'in' ? 'success' : (webhookData.status || webhookData.payment_status || 'pending');
    
    // Transaction ID từ SePay
    const transactionId = webhookData.referenceCode || webhookData.transaction_id || webhookData.transactionId || webhookData.id?.toString();
    
    // Amount từ SePay
    const amount = webhookData.transferAmount || webhookData.amount || webhookData.transfer_amount;

    // Tìm order theo order_number
    // Thử format có dấu gạch trước (format chuẩn)
    let order = await orderRepository.getOrderByOrderNumber(orderId);
    
    // Nếu không tìm thấy và orderId có dấu gạch, thử format không có dấu gạch
    if (!order && orderId.includes('-')) {
      const orderIdWithoutDash = orderId.replace(/-/g, '');
      console.log('⚠️  Order not found with format:', orderId, ', trying without dashes:', orderIdWithoutDash);
      // Tìm order bằng pattern matching (LIKE query)
      const result = await pool.query(
        `SELECT * FROM orders WHERE order_number LIKE $1 OR order_number = $2`,
        [`%${orderIdWithoutDash}%`, orderIdWithoutDash]
      );
      if (result.rows.length > 0) {
        order = result.rows[0];
        console.log('✅ Found order with pattern matching:', order.order_number);
      }
    }
    
    // Nếu vẫn không tìm thấy, thử tìm bằng cách extract date và number từ orderId
    if (!order) {
      // Thử parse lại từ content để tìm order
      const content = webhookData.content || webhookData.description || '';
      const orderMatch = content.match(/ORD(\d{8})(\d+)/);
      if (orderMatch) {
        const datePart = orderMatch[1]; // YYYYMMDD
        const numberPart = orderMatch[2]; // số thứ tự
        const formattedOrderId = `ORD-${datePart}-${numberPart}`;
        console.log('⚠️  Trying alternative format:', formattedOrderId);
        order = await orderRepository.getOrderByOrderNumber(formattedOrderId);
      }
    }

    if (!order) {
      console.warn('⚠️  Order not found with any format. Tried:', orderId);
      console.warn('   Webhook content:', webhookData.content);
      console.warn('   Webhook description:', webhookData.description);
      throw { status: 404, message: `Order not found: ${orderId}` };
    }
    
    console.log('✅ Found order:', order.order_number, 'ID:', order.id);

    // Get payment record
    const payment = await paymentRepository.getPaymentByOrderId(order.id);
    if (!payment) {
      throw { status: 404, message: 'Payment not found' };
    }

    // Check if already processed
    if (payment.status === 'PAID' && order.status === 'PAID') {
      console.log('✅ Order already processed:', orderId);
      return { 
        order, 
        payment, 
        success: true, 
        alreadyProcessed: true,
        message: 'Order already processed' 
      };
    }

    // Verify amount matches (optional but recommended)
    if (amount && order.total_amount_cents !== amount) {
      console.warn(`⚠️  Amount mismatch: order=${order.total_amount_cents}, webhook=${amount}`);
      // Vẫn xử lý nhưng log warning
    }

    // Process based on status
    // SePay: transferType === 'in' = money received = payment successful
    if (status === 'success' || status === 'paid' || status === 'completed' || transferType === 'in') {
      // Payment successful
      console.log('✅ Processing successful payment for order:', orderId);
      console.log('   Transaction ID:', transactionId);
      console.log('   Amount:', amount);
      
      await paymentRepository.updatePaymentStatus(
        payment.id,
        'PAID',
        transactionId,
        JSON.stringify(webhookData)
      );

      await orderRepository.updateOrderStatus(order.id, 'PAID');

      // Create enrollments for all courses in order
      await this.createEnrollmentsFromOrder(order.id, order.user_id);

      // Clear cart
      const cart = await cartRepository.getOrCreateCart(order.user_id);
      await cartRepository.clearCart(cart.id);

      return { 
        order, 
        payment, 
        success: true,
        message: 'Payment processed successfully' 
      };
    } else if (status === 'failed' || status === 'cancelled' || status === 'rejected' || transferType === 'out') {
      // Payment failed
      console.log('❌ Processing failed payment for order:', orderId);
      
      await paymentRepository.updatePaymentStatus(
        payment.id,
        'FAILED',
        transactionId,
        JSON.stringify(webhookData)
      );

      await orderRepository.updateOrderStatus(order.id, 'FAILED');

      return { 
        order, 
        payment, 
        success: false,
        message: 'Payment failed' 
      };
    } else {
      // Unknown status
      console.warn('⚠️  Unknown payment status:', status, 'transferType:', transferType);
      return { 
        order, 
        payment, 
        success: false,
        message: `Unknown payment status: ${status}` 
      };
    }
  }
}

module.exports = new PaymentService();

