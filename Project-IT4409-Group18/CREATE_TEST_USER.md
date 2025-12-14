# Hướng dẫn tạo User Test và đăng ký khóa học

## 📋 Thông tin User Test

- **Email:** `testuser@example.com`
- **Password:** `password123`
- **Role:** STUDENT

## 🚀 Cách 1: Chạy SQL Script (Khuyến nghị)

```bash
# Nếu dùng psql trực tiếp
psql -U your_user -d online_course -f create-test-user.sql

# Nếu dùng Docker
docker exec -i postgres_container psql -U your_user -d online_course < create-test-user.sql
```

## 🚀 Cách 2: Chạy Node.js Script

```bash
cd backend
node src/scripts/quick-create-test-user.js
```

hoặc

```bash
cd backend
node src/scripts/create-test-user-with-courses.js
```

## ⚠️ Lưu ý về Password Hash

Nếu không đăng nhập được, có thể do password hash không đúng. Để tạo hash mới:

```bash
cd backend
node -e "const bc=require('bcryptjs');bc.hash('password123',10).then(h=>console.log('Hash:',h))"
```

Sau đó cập nhật hash trong database:

```sql
UPDATE users 
SET password_hash = 'HASH_MỚI_Ở_ĐÂY'
WHERE email = 'testuser@example.com';
```

## ✅ Sau khi chạy script

1. **Đăng nhập:**
   - Email: `testuser@example.com`
   - Password: `password123`

2. **Kiểm tra khóa học:**
   - Vào `/my-courses` để xem các khóa học đã đăng ký
   - Vào `/courses/[courseId]` để xem chi tiết

3. **Test các tính năng:**
   - Xem profile tại `/profile`
   - Đánh giá khóa học
   - Học bài trong khóa học

## 🔍 Kiểm tra nếu có lỗi

```sql
-- Kiểm tra user
SELECT id, email, full_name, role FROM users WHERE email = 'testuser@example.com';

-- Kiểm tra enrollments
SELECT 
    c.title,
    e.status,
    e.enrolled_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN users u ON u.id = e.student_id
WHERE u.email = 'testuser@example.com';
```

## 📝 Files đã tạo

1. `create-test-user.sql` - SQL script
2. `backend/src/scripts/quick-create-test-user.js` - Node.js script đơn giản
3. `backend/src/scripts/create-test-user-with-courses.js` - Node.js script đầy đủ

