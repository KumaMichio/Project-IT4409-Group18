const crypto = require('crypto');
const axios = require('axios');

class SePay {
  constructor(config) {
    this.token = config.token;
    this.secretKey = config.secretKey;
    this.apiUrl = config.apiUrl || 'https://api.sepay.vn';
    this.returnUrl = config.returnUrl;
    this.webhookUrl = config.webhookUrl;
    // QR Code config
    this.qrCodeAccount = config.qrCodeAccount;
    this.qrCodeBank = config.qrCodeBank;
    this.qrCodeBaseUrl = config.qrCodeBaseUrl || 'https://qr.sepay.vn/img';
  }

  /**
   * Tạo QR code URL từ thông tin order
   * Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=ORDER_NUMBER
   * @param {Object} order - Order object
   * @returns {String|null} QR Code URL hoặc null nếu thiếu config
   */
  createQRCodeUrl(order) {
    if (!this.qrCodeAccount || !this.qrCodeBank) {
      console.warn('⚠️  SePay QR code config missing (SEPAY_QR_ACCOUNT or SEPAY_QR_BANK)');
      return null;
    }

    const orderId = order.order_number;
    const amount = order.total_amount_cents; // Amount in cents (VND)

    // Tạo QR code URL theo format SePay
    const params = new URLSearchParams({
      acc: this.qrCodeAccount,
      bank: this.qrCodeBank,
      amount: amount.toString(),
      des: orderId, // Mô tả = order number
    });

    const qrCodeUrl = `${this.qrCodeBaseUrl}?${params.toString()}`;
    console.log('✅ SePay QR code URL created:', qrCodeUrl);
    
    return qrCodeUrl;
  }

  /**
   * Tạo payment URL từ order
   * SePay: Bỏ qua API call, chỉ dùng QR code từ config
   * @param {Object} order - Order object
   * @param {String} ipAddress - IP address của khách hàng (không dùng)
   * @returns {Promise<Object>} Object { paymentUrl, qrCodeUrl }
   */
  async createPaymentUrl(order, ipAddress = '127.0.0.1') {
    const orderId = order.order_number;
    const amount = order.total_amount_cents; // Amount in cents (VND)
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount: amount must be greater than 0');
    }

    console.log('=== SePay Payment URL Generation (QR Code Only) ===');
    console.log('Order ID:', orderId);
    console.log('Amount (cents):', amount);
    console.log('⚠️  Skipping SePay API call - Using QR code from config only');

    // Tạo QR code URL từ config
    const qrCodeUrl = this.createQRCodeUrl(order);
    
    if (!qrCodeUrl) {
      throw new Error('QR code not available. Please configure SEPAY_QR_ACCOUNT and SEPAY_QR_BANK in .env');
    }

    // Tạo URL đến trang QR code payment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentInfoUrl = `${frontendUrl}/payments/qr-code?orderNumber=${orderId}&paymentUrl=${encodeURIComponent('')}&qrCodeUrl=${encodeURIComponent(qrCodeUrl)}`;

    console.log('✅ SePay QR code URL created:', qrCodeUrl);
    console.log('✅ Payment info URL:', paymentInfoUrl);

    return {
      paymentUrl: paymentInfoUrl, // URL đến trang QR code
      qrCodeUrl: qrCodeUrl,
    };
  }

  /**
   * Tạo signature cho request
   * SePay sử dụng MD5 hash với format: key1=value1&key2=value2&secret_key=SECRET
   */
  createSignature(data) {
    // Sắp xếp các key theo thứ tự alphabet (bỏ qua signature field)
    const sortedKeys = Object.keys(data)
      .filter(key => key !== 'signature')
      .sort();
    
    // Tạo query string
    const queryString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(data[key] || '')}`)
      .join('&');
    
    // Thêm secret key
    const signData = queryString + `&secret_key=${this.secretKey}`;
    
    console.log('Sign data:', signData.replace(this.secretKey, '***'));
    
    // Tạo MD5 hash
    const signature = crypto.createHash('md5').update(signData).digest('hex');
    
    return signature;
  }

  /**
   * Verify signature từ return URL hoặc webhook
   */
  verifySignature(data) {
    const receivedSignature = data.signature;
    const calculatedSignature = this.createSignature(data);
    
    return receivedSignature === calculatedSignature;
  }

  /**
   * Extract order info từ SePay return/callback params
   */
  extractOrderInfo(data) {
    return {
      orderNumber: data.order_id || data.orderId || data.order_number,
      transactionNo: data.transaction_id || data.transactionId,
      status: data.status || data.payment_status,
      amount: parseInt(data.amount) || 0,
      bankCode: data.bank_code || null,
      payDate: data.pay_date || data.payDate || new Date().toISOString(),
      rawData: data
    };
  }

  /**
   * Xử lý return URL từ SePay
   * SePay redirect về return_url với query params
   */
  processReturnUrl(params) {
    // Verify signature nếu có
    if (params.signature && !this.verifySignature(params)) {
      throw { status: 400, message: 'Invalid SePay signature' };
    }

    const orderInfo = this.extractOrderInfo(params);
    
    return {
      success: orderInfo.status === 'success' || orderInfo.status === 'paid',
      orderInfo: orderInfo
    };
  }
}

module.exports = SePay;

