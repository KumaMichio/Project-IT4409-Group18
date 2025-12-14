require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const useTestMode = process.env.PAYMENT_TEST_MODE === 'true' || (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET);

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'TEST_TMN_CODE',
  hashSecret: process.env.VNPAY_HASH_SECRET || 'TEST_HASH_SECRET',
  url: isProduction 
    ? 'https://www.vnpayment.vn/paymentv2/vpcpay.html'
    : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  // VNPay return URL should point to backend API endpoint
  returnUrl: process.env.VNPAY_RETURN_URL || process.env.BACKEND_URL + '/api/payments/vnpay-return' || 'http://localhost:5000/api/payments/vnpay-return',
};

module.exports = {
  vnpay: vnpayConfig,
  isProduction,
  useTestMode, // Flag to enable test mode when credentials are missing
};

