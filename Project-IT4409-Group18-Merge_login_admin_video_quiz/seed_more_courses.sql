-- Thêm dữ liệu khóa học mẫu cho phần "Học viên khác cũng mua"

-- ==== THÊM KHÓA HỌC MỚI ====
INSERT INTO courses (instructor_id, title, slug, description, price_cents, is_published, published_at, thumbnail_url) VALUES
-- Khóa học từ giảng viên 3 (28 Tech)
(3, 'HTML CSS từ Zero đến Hero', 'html-css-zero-hero',
 'Khóa học HTML CSS toàn diện, từ cơ bản đến nâng cao. Học cách xây dựng giao diện web responsive và đẹp mắt.',
 0, true, NOW(), 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2'),

(3, 'JavaScript cơ bản cho người mới', 'javascript-co-ban',
 'Nắm vững JavaScript từ cơ bản đến nâng cao. DOM manipulation, ES6+, và các design patterns quan trọng.',
 390000, true, NOW(), 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a'),

(3, 'Git và GitHub cho Developer', 'git-github-developer',
 'Học cách sử dụng Git và GitHub hiệu quả. Version control, branching strategies, và collaboration.',
 290000, true, NOW(), 'https://images.unsplash.com/photo-1556075798-4825dfaaf498'),

(3, 'TypeScript cho JavaScript Developer', 'typescript-javascript',
 'Làm chủ TypeScript với type system, interfaces, generics và advanced types.',
 450000, true, NOW(), 'https://images.unsplash.com/photo-1516116216624-53e697fedbea'),

-- Khóa học từ giảng viên 4
(4, 'Next.js Full-Stack Development', 'nextjs-fullstack',
 'Xây dựng ứng dụng full-stack với Next.js 14. Server Components, App Router, và tối ưu hiệu suất.',
 690000, true, NOW(), 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'),

(4, 'Docker và Kubernetes thực chiến', 'docker-kubernetes',
 'Container hóa ứng dụng với Docker và orchestration với Kubernetes. CI/CD pipeline và deployment strategies.',
 590000, true, NOW(), 'https://images.unsplash.com/photo-1605745341112-85968b19335b'),

(4, 'Python cho Data Science', 'python-data-science',
 'Học Python và các thư viện phổ biến: Pandas, NumPy, Matplotlib. Phân tích và trực quan hóa dữ liệu.',
 550000, true, NOW(), 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935'),

(4, 'MongoDB từ cơ bản đến nâng cao', 'mongodb-co-ban-nang-cao',
 'NoSQL database với MongoDB. Schema design, indexing, aggregation và performance optimization.',
 420000, true, NOW(), 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'),

(4, 'AWS Cloud Practitioner', 'aws-cloud-practitioner',
 'Khóa học AWS cơ bản. EC2, S3, RDS, Lambda và các services phổ biến trên AWS Cloud.',
 650000, true, NOW(), 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'),

(3, 'RESTful API Design Best Practices', 'restful-api-design',
 'Thiết kế RESTful API chuẩn. HTTP methods, status codes, authentication và documentation.',
 380000, true, NOW(), 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31');

-- ==== CẬP NHẬT TAGS CHO KHÓA HỌC MỚI ====
-- Lấy course_id mới nhất (giả sử courses hiện có 3 khóa)
INSERT INTO course_tags (course_id, tag_id) VALUES
-- HTML CSS (course 4)
(4, 3), (4, 7), -- Frontend, Web Development

-- JavaScript (course 5)
(5, 3), (5, 8), -- Frontend, JavaScript

-- Git GitHub (course 6)
(6, 7), -- Web Development

-- TypeScript (course 7)
(7, 3), (7, 8), -- Frontend, JavaScript

-- Next.js (course 8)
(8, 3), (8, 4), (8, 5), -- Frontend, ReactJS, NodeJS

-- Docker Kubernetes (course 9)
(9, 2), -- Backend

-- Python Data Science (course 10)
(10, 2), -- Backend

-- MongoDB (course 11)
(11, 1), (11, 2), -- Database, Backend

-- AWS Cloud (course 12)
(12, 2), -- Backend

-- RESTful API (course 13)
(13, 2), (13, 5); -- Backend, NodeJS

-- ==== THÊM MODULES CHO MỘT SỐ KHÓA HỌC ====
-- Course 4: HTML CSS
INSERT INTO modules (course_id, title, position) VALUES
(4, 'Phần 1: Học HTML5', 1),
(4, 'Phần 2: Học CSS3', 2),
(4, 'Phần 3: Responsive Design', 3),
(4, 'Phần 4: Flexbox và Grid', 4);

-- Course 5: JavaScript
INSERT INTO modules (course_id, title, position) VALUES
(5, 'Phần 1: JavaScript Basics', 1),
(5, 'Phần 2: DOM Manipulation', 2),
(5, 'Phần 3: ES6+ Features', 3),
(5, 'Phần 4: Async JavaScript', 4);

-- Course 6: Git GitHub
INSERT INTO modules (course_id, title, position) VALUES
(6, 'Phần 1: Git Fundamentals', 1),
(6, 'Phần 2: Branching Strategies', 2),
(6, 'Phần 3: GitHub Collaboration', 3);

-- Course 8: Next.js
INSERT INTO modules (course_id, title, position) VALUES
(8, 'Phần 1: Next.js Introduction', 1),
(8, 'Phần 2: App Router', 2),
(8, 'Phần 3: Server Components', 3),
(8, 'Phần 4: Data Fetching', 4),
(8, 'Phần 5: Deployment', 5);

-- ==== THÊM LESSONS CHO CÁC MODULES MỚI ====
-- Module 4.1: HTML5
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(8, 'Giới thiệu khóa học HTML5', 1, 420, false),
(8, 'Cấu trúc cơ bản của HTML', 2, 680, false),
(8, 'HTML Semantic Tags', 3, 540, false);

-- Module 4.2: CSS3
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(9, 'CSS Selectors và Properties', 1, 720, false),
(9, 'Box Model và Layout', 2, 890, false),
(9, 'CSS Colors và Typography', 3, 540, false);

-- Module 5.1: JavaScript Basics
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(12, 'Variables và Data Types', 1, 580, false),
(12, 'Functions và Scope', 2, 720, false),
(12, 'Objects và Arrays', 3, 650, false);

-- Module 8.1: Next.js Intro
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
(20, 'What is Next.js?', 1, 480, false),
(20, 'Project Setup', 2, 360, false),
(20, 'File-based Routing', 3, 540, false);

-- ==== CẬP NHẬT ENROLLMENTS ====
-- Thêm enrollments để tăng số học viên
INSERT INTO enrollments (course_id, student_id, status, enrolled_at) VALUES
(4, 1, 'ACTIVE', NOW() - INTERVAL '5 days'),
(4, 2, 'ACTIVE', NOW() - INTERVAL '3 days'),
(5, 1, 'ACTIVE', NOW() - INTERVAL '7 days'),
(8, 2, 'ACTIVE', NOW() - INTERVAL '2 days');

-- ==== THÊM REVIEWS CHO KHÓA HỌC MỚI ====
INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at) VALUES
(4, 1, 5, 'Khóa học HTML CSS rất chi tiết và dễ hiểu. Giảng viên 28 Tech giải thích rất rõ ràng!', NOW() - INTERVAL '2 days'),
(4, 2, 5, 'Tôi đã học được rất nhiều từ khóa học này. Nội dung được cập nhật mới nhất.', NOW() - INTERVAL '1 day'),
(5, 1, 5, 'JavaScript course tuyệt vời! Từ cơ bản đến nâng cao đều có.', NOW() - INTERVAL '3 days'),
(8, 2, 5, 'Next.js 14 được giảng dạy rất kỹ lưỡng. Rất đáng để đầu tư.', NOW() - INTERVAL '1 day'),
(2, 2, 4, 'Backend với Node.js rất thực tế. Tuy nhiên cần thêm nhiều ví dụ hơn.', NOW() - INTERVAL '2 days'),
(3, 1, 5, 'React.js course tốt nhất tôi từng học. Hooks và Context API được giải thích rất rõ.', NOW() - INTERVAL '4 days');

-- ==== CẬP NHẬT PAYMENTS ====
INSERT INTO payments (enrollment_id, provider, provider_txn_id, amount_cents, currency, status, created_at) VALUES
(4, 'VNPAY', 'VNPAY_TXN_200001', 0, 'VND', 'PAID', NOW() - INTERVAL '5 days'),
(5, 'MOMO', 'MOMO_TXN_200002', 0, 'VND', 'PAID', NOW() - INTERVAL '3 days'),
(6, 'VNPAY', 'VNPAY_TXN_200003', 390000, 'VND', 'PAID', NOW() - INTERVAL '7 days'),
(7, 'MOMO', 'MOMO_TXN_200004', 690000, 'VND', 'PAID', NOW() - INTERVAL '2 days');

-- Thông báo
SELECT 'Đã thêm dữ liệu khóa học mới thành công!' as message,
       (SELECT COUNT(*) FROM courses) as total_courses,
       (SELECT COUNT(*) FROM modules) as total_modules,
       (SELECT COUNT(*) FROM lessons) as total_lessons,
       (SELECT COUNT(*) FROM course_reviews) as total_reviews;
