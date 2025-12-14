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

// SePay Configuration
const sepayConfig = {
  token: process.env.SEPAY_TOKEN || '',
  secretKey: process.env.SEPAY_SECRET_KEY || '',
  apiUrl: isProduction 
    ? 'https://api.sepay.vn'
    : 'https://api.sepay.vn', // Dùng production API (sandbox có thể không có)
  returnUrl: process.env.SEPAY_RETURN_URL || (process.env.BACKEND_URL ? process.env.BACKEND_URL + '/api/payments/sepay-return' : 'http://localhost:5000/api/payments/sepay-return'),
  webhookUrl: process.env.SEPAY_WEBHOOK_URL || (process.env.BACKEND_URL ? process.env.BACKEND_URL + '/api/payments/sepay-webhook' : 'http://localhost:5000/api/payments/sepay-webhook'),
  // QR Code configuration
  qrCodeAccount: process.env.SEPAY_QR_ACCOUNT || '', // Số tài khoản để tạo QR code (ví dụ: VQRQAFXEL0318)
  qrCodeBank: process.env.SEPAY_QR_BANK || '', // Tên ngân hàng (ví dụ: MBBank)
  qrCodeBaseUrl: 'https://qr.sepay.vn/img', // Base URL cho QR code
};

module.exports = {
  vnpay: vnpayConfig,
  sepay: sepayConfig,
  isProduction,
  useTestMode, // Flag to enable test mode when credentials are missing
};

