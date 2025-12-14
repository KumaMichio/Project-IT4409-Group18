# 🚀 Quick Start: Setup Ngrok cho SePay

## Bước 1: Cài đặt Ngrok (Nếu chưa có)

### Download và cài đặt:
1. Truy cập: https://ngrok.com/download
2. Chọn **Windows** → Download
3. Giải nén `ngrok.exe` vào thư mục bất kỳ
4. Thêm vào PATH hoặc dùng đường dẫn đầy đủ

### Đăng ký tài khoản:
1. Đăng ký: https://dashboard.ngrok.com/signup
2. Vào Dashboard → **Your Authtoken** → Copy token
3. Chạy lệnh:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

## Bước 2: Sử dụng Script Tự Động

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Start Ngrok và Auto-Update
```bash
cd backend
npm run ngrok:start
```

Hoặc:
```bash
node scripts/start-ngrok.js
```

Script sẽ tự động:
- ✅ Start ngrok trên port 5000
- ✅ Cập nhật `.env` với ngrok URL
- ✅ Hiển thị URLs cần cấu hình

## Bước 3: Cấu hình SePay Dashboard

1. Copy `SEPAY_WEBHOOK_URL` từ `.env` (sau khi script chạy)
2. Đăng nhập SePay Dashboard
3. Vào **Webhooks** → **Thêm Webhook**
4. Dán URL vào **Gọi đến URL**
5. Chọn events → **Lưu**

## Bước 4: Kiểm tra

- Xem requests: http://127.0.0.1:4040
- Test transaction trên SePay
- Kiểm tra backend logs

## ⚠️ Lưu ý

- **Giữ ngrok chạy liên tục** khi test
- Mỗi lần restart ngrok, chạy lại: `npm run ngrok:update`
- Cập nhật lại URL trên SePay Dashboard nếu URL thay đổi

## 📚 Xem hướng dẫn chi tiết: `NGROK_SETUP.md`

