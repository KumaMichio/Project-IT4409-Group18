# Hướng dẫn Setup Ngrok cho SePay Webhook

## Bước 1: Cài đặt Ngrok

### Option 1: Download trực tiếp (Khuyến nghị)
1. Truy cập: https://ngrok.com/download
2. Chọn **Windows**
3. Giải nén file `ngrok.exe` vào thư mục (ví dụ: `C:\ngrok\`)
4. Thêm vào PATH hoặc dùng đường dẫn đầy đủ

### Option 2: Dùng npm (Global)
```bash
npm install -g ngrok
```

## Bước 2: Đăng ký và Authenticate

1. Đăng ký tài khoản: https://dashboard.ngrok.com/signup
2. Vào Dashboard → **Your Authtoken**
3. Copy authtoken
4. Chạy lệnh:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## Bước 3: Sử dụng Script Tự Động

### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start ngrok và auto-update .env
node scripts/start-ngrok.js
```

Script sẽ:
- ✅ Start ngrok trên port 5000
- ✅ Tự động cập nhật `.env` với ngrok URL
- ✅ Hiển thị URLs cần cấu hình trên SePay

### Cách 2: Manual

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start ngrok
ngrok http 5000

# Terminal 3: Update .env (sau khi ngrok start)
node scripts/update-ngrok-url.js
```

## Bước 4: Cấu hình SePay Dashboard

1. Đăng nhập SePay: https://sepay.vn/ hoặc https://my.dev.sepay.vn/
2. Vào **Webhooks** → **Thêm Webhook**
3. Điền thông tin:
   - **Gọi đến URL**: Copy từ `SEPAY_WEBHOOK_URL` trong `.env`
   - **Kiểu chứng thực**: Signature/API Key
   - **Sự kiện**: Chọn events cần nhận
4. **Lưu**

## Bước 5: Kiểm tra

### Xem ngrok requests:
- Mở: http://127.0.0.1:4040
- Tab **Inspect** để xem tất cả requests

### Test webhook:
1. Tạo test transaction trên SePay
2. Xem request trong ngrok inspector
3. Kiểm tra backend logs

## Lưu ý Quan Trọng

⚠️ **URL thay đổi mỗi lần restart ngrok** (free plan)
- Mỗi lần restart ngrok, cần:
  1. Chạy lại: `node scripts/update-ngrok-url.js`
  2. Cập nhật lại URL trên SePay Dashboard

💡 **Giữ ngrok chạy liên tục**
- Không tắt terminal ngrok khi đang test
- Nếu tắt máy, restart và cập nhật lại

## Troubleshooting

### Ngrok không chạy
```bash
# Kiểm tra ngrok đã cài đặt
ngrok version

# Kiểm tra backend đang chạy trên port 5000
netstat -ano | findstr :5000
```

### Webhook không nhận được
1. Kiểm tra ngrok URL đúng trong SePay dashboard
2. Kiểm tra route `/api/payments/sepay-webhook` đã được tạo
3. Xem ngrok inspector: http://127.0.0.1:4040
4. Kiểm tra backend logs

### Script không tìm thấy ngrok URL
- Đảm bảo ngrok đã start và chạy ít nhất 3 giây
- Kiểm tra ngrok API: http://127.0.0.1:4040/api/tunnels

