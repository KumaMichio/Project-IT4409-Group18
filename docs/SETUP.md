# Hướng dẫn Setup và Chạy Dự án

## Backend Setup

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình Environment Variables
Tạo file `.env` trong thư mục `backend/` với nội dung:
```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-secret-key-here
```

### 3. Khởi động Backend Server
```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:4000`

## Frontend Setup

### 1. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 2. Cấu hình Environment Variables
Tạo file `.env.local` trong thư mục `frontend/` với nội dung:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Khởi động Frontend Server
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Kiểm tra kết nối

1. Backend health check: `http://localhost:4000/` - Nên trả về `{"status":"ok"}`
2. Frontend: `http://localhost:3000` - Nên hiển thị trang home
3. Login page: `http://localhost:3000/auth/login`
4. Register page: `http://localhost:3000/auth/register`

## Lưu ý

- Đảm bảo PostgreSQL database đã được setup và chạy
- Backend phải chạy trước khi frontend có thể kết nối
- Nếu gặp lỗi CORS, kiểm tra cấu hình CORS trong `backend/src/app.js`
- Nếu gặp lỗi database connection, kiểm tra `DATABASE_URL` trong `.env`


