# SePay Configuration - Hướng dẫn đầy đủ

## Tổng quan

SePay có **2 loại credentials khác nhau**:

1. **Webhook API Key** - Dùng để verify webhook requests
2. **QR Code Config** - Dùng để tạo QR code thanh toán

**Lưu ý:** Code hiện tại **KHÔNG sử dụng SePay API** để tạo payment link. Chỉ dùng QR code từ config.

---

## 1. Webhook API Key (Bắt buộc)

### Mục đích:
- Xác thực webhook requests từ SePay
- Đảm bảo webhook đến từ SePay hợp lệ

### Cách lấy:
1. Đăng nhập SePay Dashboard
2. Vào **Webhooks** → **Cấu hình chứng thực**
3. Chọn **Kiểu chứng thực**: **API Key**
4. Copy **API Key** được hiển thị

### Cấu hình .env:
```env
SEPAY_WEBHOOK_API_KEY=c7a71f553ab3828bf997473b0bc2cbe8c0aade8a0aa6de75eb0fc9b825467095
```

### Format SePay gửi:
```
Authorization: "Apikey YOUR_API_KEY"
```
(Có khoảng trắng, chữ thường "Apikey")

### Code xử lý:
- File: `backend/src/middlewares/sepayWebhook.middleware.js`
- Tự động normalize format và verify

---

## 2. QR Code Configuration (Bắt buộc)

### Mục đích:
- Tạo QR code URL để user quét thanh toán
- Không cần gọi SePay API

### Cách lấy:
1. Đăng nhập SePay Dashboard
2. Vào **Tài khoản** hoặc **Thông tin tài khoản**
3. Copy:
   - **Số tài khoản** (ví dụ: `VQRQAFXEL0318`)
   - **Tên ngân hàng** (ví dụ: `MBBank`)

### Cấu hình .env:
```env
SEPAY_QR_ACCOUNT=VQRQAFXEL0318
SEPAY_QR_BANK=MBBank
```

### QR Code URL Format:
```
https://qr.sepay.vn/img?acc=VQRQAFXEL0318&bank=MBBank&amount=290000&des=ORD-20251214-269
```

### Code xử lý:
- File: `backend/src/utils/payment.sepay.js`
- Method: `createQRCodeUrl()`
- Tự động tạo từ config, không cần API

---

## 3. SePay API Credentials (KHÔNG CẦN)

### Lưu ý:
- Code hiện tại **KHÔNG sử dụng** SePay API
- Các biến sau **KHÔNG BẮT BUỘC**:
  - `SEPAY_TOKEN` - Không cần
  - `SEPAY_SECRET_KEY` - Không cần

### Nếu muốn dùng SePay API trong tương lai:
```env
SEPAY_TOKEN=your_token_here
SEPAY_SECRET_KEY=your_secret_key_here
```

---

## 4. URLs Configuration

### Return URL:
```env
SEPAY_RETURN_URL=https://your-ngrok-url.ngrok-free.app/api/payments/sepay-return
```
SePay redirect về đây sau khi thanh toán (nếu có)

### Webhook URL:
```env
SEPAY_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/sepay-webhook
```
SePay gửi webhook đến đây khi có payment update

---

## Tóm tắt .env cần thiết

### Bắt buộc:
```env
# Webhook Authentication
SEPAY_WEBHOOK_API_KEY=c7a71f553ab3828bf997473b0bc2cbe8c0aade8a0aa6de75eb0fc9b825467095

# QR Code Configuration
SEPAY_QR_ACCOUNT=VQRQAFXEL0318
SEPAY_QR_BANK=MBBank

# URLs (tự động update bởi ngrok script)
SEPAY_RETURN_URL=https://your-ngrok-url/api/payments/sepay-return
SEPAY_WEBHOOK_URL=https://your-ngrok-url/api/payments/sepay-webhook
```

### Không bắt buộc (cho SePay API - hiện không dùng):
```env
# SEPAY_TOKEN= (không cần)
# SEPAY_SECRET_KEY= (không cần)
```

---

## Luồng thanh toán

```
1. User chọn SePay → Tạo order
   ↓
2. Backend tạo QR code URL từ config
   (KHÔNG gọi SePay API)
   ↓
3. Frontend hiển thị trang QR code
   ↓
4. User quét QR code → Thanh toán
   ↓
5. SePay gửi webhook (với API Key auth)
   ↓
6. Backend verify API Key → Xử lý payment
   ↓
7. Update order → Tạo enrollment
```

---

## Troubleshooting

### QR code không hiển thị:
- Kiểm tra `SEPAY_QR_ACCOUNT` và `SEPAY_QR_BANK` trong `.env`
- Đảm bảo không có dấu ngoặc kép, không có khoảng trắng thừa

### Webhook bị reject:
- Kiểm tra `SEPAY_WEBHOOK_API_KEY` trong `.env`
- Kiểm tra SePay Dashboard đã cấu hình đúng API Key chưa
- Format: SePay gửi `Apikey KEY` (có khoảng trắng)

### Order không được update:
- Kiểm tra webhook có parse được order number không
- Xem logs để debug parsing logic

---

## File liên quan

- `backend/src/config/payment.js` - SePay config
- `backend/src/utils/payment.sepay.js` - QR code generation
- `backend/src/middlewares/sepayWebhook.middleware.js` - Webhook auth
- `backend/src/services/payment.service.js` - Webhook processing

