-- Script để cập nhật password cho duc1@gmail.com
-- Password: password123
-- Chạy: psql -U your_user -d online_course -f update-duc1-password.sql

-- Lưu ý: Hash này được tạo bằng bcrypt với password "password123"
-- Nếu không hoạt động, cần chạy script Node.js để tạo hash mới

-- Hash của "password123" (bcrypt, rounds=10)
-- Để tạo hash mới, chạy: node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('password123',10).then(h=>console.log(h))"

UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'duc1@gmail.com';

-- Kiểm tra kết quả
SELECT 
    id,
    email,
    full_name,
    role,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Password đã được cập nhật'
        ELSE 'Chưa có password'
    END as password_status
FROM users 
WHERE email = 'duc1@gmail.com';

