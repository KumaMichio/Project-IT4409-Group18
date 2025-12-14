# ✅ Tóm tắt Setup SePay Webhook - Option A (API Key)

## Đã hoàn thành

### 1. ✅ Script tạo API Key
- **File**: `backend/scripts/generate-sepay-api-key.js`
- **Cách dùng**: `node scripts/generate-sepay-api-key.js`
- Tạo API Key ngẫu nhiên 64 ký tự (an toàn)

### 2. ✅ Middleware xác thực API Key
- **File**: `backend/src/middlewares/sepayWebhook.middleware.js`
- Verify header `Authorization: APIkey_YOUR_KEY`
- Trả về 401 nếu không hợp lệ

### 3. ✅ Webhook Handler
- **Controller**: `backend/src/controllers/payment.controller.js`
  - Function: `sepayWebhook()`
- **Service**: `backend/src/services/payment.service.js`
  - Function: `processSePayWebhook()`
- Xử lý webhook data, update order, tạo enrollment

### 4. ✅ Routes
- **File**: `backend/src/routes/payment.routes.js`
- **Endpoint**: `POST /api/payments/sepay-webhook`
- Có middleware verify API Key

### 5. ✅ Documentation
- `SEPAY_WEBHOOK_SETUP.md` - Hướng dẫn chi tiết
- `NGROK_SETUP.md` - Hướng dẫn setup ngrok
- `QUICK_START_NGROK.md` - Quick start guide

## Các bước tiếp theo

### Bước 1: Tạo API Key và thêm vào .env

```bash
cd backend
node scripts/generate-sepay-api-key.js
```

Copy API Key và thêm vào `.env`:
```env
SEPAY_WEBHOOK_API_KEY=your_generated_key_here
```

### Bước 2: Cấu hình trên SePay Dashboard

1. Đăng nhập SePay Dashboard
2. Vào **Webhooks** → **Thêm Webhook**
3. Điền:
   - **URL**: `https://your-ngrok-url.ngrok-free.app/api/payments/sepay-webhook`
   - **Kiểu chứng thực**: **API Key**
   - **API Key**: Nhập key từ `.env` (không có prefix `APIkey_`)
4. **Lưu**

### Bước 3: Test

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start ngrok
ngrok http 5000

# Terminal 3: Test webhook
curl -X POST http://localhost:5000/api/payments/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: APIkey_YOUR_KEY" \
  -d '{"order_id": "TEST123", "status": "success"}'
```

## File đã tạo/cập nhật

### Mới tạo:
- ✅ `backend/scripts/generate-sepay-api-key.js`
- ✅ `backend/src/middlewares/sepayWebhook.middleware.js`
- ✅ `backend/SEPAY_WEBHOOK_SETUP.md`
- ✅ `backend/SEPAY_SETUP_SUMMARY.md`

### Đã cập nhật:
- ✅ `backend/src/controllers/payment.controller.js` - Thêm `sepayWebhook()`
- ✅ `backend/src/services/payment.service.js` - Thêm `processSePayWebhook()`
- ✅ `backend/src/routes/payment.routes.js` - Thêm webhook route
- ✅ `backend/package.json` - Thêm `axios`, `qs` dependencies

## API Endpoint

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

## Lưu ý quan trọng

1. ⚠️ **API Key phải bí mật** - Không commit lên git
2. ⚠️ **Format header**: `APIkey_YOUR_KEY` (có prefix `APIkey_`)
3. ⚠️ **Webhook URL phải public** - Dùng ngrok khi local
4. ⚠️ **Giữ ngrok chạy liên tục** khi test

## Xem chi tiết

- Hướng dẫn setup webhook: `SEPAY_WEBHOOK_SETUP.md`
- Hướng dẫn setup ngrok: `NGROK_SETUP.md`
- Quick start: `QUICK_START_NGROK.md`

