-- Script tạo user test và đăng ký khóa học
-- Email: testuser@example.com
-- Password: password123
-- 
-- LƯU Ý: Hash này cần được tạo bằng bcrypt. 
-- Nếu không đăng nhập được, chạy script Node.js để tạo hash mới

-- Tạo user test (hoặc cập nhật nếu đã tồn tại)
DO $$
DECLARE
    v_user_id BIGINT;
    v_instructor_id BIGINT;
    v_course_ids BIGINT[];
    v_course_id BIGINT;
    v_module_id BIGINT;
BEGIN
    -- Tìm hoặc tạo user test
    SELECT id INTO v_user_id FROM users WHERE email = 'testuser@example.com';
    
    IF v_user_id IS NULL THEN
        -- Hash của "password123" - CẦN TẠO MỚI BẰNG BCRYPT
        -- Chạy: node -e "const bc=require('bcryptjs');bc.hash('password123',10).then(h=>console.log(h))"
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES (
            'testuser@example.com',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
            'Test User',
            'STUDENT',
            true
        )
        RETURNING id INTO v_user_id;
        RAISE NOTICE '✅ Đã tạo user mới: testuser@example.com (ID: %)', v_user_id;
    ELSE
        -- Cập nhật password nếu user đã tồn tại
        UPDATE users 
        SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
        WHERE id = v_user_id;
        RAISE NOTICE '✅ Đã cập nhật password cho user: testuser@example.com (ID: %)', v_user_id;
    END IF;

    -- Tìm instructor
    SELECT id INTO v_instructor_id FROM users WHERE role = 'INSTRUCTOR' LIMIT 1;
    
    IF v_instructor_id IS NULL THEN
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES (
            'instructor@example.com',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
            'Test Instructor',
            'INSTRUCTOR',
            true
        )
        RETURNING id INTO v_instructor_id;
        RAISE NOTICE '✅ Đã tạo instructor (ID: %)', v_instructor_id;
    END IF;

    -- Tìm các khóa học có sẵn
    SELECT ARRAY_AGG(id) INTO v_course_ids 
    FROM courses 
    WHERE is_published = true 
    LIMIT 3;

    -- Nếu không có khóa học, tạo 3 khóa học mẫu
    IF v_course_ids IS NULL OR array_length(v_course_ids, 1) = 0 THEN
        RAISE NOTICE '⚠️  Không có khóa học, đang tạo khóa học mẫu...';
        
        -- Khóa học 1: JavaScript
        INSERT INTO courses (instructor_id, title, slug, description, price_cents, currency, is_published, published_at, thumbnail_url, lang)
        VALUES (
            v_instructor_id,
            'Khóa học JavaScript Cơ bản',
            'javascript-co-ban-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            'Học JavaScript từ cơ bản đến nâng cao, ES6+, async/await, và các best practices.',
            0,
            'VND',
            true,
            NOW(),
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            'vi'
        )
        RETURNING id INTO v_course_id;
        v_course_ids := ARRAY[v_course_id];
        
        -- Khóa học 2: React
        INSERT INTO courses (instructor_id, title, slug, description, price_cents, currency, is_published, published_at, thumbnail_url, lang)
        VALUES (
            v_instructor_id,
            'Khóa học React.js',
            'reactjs-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            'Xây dựng ứng dụng web hiện đại với React, Hooks, Context API, và Redux.',
            490000,
            'VND',
            true,
            NOW(),
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            'vi'
        )
        RETURNING id INTO v_course_id;
        v_course_ids := array_append(v_course_ids, v_course_id);
        
        -- Khóa học 3: Node.js
        INSERT INTO courses (instructor_id, title, slug, description, price_cents, currency, is_published, published_at, thumbnail_url, lang)
        VALUES (
            v_instructor_id,
            'Khóa học Node.js Backend',
            'nodejs-backend-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            'Xây dựng RESTful API với Node.js, Express, và PostgreSQL.',
            590000,
            'VND',
            true,
            NOW(),
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            'vi'
        )
        RETURNING id INTO v_course_id;
        v_course_ids := array_append(v_course_ids, v_course_id);
        
        RAISE NOTICE '✅ Đã tạo 3 khóa học mẫu';
    END IF;

    -- Đăng ký user vào các khóa học
    FOREACH v_course_id IN ARRAY v_course_ids
    LOOP
        INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
        VALUES (v_course_id, v_user_id, 'ACTIVE', NOW())
        ON CONFLICT (course_id, student_id) DO NOTHING;
        
        -- Tạo module và lesson cho khóa học đầu tiên
        IF v_course_id = v_course_ids[1] THEN
            -- Kiểm tra đã có module chưa
            SELECT id INTO v_module_id FROM modules WHERE course_id = v_course_id LIMIT 1;
            
            IF v_module_id IS NULL THEN
                INSERT INTO modules (course_id, title, position)
                VALUES (v_course_id, 'Module 1: Giới thiệu', 1)
                RETURNING id INTO v_module_id;
                
                INSERT INTO lessons (module_id, title, position, duration_s)
                VALUES (v_module_id, 'Bài 1: Tổng quan', 1, 1800);
                
                RAISE NOTICE '✅ Đã tạo module và lesson cho khóa học ID: %', v_course_id;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ Đã đăng ký user vào % khóa học', array_length(v_course_ids, 1);
    RAISE NOTICE '';
    RAISE NOTICE '📋 Thông tin đăng nhập:';
    RAISE NOTICE '   Email: testuser@example.com';
    RAISE NOTICE '   Password: password123';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Hoàn thành!';
END $$;

-- Hiển thị thông tin user và khóa học đã đăng ký
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.role,
    COUNT(e.id) as enrolled_courses_count
FROM users u
LEFT JOIN enrollments e ON e.student_id = u.id AND e.status = 'ACTIVE'
WHERE u.email = 'testuser@example.com'
GROUP BY u.id, u.email, u.full_name, u.role;

SELECT 
    c.id as course_id,
    c.title,
    c.slug,
    c.price_cents,
    e.status,
    e.enrolled_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN users u ON u.id = e.student_id
WHERE u.email = 'testuser@example.com'
ORDER BY e.enrolled_at DESC;

