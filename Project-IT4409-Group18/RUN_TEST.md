# Hướng dẫn chạy thử dự án sau khi merge

## 📋 Checklist trước khi chạy

### 1. Kiểm tra Database
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres
# hoặc
pg_isready
```

### 2. Kiểm tra file cấu hình

#### Backend (.env)
```bash
cd backend
cat .env
```

Cần có các biến:
- `DB_USER`
- `DB_HOST`
- `DB_DATABASE`
- `DB_PASSWORD`
- `DB_PORT`
- `PORT` (mặc định 4000)
- `JWT_SECRET`
- `FRONTEND_URL`

#### Frontend (.env.local)
```bash
cd frontend
cat .env.local
```

Cần có:
- `NEXT_PUBLIC_API_URL=http://localhost:4000`

---

## 🚀 Cách chạy

### Terminal 1: Backend Server
```bash
cd /Users/duc/Desktop/Project-IT4409-Group18/Project-IT4409-Group18/backend
npm install  # Nếu chưa cài
npm run dev  # hoặc npm start
```

**Kết quả mong đợi:**
```
🔄 Checking database connection...
✅ Database connected successfully!
🚀 Server is running on port 4000
✅ Server is ready to accept requests!
```

### Terminal 2: Frontend Server
```bash
cd /Users/duc/Desktop/Project-IT4409-Group18/Project-IT4409-Group18/frontend
npm install  # Nếu chưa cài
npm run dev
```

**Kết quả mong đợi:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
```

---

## ✅ Test các tính năng đã merge

### 1. Test Registration/Login
1. Mở http://localhost:3000/auth/register
2. Đăng ký tài khoản mới
3. Kiểm tra không có lỗi 404
4. Đăng nhập tại http://localhost:3000/auth/login

### 2. Test Profile (Tính năng mới)
1. Đăng nhập
2. Truy cập http://localhost:3000/profile
3. Click "Chỉnh sửa"
4. Cập nhật thông tin và upload avatar
5. Kiểm tra lưu thành công

### 3. Test My Courses
1. Truy cập http://localhost:3000/my-courses
2. Kiểm tra không có lỗi "Không thể tải danh sách"
3. Nếu chưa có khóa học, sẽ hiển thị "Chưa có khóa học nào"

### 4. Test Review (Tính năng mới)
1. Vào một khóa học đã đăng ký
2. Tìm phần đánh giá
3. Thử submit review
4. Kiểm tra review được lưu

### 5. Test API Endpoints
```bash
# Test health check
curl http://localhost:4000/api/health

# Test profile API (cần token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/profile/me

# Test reviews API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/reviews/courses/1/my-review
```

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: Database connection failed
```bash
# Kiểm tra PostgreSQL
docker ps
# Hoặc khởi động PostgreSQL
docker-compose up -d postgres
```

### Lỗi: Port already in use
```bash
# Tìm process đang dùng port
lsof -i:4000
lsof -i:3000

# Kill process
kill -9 <PID>
```

### Lỗi: Module not found
```bash
# Cài lại dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Lỗi: 404 Not Found
- Kiểm tra `.env.local` có `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Kiểm tra backend đang chạy trên port 4000
- Kiểm tra tất cả endpoints có prefix `/api`

---

## 📝 Logs để kiểm tra

### Backend logs
- ✅ Database connected
- ✅ Server is running on port 4000
- ⚠️  Warning messages (nếu có)

### Frontend logs (Browser Console)
- Kiểm tra Network tab xem API calls
- Kiểm tra không có 404 errors
- Kiểm tra không có CORS errors

---

## 🎯 Quick Test Commands

```bash
# Test backend health
curl http://localhost:4000/api/health

# Test database connection (từ backend)
cd backend
node -e "require('./src/config/db').testConnection().then(r => console.log(r ? 'OK' : 'FAIL'))"
```

---

## ✨ Tính năng mới đã merge

1. ✅ **Profile Management**
   - Xem/chỉnh sửa profile
   - Upload avatar
   - Thông tin role-specific (instructor/student)

2. ✅ **Review System**
   - Đánh giá khóa học
   - Xem/chỉnh sửa/xóa review

3. ✅ **Improved Error Handling**
   - Database connection errors
   - Validation errors
   - Better error messages

4. ✅ **API Endpoints Fixed**
   - Tất cả endpoints có prefix `/api`
   - Không còn lỗi 404

---

## 🚨 Nếu có lỗi

1. Kiểm tra logs của cả backend và frontend
2. Kiểm tra browser console
3. Kiểm tra Network tab trong DevTools
4. Xem file backup nếu cần rollback:
   ```bash
   ls -la backend.backup.*
   ls -la frontend.backup.*
   ```

