# Tính năng thanh toán SePay - Tóm tắt

## ✅ Đã hoàn thành

### Backend

#### 1. SePay Utility Class
- **File**: `backend/src/utils/payment.sepay.js`
- **Chức năng**:
  - `createPaymentUrl()` - Gọi SePay API để tạo payment link (async)
  - `createSignature()` - Tạo MD5 signature cho requests
  - `verifySignature()` - Verify signature từ return/webhook
  - `extractOrderInfo()` - Parse order info từ SePay response
  - `processReturnUrl()` - Xử lý return URL callback

#### 2. Payment Config
- **File**: `backend/src/config/payment.js`
- **Cấu hình SePay**:
  - `token` - SePay token
  - `secretKey` - SePay secret key
  - `apiUrl` - SePay API URL (production/sandbox)
  - `returnUrl` - URL redirect sau khi thanh toán
  - `webhookUrl` - URL nhận webhook

#### 3. Payment Service
- **File**: `backend/src/services/payment.service.js`
- **Cập nhật**:
  - `generatePaymentUrl()` - Hỗ trợ SePay (async)
  - `processSePayCallback()` - Xử lý return URL
  - `processSePayWebhook()` - Xử lý webhook (đã có từ trước)

#### 4. Payment Controller
- **File**: `backend/src/controllers/payment.controller.js`
- **Handlers**:
  - `createOrder()` - Cập nhật để await SePay URL
  - `sepayReturn()` - Xử lý redirect từ SePay
  - `sepayWebhook()` - Xử lý webhook (đã có từ trước)

#### 5. Routes
- **File**: `backend/src/routes/payment.routes.js`
- **Endpoints**:
  - `GET /api/payments/sepay-return` - Return URL handler
  - `POST /api/payments/sepay-webhook` - Webhook handler (với API Key auth)

### Frontend

#### 6. Checkout Page
- **File**: `frontend/src/app/payments/checkout/page.tsx`
- **Cập nhật**:
  - Thêm state `selectedPaymentProvider`
  - UI radio buttons để chọn VNPay/SePay
  - Cập nhật `handleCheckout()` để gửi provider đúng

---

## Luồng thanh toán SePay

```
1. User chọn SePay trên checkout page
   ↓
2. Frontend gửi POST /api/payments/create-order
   Body: { paymentProvider: 'SEPAY' }
   ↓
3. Backend tạo order với payment_provider = 'SEPAY'
   ↓
4. Backend gọi SePay API để tạo payment link
   POST https://api.sepay.vn/v1/payment/create
   ↓
5. SePay trả về payment_url
   ↓
6. Backend trả về payment_url cho frontend
   ↓
7. Frontend redirect user đến SePay payment page
   ↓
8. User thanh toán trên SePay
   ↓
9. SePay redirect về /api/payments/sepay-return (GET)
   ↓
10. Backend xử lý return URL:
    - Verify signature (nếu có)
    - Update order status
    - Tạo enrollment
    - Redirect về success page
   ↓
11. SePay gửi webhook đến /api/payments/sepay-webhook (POST)
    - Verify API Key
    - Xử lý payment update
    - Đảm bảo idempotency
```

---

## Cấu hình .env

```env
# SePay Configuration
SEPAY_TOKEN=your_sepay_token
SEPAY_SECRET_KEY=your_sepay_secret_key
SEPAY_RETURN_URL=https://your-ngrok-url.ngrok-free.app/api/payments/sepay-return
SEPAY_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/sepay-webhook
SEPAY_WEBHOOK_API_KEY=your_webhook_api_key

# Backend URL (dùng cho ngrok)
BACKEND_URL=https://your-ngrok-url.ngrok-free.app
```

---

## API Endpoints

### 1. Create Order với SePay
**POST** `/api/payments/create-order`

**Request:**
```json
{
  "paymentProvider": "SEPAY"
}
```

**Response:**
```json
{
  "orderId": 123,
  "orderNumber": "ORDER123",
  "paymentUrl": "https://sepay.vn/payment/...",
  "paymentId": 456,
  "isFree": false
}
```

### 2. SePay Return URL
**GET** `/api/payments/sepay-return`

**Query Params:**
- `order_id` - Order number
- `status` - Payment status (success/failed)
- `transaction_id` - Transaction ID
- `amount` - Amount paid
- `signature` - Signature (nếu có)

**Response:** Redirect đến frontend success/cancel page

### 3. SePay Webhook
**POST** `/api/payments/sepay-webhook`

**Headers:**
```
Authorization: APIkey_YOUR_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "order_id": "ORDER123",
  "status": "success",
  "transaction_id": "TXN123",
  "amount": 100000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Webhook processed successfully"
}
```

---

## Testing

### Test với SePay Sandbox

1. **Cấu hình SePay Dashboard:**
   - Đăng nhập: https://my.dev.sepay.vn/
   - Tạo cửa hàng → Lấy Token và Secret Key
   - Cấu hình webhook URL

2. **Cấu hình .env:**
   ```env
   SEPAY_TOKEN=your_sandbox_token
   SEPAY_SECRET_KEY=your_sandbox_secret
   SEPAY_RETURN_URL=https://your-ngrok-url/api/payments/sepay-return
   SEPAY_WEBHOOK_URL=https://your-ngrok-url/api/payments/sepay-webhook
   ```

3. **Test flow:**
   - Chọn SePay trên checkout
   - Tạo order → Redirect đến SePay
   - Thanh toán test
   - Verify return URL được gọi
   - Verify webhook được gọi
   - Verify order được update
   - Verify enrollment được tạo

### Test với Postman

**Test create payment URL:**
```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentProvider": "SEPAY"}'
```

**Test webhook:**
```bash
curl -X POST http://localhost:5000/api/payments/sepay-webhook \
  -H "Authorization: APIkey_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER123",
    "status": "success",
    "transaction_id": "TXN123",
    "amount": 100000
  }'
```

---

## Lưu ý quan trọng

1. ⚠️ **SePay API là async** - Phải await khi gọi `createPaymentUrl()`
2. ⚠️ **Signature verification** - Verify signature từ return URL và webhook
3. ⚠️ **Idempotency** - Xử lý duplicate webhooks
4. ⚠️ **Test mode** - Nếu SePay API không available, sẽ return test URL
5. ⚠️ **Error handling** - Xử lý lỗi từ SePay API gracefully

---

## So sánh VNPay vs SePay

| Feature | VNPay | SePay |
|---------|-------|-------|
| Payment URL | Synchronous (tạo URL trực tiếp) | Async (gọi API) |
| Signature | HMAC SHA512 | MD5 |
| Return URL | Query params | Query params |
| Webhook | Không có | Có (với API Key auth) |
| Test Mode | Sandbox URL | Test URL fallback |

---

## Next Steps

1. ✅ Test với SePay sandbox
2. ✅ Verify payment flow hoạt động đúng
3. ✅ Test error scenarios
4. ✅ Deploy lên production
5. ✅ Cấu hình production credentials
6. ✅ Monitor webhook calls

---

## File Structure

```
backend/
├── src/
│   ├── utils/
│   │   ├── payment.vnpay.js
│   │   └── payment.sepay.js          # ✅ Mới
│   ├── config/
│   │   └── payment.js                 # ✅ Cập nhật
│   ├── services/
│   │   └── payment.service.js        # ✅ Cập nhật
│   ├── controllers/
│   │   └── payment.controller.js     # ✅ Cập nhật
│   └── routes/
│       └── payment.routes.js         # ✅ Cập nhật

frontend/
└── src/
    └── app/
        └── payments/
            └── checkout/
                └── page.tsx           # ✅ Cập nhật
```

---

## Troubleshooting

### SePay API Error
- Kiểm tra Token và Secret Key đúng chưa
- Kiểm tra API URL (production/sandbox)
- Xem logs trong console

### Payment URL không được tạo
- Kiểm tra SePay API có available không
- Kiểm tra network connection
- Xem error message trong logs

### Return URL không hoạt động
- Kiểm tra return URL đúng trong SePay config
- Kiểm tra ngrok đang chạy
- Xem logs trong backend

### Webhook không được gọi
- Kiểm tra webhook URL trên SePay Dashboard
- Kiểm tra API Key đúng chưa
- Xem ngrok inspector

