const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getCheckoutInfo,
  createOrder,
  vnpayReturn,
  getOrderDetail,
  getUserOrders,
} = require('../controllers/payment.controller');

// All routes require authentication except webhook/return URLs
router.get('/checkout', authMiddleware, getCheckoutInfo);
router.post('/create-order', authMiddleware, createOrder);
router.get('/vnpay-return', vnpayReturn); // Public - VNPay redirects here
router.get('/orders', authMiddleware, getUserOrders);
router.get('/orders/:orderId', authMiddleware, getOrderDetail);

module.exports = router;

