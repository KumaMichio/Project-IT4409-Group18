-- Script để insert khóa học cho user duc1@gmail.com
-- Chạy: psql -U your_user -d online_course -f insert_course_for_duc1.sql

-- Kiểm tra và tạo user duc1@gmail.com nếu chưa có (với role STUDENT)
DO $$
DECLARE
    v_user_id BIGINT;
    v_instructor_id BIGINT;
    v_course_id BIGINT;
    v_module_id BIGINT;
BEGIN
    -- Tìm hoặc tạo user duc1@gmail.com
    SELECT id INTO v_user_id FROM users WHERE email = 'duc1@gmail.com';
    
    IF v_user_id IS NULL THEN
        -- Tạo user mới (password: password123 - cần hash thật trong production)
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ('duc1@gmail.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Duc User', 'STUDENT', true)
        RETURNING id INTO v_user_id;
        
        RAISE NOTICE 'Đã tạo user mới: duc1@gmail.com với ID: %', v_user_id;
    ELSE
        RAISE NOTICE 'User duc1@gmail.com đã tồn tại với ID: %', v_user_id;
    END IF;

    -- Tìm một instructor để làm chủ khóa học (hoặc tạo mới nếu chưa có)
    SELECT id INTO v_instructor_id FROM users WHERE role = 'INSTRUCTOR' LIMIT 1;
    
    IF v_instructor_id IS NULL THEN
        -- Tạo instructor mẫu
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ('instructor@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Instructor Test', 'INSTRUCTOR', true)
        RETURNING id INTO v_instructor_id;
        
        RAISE NOTICE 'Đã tạo instructor mới với ID: %', v_instructor_id;
    ELSE
        RAISE NOTICE 'Sử dụng instructor có ID: %', v_instructor_id;
    END IF;

    -- Tạo khóa học mới
    INSERT INTO courses (
        instructor_id, 
        title, 
        slug, 
        description, 
        price_cents, 
        currency,
        is_published, 
        published_at, 
        thumbnail_url,
        lang
    ) VALUES (
        v_instructor_id,
        'Khóa học Lập trình Web Full-stack',
        'lap-trinh-web-fullstack-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        'Khóa học toàn diện về lập trình web full-stack, từ frontend đến backend. Học React, Node.js, PostgreSQL và các công nghệ hiện đại.',
        0, -- Miễn phí
        'VND',
        true,
        NOW(),
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        'vi'
    )
    RETURNING id INTO v_course_id;
    
    RAISE NOTICE 'Đã tạo khóa học mới với ID: %', v_course_id;

    -- Tạo enrollment cho duc1@gmail.com
    INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
    VALUES (v_course_id, v_user_id, 'ACTIVE', NOW())
    ON CONFLICT (course_id, student_id) DO NOTHING;
    
    RAISE NOTICE 'Đã đăng ký user duc1@gmail.com vào khóa học ID: %', v_course_id;

    -- Tạo một module và lesson mẫu
    INSERT INTO modules (course_id, title, position)
    VALUES (v_course_id, 'Module 1: Giới thiệu', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, position, duration_s)
    VALUES (v_module_id, 'Bài 1: Tổng quan về Web Development', 1, 1800);
    
    RAISE NOTICE 'Đã tạo module và lesson mẫu';

    RAISE NOTICE '✅ Hoàn thành! User duc1@gmail.com đã có khóa học với ID: %', v_course_id;
END $$;

-- Hiển thị thông tin khóa học vừa tạo
SELECT 
    c.id as course_id,
    c.title,
    c.slug,
    c.price_cents,
    u.email as student_email,
    u.full_name as student_name,
    e.status as enrollment_status,
    e.enrolled_at
FROM courses c
JOIN enrollments e ON e.course_id = c.id
JOIN users u ON u.id = e.student_id
WHERE u.email = 'duc1@gmail.com'
ORDER BY e.enrolled_at DESC
LIMIT 1;

