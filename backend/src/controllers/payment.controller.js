const paymentService = require('../services/payment.service');

/**
 * Get checkout info from cart
 * GET /api/payments/checkout
 */
const getCheckoutInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const checkoutInfo = await paymentService.getCheckoutInfo(userId);
    res.json(checkoutInfo);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error getting checkout info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Create order and get payment URL
 * POST /api/payments/create-order
 * Body: { paymentProvider: 'VNPAY' }
 */
const createOrder = async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }

    const userId = req.user.id;
    const { paymentProvider = 'VNPAY' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

    console.log('Creating order for user:', userId, 'with provider:', paymentProvider);

    // Create order from cart
    const { order, payment, isFree } = await paymentService.createOrderFromCart(userId, paymentProvider);

    // If free courses, return success immediately (no payment needed)
    if (isFree) {
      console.log('Free courses - enrolled directly:', order.order_number);
      return res.json({
        orderId: order.id,
        orderNumber: order.order_number,
        paymentUrl: null,
        paymentId: payment.id,
        isFree: true,
        message: 'Đã đăng ký khóa học miễn phí thành công'
      });
    }

    // Generate payment URL for paid courses
    // Note: SePay returns a Promise, VNPay returns synchronously
    // SePay có thể trả về object { paymentUrl, qrCodeUrl } hoặc chỉ string paymentUrl
    const paymentResult = await paymentService.generatePaymentUrl(order, ipAddress);

    console.log('Order created:', order.order_number, 'Payment URL generated');

    // Xử lý response: SePay có thể trả về object hoặc string
    const responseData = {
      orderId: order.id,
      orderNumber: order.order_number,
      paymentId: payment.id,
      isFree: false
    };

    if (typeof paymentResult === 'object' && paymentResult.paymentUrl) {
      // SePay trả về object với paymentUrl và qrCodeUrl
      responseData.paymentUrl = paymentResult.paymentUrl;
      if (paymentResult.qrCodeUrl) {
        responseData.qrCodeUrl = paymentResult.qrCodeUrl;
      }
    } else {
      // VNPay hoặc SePay chỉ trả về string
      responseData.paymentUrl = paymentResult;
    }

    res.json(responseData);
  } catch (error) {
    if (error.status) {
      console.error('Payment service error:', error.message);
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * VNPay return/callback handler
 * GET /api/payments/vnpay-return
 */
const vnpayReturn = async (req, res) => {
  try {
    console.log('=== VNPay Return Callback ===');
    console.log('Query params:', req.query);
    
    const result = await paymentService.processVNPayCallback(req.query);
    
    console.log('Payment processing result:', {
      success: result.success,
      orderNumber: result.order?.order_number,
      alreadyProcessed: result.alreadyProcessed
    });

    if (result.success) {
      // Redirect to success page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?orderNumber=${result.order.order_number}`;
      console.log('Redirecting to success:', redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      // Redirect to cancel page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?orderNumber=${result.order.order_number}`;
      console.log('Redirecting to cancel:', redirectUrl);
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    console.error('Error stack:', error.stack);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?error=${encodeURIComponent(error.message || 'Payment processing error')}`;
    console.log('Redirecting to cancel with error:', redirectUrl);
    return res.redirect(redirectUrl);
  }
};

/**
 * Get order detail
 * GET /api/payments/orders/:orderId
 */
const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);

    const order = await paymentService.getOrderDetail(orderId, userId);
    res.json(order);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error getting order detail:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get user orders
 * GET /api/payments/orders
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const orders = await paymentService.getUserOrders(userId, limit, offset);
    res.json(orders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * SePay return/callback handler
 * GET /api/payments/sepay-return
 * SePay redirect về đây sau khi thanh toán
 */
const sepayReturn = async (req, res) => {
  try {
    console.log('=== SePay Return Callback ===');
    console.log('Query params:', req.query);
    console.log('Query params keys:', Object.keys(req.query));
    
    // Nếu không có query params, có thể là SePay chưa redirect hoặc đang test
    // Kiểm tra xem có orderNumber trong query không
    if (Object.keys(req.query).length === 0) {
      console.warn('⚠️  SePay return callback received with empty query params');
      // Redirect về trang thanh toán với thông báo
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?error=${encodeURIComponent('Chưa nhận được thông tin thanh toán từ SePay. Vui lòng kiểm tra lại.')}`;
      return res.redirect(redirectUrl);
    }
    
    const result = await paymentService.processSePayCallback(req.query);
    
    console.log('Payment processing result:', {
      success: result.success,
      orderNumber: result.order?.order_number,
      alreadyProcessed: result.alreadyProcessed
    });

    if (result.success) {
      // Redirect to success page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?orderNumber=${result.order.order_number}`;
      console.log('Redirecting to success:', redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      // Redirect to cancel page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?orderNumber=${result.order.order_number}`;
      console.log('Redirecting to cancel:', redirectUrl);
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('SePay return error:', error);
    console.error('Error stack:', error.stack);
    
    // Nếu lỗi "Order not found", có thể do SePay chưa gửi đúng params
    // Hoặc order number không khớp
    let errorMessage = error.message || 'Payment processing error';
    if (error.status === 404 && error.message === 'Order not found') {
      errorMessage = 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.';
    }
    
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel?error=${encodeURIComponent(errorMessage)}`;
    console.log('Redirecting to cancel with error:', redirectUrl);
    return res.redirect(redirectUrl);
  }
};

/**
 * SePay webhook handler
 * POST /api/payments/sepay-webhook
 * SePay gọi endpoint này khi có update về payment
 */
const sepayWebhook = async (req, res) => {
  try {
    console.log('=== SePay Webhook Received ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Process webhook
    const result = await paymentService.processSePayWebhook(req.body);
    
    console.log('Webhook processing result:', {
      success: result.success,
      orderNumber: result.order?.order_number,
      alreadyProcessed: result.alreadyProcessed,
      message: result.message
    });

    // SePay expects 200 OK response
    res.status(200).json({ 
      status: 'success',
      message: result.message || 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('SePay webhook error:', error);
    console.error('Error stack:', error.stack);
    
    // Trả về 200 để SePay không retry (hoặc 400 nếu muốn SePay retry)
    const statusCode = error.status || 400;
    res.status(statusCode).json({ 
      status: 'error', 
      message: error.message || 'Webhook processing failed' 
    });
  }
};

module.exports = {
  getCheckoutInfo,
  createOrder,
  vnpayReturn,
  sepayReturn,
  sepayWebhook,
  getOrderDetail,
  getUserOrders,
};

