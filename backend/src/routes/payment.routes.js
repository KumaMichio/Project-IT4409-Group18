const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { verifySePayWebhookApiKey } = require('../middlewares/sepayWebhook.middleware');
const {
  getCheckoutInfo,
  createOrder,
  vnpayReturn,
  sepayReturn,
  sepayWebhook,
  getOrderDetail,
  getUserOrders,
} = require('../controllers/payment.controller');

// All routes require authentication except webhook/return URLs
router.get('/checkout', authMiddleware, getCheckoutInfo);
router.post('/create-order', authMiddleware, createOrder);
router.get('/vnpay-return', vnpayReturn); // Public - VNPay redirects here
router.get('/sepay-return', sepayReturn); // Public - SePay redirects here
router.post('/sepay-webhook', express.json(), verifySePayWebhookApiKey, sepayWebhook); // Public - SePay webhook với API Key verification
router.get('/orders', authMiddleware, getUserOrders);
router.get('/orders/:orderId', authMiddleware, getOrderDetail);

module.exports = router;

