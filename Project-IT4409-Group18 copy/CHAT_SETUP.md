# Hướng dẫn chạy dự án Chat (UC13, UC14)

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x (hoặc sử dụng Docker)
- npm hoặc yarn

## 🚀 Các bước setup

### 1. Setup Database (PostgreSQL)

#### Cách 1: Sử dụng Docker (Khuyến nghị)

```bash
# Chạy PostgreSQL container
docker-compose up -d postgres

# Kiểm tra container đang chạy
docker ps
```

#### Cách 2: Cài đặt PostgreSQL trực tiếp

1. Cài đặt PostgreSQL trên máy
2. Tạo database:
```sql
CREATE DATABASE online_course;
```

### 2. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cat > .env << EOF
# Database
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (cho CORS và Socket.IO)
FRONTEND_URL=http://localhost:3000
EOF

# Chạy database migration (tạo tables)
# Nếu chưa có script migrate, chạy SQL trực tiếp:
psql -U online_course -d online_course -f ../database.sql

# Hoặc nếu có script migrate:
# npm run db:migrate

# Seed admin user (tùy chọn)
npm run db:seed-admin

# Chạy backend ở chế độ development
npm run dev
```

Backend sẽ chạy tại: `http://localhost:4000`

### 3. Setup Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local
cat > .env.local << EOF
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Socket.IO URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
EOF

# Chạy frontend ở chế độ development
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🧪 Test chức năng Chat

### UC13 - Course Channel Chat

1. **Đăng nhập** với tài khoản đã đăng ký khóa học
2. Truy cập: `http://localhost:3000/chat/[courseId]`
   - Thay `[courseId]` bằng ID khóa học thực tế
   - Ví dụ: `http://localhost:3000/chat/1`
3. Gửi tin nhắn trong channel
4. Test real-time: Mở 2 tab trình duyệt với 2 tài khoản khác nhau

### UC14 - Direct Message (Instructor-Student)

1. **Đăng nhập** với tài khoản **INSTRUCTOR**
2. Truy cập: `http://localhost:3000/chat/instructor/[studentId]`
   - Thay `[studentId]` bằng ID học viên
   - Ví dụ: `http://localhost:3000/chat/instructor/2`
3. Gửi tin nhắn DM
4. Test real-time: Mở tab khác với tài khoản học viên

## 📝 Tạo tài khoản test

### Tạo Admin (qua script)

```bash
cd backend
npm run db:seed-admin
```

### Tạo user thông thường (qua API)

```bash
# Đăng ký học viên
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Học viên Test",
    "email": "student@test.com",
    "password": "123456",
    "role": "student"
  }'

# Đăng ký giảng viên
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Giảng viên Test",
    "email": "instructor@test.com",
    "password": "123456",
    "role": "teacher"
  }'
```

## 🔧 Troubleshooting

### Lỗi kết nối database

```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres

# Hoặc
psql -U online_course -d online_course -c "SELECT 1;"

# Kiểm tra DATABASE_URL trong .env
```

### Lỗi Socket.IO connection

1. Kiểm tra `NEXT_PUBLIC_SOCKET_URL` trong `.env.local`
2. Kiểm tra CORS settings trong `backend/src/app.js`
3. Kiểm tra backend đang chạy trên port 4000

### Lỗi "Authentication required"

1. Đảm bảo đã đăng nhập
2. Kiểm tra token trong localStorage
3. Kiểm tra JWT_SECRET trong backend `.env`

### Lỗi "Bạn cần đăng ký khóa học"

- Đảm bảo user đã enroll vào course
- Hoặc user là instructor của course đó

## 📚 API Endpoints

### Course Channel (UC13)

- `GET /api/chat/course/:courseId/channel` - Lấy thông tin channel
- `GET /api/chat/course/:courseId/messages` - Lấy danh sách messages
- `POST /api/chat/course/:courseId/messages` - Gửi message
- `PUT /api/chat/messages/:messageId` - Sửa message
- `DELETE /api/chat/messages/:messageId` - Xóa message

### Direct Messages (UC14)

- `GET /api/chat/dm/threads` - Lấy danh sách DM threads
- `GET /api/chat/dm/unread-count` - Lấy số tin nhắn chưa đọc
- `GET /api/chat/dm/:studentId/:instructorId` - Lấy thread
- `GET /api/chat/dm/:studentId/:instructorId/messages` - Lấy messages
- `POST /api/chat/dm/:studentId/:instructorId/messages` - Gửi message
- `GET /api/chat/users/:userId` - Lấy thông tin user (cho chat context)

## 🔌 Socket.IO Events

### Course Channel Namespace: `/chat/channel`

**Client → Server:**
- `join:course` - Join vào course channel
- `leave:course` - Rời khỏi channel
- `message:send` - Gửi message
- `message:edit` - Sửa message
- `message:delete` - Xóa message

**Server → Client:**
- `joined:course` - Đã join thành công
- `message:new` - Có message mới
- `message:updated` - Message đã được update
- `message:deleted` - Message đã bị xóa
- `error` - Lỗi

### DM Namespace: `/chat/dm`

**Client → Server:**
- `join:thread` - Join vào DM thread
- `leave:thread` - Rời khỏi thread
- `message:send` - Gửi message
- `messages:read` - Đánh dấu đã đọc

**Server → Client:**
- `joined:thread` - Đã join thành công
- `message:new` - Có message mới
- `messages:read` - Messages đã được đánh dấu đọc
- `error` - Lỗi

## 🎯 Next Steps

1. Tạo khóa học và enroll học viên để test UC13
2. Test real-time messaging với nhiều users
3. Test edit/delete messages
4. Test DM giữa instructor và student
5. Kiểm tra unread message count

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
- Console logs của backend và frontend
- Network tab trong browser DevTools
- Database logs

