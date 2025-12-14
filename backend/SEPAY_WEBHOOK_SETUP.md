# Hướng dẫn Setup SePay Webhook với API Key Authentication

## Tổng quan

SePay webhook sử dụng **API Key authentication** để đảm bảo requests đến từ SePay là hợp lệ.

## Bước 1: Tạo API Key

### Chạy script tạo API Key:

```bash
cd backend
node scripts/generate-sepay-api-key.js
```

Script sẽ tạo một API Key ngẫu nhiên an toàn (64 ký tự hex).

**Ví dụ output:**
```
🔑 SePay Webhook API Key đã được tạo:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
d673efdad0e07caa5de705890201140d36cc57bfb204909ba5f6e20dbb7fc85c
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Bước 2: Cấu hình .env

Thêm API Key vào file `.env`:

```env
# SePay Webhook API Key (tạo bằng script generate-sepay-api-key.js)
SEPAY_WEBHOOK_API_KEY=d673efdad0e07caa5de705890201140d36cc57bfb204909ba5f6e20dbb7fc85c
```

⚠️ **Lưu ý:**
- Giữ key này bí mật
- Không commit `.env` lên git
- Chỉ dùng key này cho SePay webhook

## Bước 3: Cấu hình trên SePay Dashboard

1. **Đăng nhập SePay Dashboard**
   - Production: https://sepay.vn/
   - Sandbox: https://my.dev.sepay.vn/

2. **Vào Webhooks**
   - Menu: **Webhooks** → **Thêm Webhook** hoặc **Chỉnh sửa Webhook**

3. **Cấu hình Webhook:**
   - **Gọi đến URL**: `https://your-ngrok-url.ngrok-free.app/api/payments/sepay-webhook`
     - (Hoặc domain production khi deploy)
   - **Kiểu chứng thực**: Chọn **API Key**
   - **API Key**: Nhập key từ `.env` (không có prefix `APIkey_`)
     - Ví dụ: `d673efdad0e07caa5de705890201140d36cc57bfb204909ba5f6e20dbb7fc85c`
   - **Sự kiện**: Chọn các events cần nhận
     - Ví dụ: "Thanh toán thành công", "Có tiền vào", etc.

4. **Lưu cấu hình**

## Bước 4: Kiểm tra Webhook

### Test với Postman/curl:

```bash
curl -X POST http://localhost:5000/api/payments/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: APIkey_d673efdad0e07caa5de705890201140d36cc57bfb204909ba5f6e20dbb7fc85c" \
  -d '{
    "order_id": "ORDER123",
    "status": "success",
    "transaction_id": "TXN123",
    "amount": 100000
  }'
```

### Test với SePay Sandbox:

1. Tạo test transaction trên SePay
2. Xem logs trong backend console
3. Kiểm tra ngrok inspector: http://127.0.0.1:4040

## Cách hoạt động

### Request từ SePay:

```
POST /api/payments/sepay-webhook
Headers:
  Authorization: APIkey_YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "order_id": "ORDER123",
    "status": "success",
    "transaction_id": "TXN123",
    "amount": 100000,
    ...
  }
```

### Backend xử lý:

1. **Middleware verify API Key** (`sepayWebhook.middleware.js`)
   - Kiểm tra header `Authorization`
   - So sánh với `APIkey_${SEPAY_WEBHOOK_API_KEY}`
   - Nếu không hợp lệ → trả về 401

2. **Controller xử lý webhook** (`payment.controller.js`)
   - Nhận webhook data
   - Gọi service để xử lý

3. **Service xử lý payment** (`payment.service.js`)
   - Tìm order theo `order_id`
   - Update payment status
   - Tạo enrollment nếu payment thành công
   - Trả về 200 OK

## Troubleshooting

### Webhook bị reject với 401 Unauthorized

**Nguyên nhân:**
- API Key không khớp
- Header `Authorization` không đúng format

**Giải pháp:**
1. Kiểm tra `.env` có `SEPAY_WEBHOOK_API_KEY` không
2. Kiểm tra SePay Dashboard đã cấu hình đúng API Key chưa
3. Kiểm tra format header: `APIkey_YOUR_KEY` (có prefix `APIkey_`)

### Webhook không được gọi

**Nguyên nhân:**
- URL webhook không đúng
- Ngrok không chạy
- Backend không chạy

**Giải pháp:**
1. Kiểm tra ngrok đang chạy: `ngrok http 5000`
2. Kiểm tra backend đang chạy: `npm run dev`
3. Kiểm tra URL trên SePay Dashboard
4. Xem ngrok inspector: http://127.0.0.1:4040

### Order không được update

**Nguyên nhân:**
- `order_id` trong webhook không khớp với `order_number` trong database
- Webhook data format không đúng

**Giải pháp:**
1. Kiểm tra logs trong backend console
2. Kiểm tra format webhook data từ SePay
3. Điều chỉnh code trong `processSePayWebhook()` nếu cần

## Security Best Practices

1. ✅ **Luôn verify API Key** - Không bỏ qua bước này
2. ✅ **Giữ API Key bí mật** - Không commit lên git
3. ✅ **Dùng HTTPS** - Khi deploy production
4. ✅ **Log webhook requests** - Để debug và audit
5. ✅ **Idempotency** - Xử lý duplicate webhooks

## File Structure

```
backend/
├── src/
│   ├── middlewares/
│   │   └── sepayWebhook.middleware.js  # Verify API Key
│   ├── controllers/
│   │   └── payment.controller.js         # Webhook handler
│   ├── services/
│   │   └── payment.service.js            # Process webhook
│   └── routes/
│       └── payment.routes.js             # Webhook route
├── scripts/
│   └── generate-sepay-api-key.js        # Generate API Key
└── .env                                  # API Key config
```

## API Endpoint

**POST** `/api/payments/sepay-webhook`

- **Authentication**: API Key (via header)
- **Content-Type**: `application/json`
- **Response**: `200 OK` với `{ status: 'success' }`

## Next Steps

Sau khi setup webhook thành công:
1. ✅ Test với SePay sandbox
2. ✅ Verify order được update đúng
3. ✅ Verify enrollment được tạo
4. ✅ Deploy lên production
5. ✅ Cấu hình webhook URL production trên SePay Dashboard

