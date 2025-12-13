# 📚 Hướng dẫn chạy dự án Chat (UC13, UC14)

## 🎯 Tổng quan

Dự án bao gồm:
- **Backend**: Node.js + Express + Socket.IO (Port 4000)
- **Frontend**: Next.js + TypeScript (Port 3000)
- **Database**: PostgreSQL

## ⚡ Cách nhanh nhất (Tự động)

```bash
# Chạy script tự động
./start.sh
```

Script sẽ tự động:
- ✅ Khởi động PostgreSQL (Docker)
- ✅ Tạo database và schema
- ✅ Setup backend (.env, dependencies)
- ✅ Setup frontend (.env.local, dependencies)
- ✅ Seed admin user

Sau đó chạy thủ công 2 terminal:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📋 Cách thủ công (Chi tiết)

### Bước 1: Setup Database

#### Option A: Dùng Docker (Khuyến nghị)

```bash
# Khởi động PostgreSQL
docker-compose up -d postgres

# Đợi 5 giây để database khởi động
sleep 5

# Tạo database và schema
docker exec -i ocp-postgres psql -U online_course -d postgres -c "CREATE DATABASE online_course;" 2>/dev/null || true
docker exec -i ocp-postgres psql -U online_course -d online_course < database.sql
```

#### Option B: PostgreSQL local

```bash
# Tạo database
createdb online_course

# Chạy schema
psql -d online_course -f database.sql
```

### Bước 2: Setup Backend

```bash
cd backend

# 1. Tạo file .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# 2. Cài đặt dependencies
npm install

# 3. Seed admin user
npm run db:seed-admin

# 4. Chạy backend
npm run dev
```

Backend sẽ chạy tại: **http://localhost:4000**

### Bước 3: Setup Frontend

```bash
# Mở terminal mới
cd frontend

# 1. Tạo file .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
EOF

# 2. Cài đặt dependencies
npm install

# 3. Chạy frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🧪 Test chức năng

### 1. Đăng nhập

Truy cập: http://localhost:3000/auth/login

**Tài khoản mặc định (sau khi seed admin):**
- Email: `admin@example.com`
- Password: `admin123`

Hoặc đăng ký tài khoản mới:
- http://localhost:3000/auth/register

### 2. Test UC13 - Course Channel Chat

**Yêu cầu:**
- User phải đã enroll vào course
- Hoặc user là instructor của course

**Cách test:**
1. Đăng nhập với tài khoản đã enroll
2. Truy cập: `http://localhost:3000/chat/1` (thay 1 bằng courseId thực tế)
3. Gửi tin nhắn
4. Mở tab khác với user khác để test real-time

### 3. Test UC14 - Direct Message

**Yêu cầu:**
- Đăng nhập với role **INSTRUCTOR** (teacher)
- Có studentId để chat

**Cách test:**
1. Đăng nhập với tài khoản instructor
2. Truy cập: `http://localhost:3000/chat/instructor/2` (thay 2 bằng studentId)
3. Gửi tin nhắn
4. Mở tab khác với tài khoản student để test real-time

## 🔑 Tạo tài khoản test

### Tạo qua API (curl)

```bash
# Tạo học viên
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Học viên Test",
    "email": "student@test.com",
    "password": "123456",
    "role": "student"
  }'

# Tạo giảng viên
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Giảng viên Test",
    "email": "instructor@test.com",
    "password": "123456",
    "role": "teacher"
  }'
```

### Tạo qua Frontend

1. Truy cập: http://localhost:3000/auth/register
2. Điền form và chọn role

## 🐛 Troubleshooting

### ❌ Lỗi: "DATABASE_URL is not set"

**Giải pháp:**
```bash
cd backend
# Kiểm tra file .env tồn tại
ls -la .env

# Nếu chưa có, tạo lại
cat > .env << 'EOF'
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
```

### ❌ Lỗi: "connection refused" (Database)

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres

# Nếu không chạy, khởi động lại
docker-compose up -d postgres

# Hoặc nếu dùng PostgreSQL local
pg_isready
```

### ❌ Lỗi: "Socket.IO connection failed"

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_SOCKET_URL` trong `frontend/.env.local`
2. Kiểm tra backend đang chạy trên port 4000
3. Kiểm tra CORS trong `backend/src/app.js`

### ❌ Lỗi: "Bạn cần đăng ký khóa học"

**Giải pháp:**
- User phải enroll vào course trước
- Hoặc user phải là instructor của course đó
- Kiểm tra trong database: `SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?`

### ❌ Lỗi: "Authentication required"

**Giải pháp:**
1. Đảm bảo đã đăng nhập
2. Kiểm tra token trong localStorage (F12 → Application → Local Storage)
3. Kiểm tra JWT_SECRET trong backend `.env`

## 📊 Kiểm tra Database

```bash
# Kết nối database
docker exec -it ocp-postgres psql -U online_course -d online_course

# Hoặc nếu dùng PostgreSQL local
psql -U online_course -d online_course
```

**Các lệnh hữu ích:**
```sql
-- Xem danh sách users
SELECT id, email, full_name, role FROM users;

-- Xem danh sách courses
SELECT id, title, instructor_id FROM courses;

-- Xem enrollments
SELECT * FROM enrollments;

-- Xem messages trong channel
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Xem DM messages
SELECT * FROM dm_messages ORDER BY created_at DESC LIMIT 10;
```

## 🔌 Kiểm tra Socket.IO

**Backend logs:**
```
[Channel] User 1 connected
[Channel] User 1 joined course:1
[DM] User 2 connected
[DM] User 2 joined thread:1
```

**Frontend console:**
- Mở DevTools (F12) → Console
- Kiểm tra logs: "Joined course channel", "Joined DM thread"

## 📝 Cấu trúc thư mục

```
Project-IT4409-Group18/
├── backend/
│   ├── src/
│   │   ├── controllers/chat.controller.js    # HTTP handlers
│   │   ├── services/chat.service.js          # Business logic
│   │   ├── repositories/chat.repository.js  # Database queries
│   │   ├── routes/chat.routes.js            # Routes
│   │   ├── sockets/chat.socket.js           # Socket.IO handlers
│   │   └── server.js                         # Server với Socket.IO
│   └── .env                                  # Backend config
│
├── frontend/
│   ├── src/
│   │   ├── app/chat/
│   │   │   ├── [courseId]/page.tsx          # UC13 - Course chat
│   │   │   └── instructor/[studentId]/page.tsx  # UC14 - DM
│   │   ├── components/chat/
│   │   │   ├── ChatWindow.tsx                # Chat UI
│   │   │   └── MessageItem.tsx              # Message component
│   │   ├── hooks/useChat.ts                 # React hooks
│   │   └── lib/socketClient.ts              # Socket.IO client
│   └── .env.local                            # Frontend config
│
└── database.sql                              # Database schema
```

## ✅ Checklist trước khi chạy

- [ ] Node.js >= 18.x đã cài đặt
- [ ] PostgreSQL đang chạy (Docker hoặc local)
- [ ] Database `online_course` đã được tạo
- [ ] File `backend/.env` đã được tạo
- [ ] File `frontend/.env.local` đã được tạo
- [ ] Dependencies đã được cài đặt (`npm install` ở cả 2 thư mục)
- [ ] Admin user đã được seed

## 🎉 Hoàn thành!

Sau khi setup xong, bạn có thể:
- ✅ Chat trong course channels (UC13)
- ✅ Chat 1-1 giữa instructor và student (UC14)
- ✅ Real-time messaging với Socket.IO
- ✅ Edit/Delete messages
- ✅ Mark messages as read

**Xem thêm:**
- [CHAT_SETUP.md](./CHAT_SETUP.md) - Chi tiết kỹ thuật
- [QUICK_START.md](./docs/QUICK_START.md) - Quick start guide

