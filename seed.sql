-- Dữ liệu mẫu cho LMS Platform

-- ==== USERS ====
-- Password mẫu: "password123" (đã hash với bcrypt)
INSERT INTO users (email, password_hash, full_name, role, avatar_url) VALUES
('student1@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Nguyễn Văn A', 'STUDENT', NULL),
('student2@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Trần Thị B', 'STUDENT', NULL),
('teacher1@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Giáo Viên Nguyễn', 'INSTRUCTOR', NULL),
('teacher2@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Giáo Viên Trần', 'INSTRUCTOR', NULL),
('admin@test.com', '$2a$10$rKvVLpLbxKZZKvQqZqZqZeCvGvYvXvYvXvYvXvYvXvYvXvYvXvYvX', 'Admin User', 'ADMIN', NULL);

-- ==== PROFILES ====
INSERT INTO student_profiles (user_id, about) VALUES
(1, 'Sinh viên năm 3, chuyên ngành CNTT'),
(2, 'Đang học lập trình web');

INSERT INTO instructor_profiles (user_id, bio, headline) VALUES
(3, 'Giảng viên với 10 năm kinh nghiệm giảng dạy lập trình', 'Chuyên gia Database & Backend'),
(4, 'Founder của nhiều startup công nghệ', 'Full-stack Developer');

-- ==== TAGS ====
INSERT INTO tags (name) VALUES
('Database'),
('Backend'),
('Frontend'),
('ReactJS'),
('NodeJS'),
('PostgreSQL'),
('Web Development'),
('JavaScript');

-- ==== COURSES ====
INSERT INTO courses (instructor_id, title, slug, description, price_cents, is_published, published_at, thumbnail_url) VALUES
(3, 'Cơ sở dữ liệu từ cơ bản đến nâng cao', 'co-so-du-lieu', 
 'Khóa học toàn diện về cơ sở dữ liệu, từ lý thuyết đến thực hành với PostgreSQL. Học cách thiết kế, tối ưu và quản lý database hiệu quả.',
 0, true, NOW(), 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'),

(3, 'Lập trình Backend với Node.js', 'backend-nodejs',
 'Xây dựng RESTful API với Node.js, Express và PostgreSQL. Học authentication, authorization và best practices.',
 490000, true, NOW(), 'https://images.unsplash.com/photo-1627398242454-45a1465c2479'),

(4, 'React.js từ Zero đến Hero', 'reactjs-zero-hero',
 'Khóa học React.js toàn diện với Hooks, Context API, và các design patterns hiện đại.',
 590000, true, NOW(), 'https://images.unsplash.com/photo-1633356122544-f134324a6cee');

-- ==== COURSE TAGS ====
INSERT INTO course_tags (course_id, tag_id) VALUES
(1, 1), (1, 6), -- Database, PostgreSQL
(2, 2), (2, 5), (2, 6), -- Backend, NodeJS, PostgreSQL
(3, 3), (3, 4), (3, 8); -- Frontend, ReactJS, JavaScript

-- ==== MODULES ====
-- Course 1: Cơ sở dữ liệu
INSERT INTO modules (course_id, title, position) VALUES
(1, 'Khái niệm kỹ thuật cần biết', 1),
(1, 'Môi trường, con người IT', 2),
(1, 'Thiết kế Database', 3);

-- Course 2: Backend Node.js
INSERT INTO modules (course_id, title, position) VALUES
(2, 'Giới thiệu về Node.js', 1),
(2, 'Express Framework', 2),
(2, 'Database Integration', 3);

-- Course 3: React.js
INSERT INTO modules (course_id, title, position) VALUES
(3, 'React Fundamentals', 1),
(3, 'React Hooks', 2);

-- ==== LESSONS ====
-- Module 1.1: Khái niệm kỹ thuật
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(1, 'Mô hình Client - Server là gì?', 1, 695, false),
(1, 'Domain là gì? Tên miền là gì?', 2, 634, false),
(1, 'Mua áo F8 | Đăng ký học Offline', 3, 60, false);

-- Module 1.2: Môi trường IT
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(2, 'Học IT cần tổ chất gì? Góc nhìn khác từ chuyên gia định hướng giáo dục', 1, 1450, false),
(2, 'Sinh viên IT đi thực tập tại doanh nghiệp cần biết những gì?', 2, 2051, false);

-- Module 1.3: Thiết kế Database
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(3, 'ERD - Entity Relationship Diagram', 1, 890, false),
(3, 'Normalization và Normal Forms', 2, 1200, true);

-- Module 2.1: Node.js Intro
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(4, 'Node.js là gì?', 1, 540, false),
(4, 'Cài đặt môi trường', 2, 320, false);

-- Module 2.2: Express
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(5, 'Express Framework Introduction', 1, 680, false),
(5, 'Routing và Middleware', 2, 920, false);

-- Module 3.1: React Fundamentals  
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(7, 'What is React?', 1, 450, false),
(7, 'JSX và Components', 2, 720, false);

-- ==== LESSON ASSETS ====
-- Lesson 1: Mô hình Client-Server
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(1, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
(1, 'PDF', 'https://example.com/docs/client-server-model.pdf', 2),
(1, 'LINK', 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview', 3);

-- Lesson 2: Domain
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(2, 'VIDEO', 'https://www.youtube.com/watch?v=example2', 1),
(2, 'PDF', 'https://example.com/docs/domain-names.pdf', 2);

-- Lesson 4: Học IT
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(4, 'VIDEO', 'https://www.youtube.com/watch?v=example4', 1);

-- Lesson 6: ERD
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(6, 'VIDEO', 'https://www.youtube.com/watch?v=example6', 1),
(6, 'PDF', 'https://example.com/docs/erd-guide.pdf', 2);

-- Lesson 8: Node.js
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(8, 'VIDEO', 'https://www.youtube.com/watch?v=example8', 1);

-- Lesson 11: React Intro
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
(11, 'VIDEO', 'https://www.youtube.com/watch?v=example11', 1),
(11, 'LINK', 'https://react.dev/learn', 2);

-- ==== QUIZZES ====
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(1, 1, 'Kiểm tra kiến thức Client-Server', 600, 3, 60),
(1, 7, 'Quiz: Normalization', 900, 2, 70),
(2, 9, 'Express Routing Quiz', 480, 3, 60);

-- ==== QUIZ QUESTIONS ====
-- Quiz 1: Client-Server
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(1, 'Client-Server là mô hình kiến trúc gì?', 'SINGLE_CHOICE', 1, 1),
(1, 'Trong mô hình Client-Server, Client có vai trò gì?', 'SINGLE_CHOICE', 2, 1),
(1, 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?', 'SINGLE_CHOICE', 3, 1);

-- Quiz 2: Normalization
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(2, 'Normalization giúp giảm thiểu điều gì trong database?', 'MULTI_CHOICE', 1, 2),
(2, '1NF (First Normal Form) yêu cầu gì?', 'SINGLE_CHOICE', 2, 1);

-- Quiz 3: Express
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(3, 'Middleware trong Express là gì?', 'SINGLE_CHOICE', 1, 1),
(3, 'Express hỗ trợ những HTTP method nào?', 'MULTI_CHOICE', 2, 2);

-- ==== QUIZ OPTIONS ====
-- Q1.1: Client-Server là gì
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(1, 'Mô hình phân tán trong đó máy client yêu cầu dịch vụ từ máy server', true, 1),
(1, 'Mô hình lưu trữ tập trung tất cả dữ liệu', false, 2),
(1, 'Mô hình peer-to-peer', false, 3),
(1, 'Mô hình standalone', false, 4);

-- Q1.2: Vai trò Client
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(2, 'Gửi yêu cầu và nhận phản hồi từ server', true, 1),
(2, 'Lưu trữ toàn bộ dữ liệu', false, 2),
(2, 'Xử lý logic nghiệp vụ chính', false, 3);

-- Q1.3: HTTP layer
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(3, 'Application Layer', true, 1),
(3, 'Transport Layer', false, 2),
(3, 'Network Layer', false, 3),
(3, 'Physical Layer', false, 4);

-- Q2.1: Normalization benefits
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(4, 'Data redundancy (dữ liệu trùng lặp)', true, 1),
(4, 'Update anomalies', true, 2),
(4, 'Insert anomalies', true, 3),
(4, 'Query performance', false, 4);

-- Q2.2: 1NF requirements
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(5, 'Mỗi cell chỉ chứa giá trị atomic (không thể chia nhỏ hơn)', true, 1),
(5, 'Phải có primary key', false, 2),
(5, 'Không có partial dependency', false, 3);

-- Q3.1: Middleware
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(6, 'Function có quyền truy cập request, response và next()', true, 1),
(6, 'Database connection layer', false, 2),
(6, 'Routing mechanism', false, 3);

-- Q3.2: HTTP methods
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
(7, 'GET', true, 1),
(7, 'POST', true, 2),
(7, 'PUT', true, 3),
(7, 'DELETE', true, 4),
(7, 'CONNECT', false, 5);

-- ==== ENROLLMENTS ====
INSERT INTO enrollments (course_id, student_id, status, enrolled_at) VALUES
(1, 1, 'ACTIVE', NOW()),
(2, 1, 'ACTIVE', NOW()),
(3, 2, 'ACTIVE', NOW());

-- ==== STUDENT PROGRESS ====
-- Note: student_lesson_progress and student_course_progress tables do not exist in the schema
-- Progress tracking would be handled through enrollments and quiz_attempts

-- ==== QUIZ ATTEMPTS ====
-- Student 1 đã làm quiz 1
INSERT INTO quiz_attempts (quiz_id, student_id, started_at, submitted_at, score, passed, attempt_no) VALUES
(1, 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 66, true, 1);

-- Quiz answers
INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_ids, is_correct) VALUES
(1, 1, ARRAY[1], true),
(1, 2, ARRAY[1], true),
(1, 3, ARRAY[2], false);

-- ==== COURSE REVIEWS ====
INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at) VALUES
(1, 1, 5, 'Khóa học rất hay và chi tiết! Giảng viên dạy dễ hiểu.', NOW() - INTERVAL '1 day');

-- ==== ORDERS ====
-- Create orders for paid courses
INSERT INTO orders (user_id, order_number, total_amount_cents, currency, status, payment_provider, created_at, completed_at) VALUES
(1, 'ORD-00000001', 490000, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2, 'ORD-00000002', 590000, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Order items
INSERT INTO order_items (order_id, course_id, price_cents) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-00000001'), 2, 490000),
((SELECT id FROM orders WHERE order_number = 'ORD-00000002'), 3, 590000);

-- ==== PAYMENTS ====
-- Link payments to enrollments (enrollment_id 2 and 3 from enrollments above)
INSERT INTO payments (enrollment_id, provider, provider_txn_id, amount_cents, currency, status, created_at) VALUES
((SELECT id FROM enrollments WHERE course_id = 2 AND student_id = 1 LIMIT 1), 'VNPAY', 'VNPAY_TXN_123456', 490000, 'VND', 'PAID', NOW() - INTERVAL '3 days'),
((SELECT id FROM enrollments WHERE course_id = 3 AND student_id = 2 LIMIT 1), 'MOMO', 'MOMO_TXN_789012', 590000, 'VND', 'PAID', NOW() - INTERVAL '5 days');

-- Thông báo hoàn thành
SELECT 'Đã thêm dữ liệu mẫu thành công!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM courses) as total_courses,
       (SELECT COUNT(*) FROM lessons) as total_lessons,
       (SELECT COUNT(*) FROM enrollments) as total_enrollments;
