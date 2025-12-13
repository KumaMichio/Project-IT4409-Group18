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
-- Sử dụng subquery để lấy course_id dựa trên slug
INSERT INTO course_tags (course_id, tag_id) VALUES
-- HTML CSS
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM tags WHERE name = 'Web Development')),

-- JavaScript
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- Git GitHub
((SELECT id FROM courses WHERE slug = 'git-github-developer'), (SELECT id FROM tags WHERE name = 'Web Development')),

-- TypeScript
((SELECT id FROM courses WHERE slug = 'typescript-javascript'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'typescript-javascript'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- Next.js
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'ReactJS')),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'NodeJS')),

-- Docker Kubernetes
((SELECT id FROM courses WHERE slug = 'docker-kubernetes'), (SELECT id FROM tags WHERE name = 'Backend')),

-- Python Data Science
((SELECT id FROM courses WHERE slug = 'python-data-science'), (SELECT id FROM tags WHERE name = 'Backend')),

-- MongoDB
((SELECT id FROM courses WHERE slug = 'mongodb-co-ban-nang-cao'), (SELECT id FROM tags WHERE name = 'Database')),
((SELECT id FROM courses WHERE slug = 'mongodb-co-ban-nang-cao'), (SELECT id FROM tags WHERE name = 'Backend')),

-- AWS Cloud
((SELECT id FROM courses WHERE slug = 'aws-cloud-practitioner'), (SELECT id FROM tags WHERE name = 'Backend')),

-- RESTful API
((SELECT id FROM courses WHERE slug = 'restful-api-design'), (SELECT id FROM tags WHERE name = 'Backend')),
((SELECT id FROM courses WHERE slug = 'restful-api-design'), (SELECT id FROM tags WHERE name = 'NodeJS'));

-- ==== THÊM MODULES CHO MỘT SỐ KHÓA HỌC ====
-- Course: HTML CSS
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 'Phần 1: Học HTML5', 1),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 'Phần 2: Học CSS3', 2),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 'Phần 3: Responsive Design', 3),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 'Phần 4: Flexbox và Grid', 4);

-- Course: JavaScript
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 'Phần 1: JavaScript Basics', 1),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 'Phần 2: DOM Manipulation', 2),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 'Phần 3: ES6+ Features', 3),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 'Phần 4: Async JavaScript', 4);

-- Course: Git GitHub
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'git-github-developer'), 'Phần 1: Git Fundamentals', 1),
((SELECT id FROM courses WHERE slug = 'git-github-developer'), 'Phần 2: Branching Strategies', 2),
((SELECT id FROM courses WHERE slug = 'git-github-developer'), 'Phần 3: GitHub Collaboration', 3);

-- Course: Next.js
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 'Phần 1: Next.js Introduction', 1),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 'Phần 2: App Router', 2),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 'Phần 3: Server Components', 3),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 'Phần 4: Data Fetching', 4),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 'Phần 5: Deployment', 5);

-- ==== THÊM LESSONS CHO CÁC MODULES MỚI ====
-- Module: HTML5 (Phần 1 của HTML CSS course)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'Giới thiệu khóa học HTML5', 1, 420, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'Cấu trúc cơ bản của HTML', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'HTML Semantic Tags', 3, 540, false);

-- Module: CSS3 (Phần 2 của HTML CSS course)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'CSS Selectors và Properties', 1, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'Box Model và Layout', 2, 890, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'CSS Colors và Typography', 3, 540, false);

-- Module: JavaScript Basics (Phần 1 của JavaScript course)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Variables và Data Types', 1, 580, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Functions và Scope', 2, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Objects và Arrays', 3, 650, false);

-- Module: Next.js Intro (Phần 1 của Next.js course)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'What is Next.js?', 1, 480, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'Project Setup', 2, 360, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'File-based Routing', 3, 540, false);

-- ==== CẬP NHẬT ENROLLMENTS ====
-- Thêm enrollments để tăng số học viên
INSERT INTO enrollments (course_id, student_id, status, enrolled_at) VALUES
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW() - INTERVAL '5 days'),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student2@test.com'), 'ACTIVE', NOW() - INTERVAL '3 days'),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW() - INTERVAL '7 days'),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM users WHERE email = 'student2@test.com'), 'ACTIVE', NOW() - INTERVAL '2 days');

-- ==== THÊM REVIEWS CHO KHÓA HỌC MỚI ====
INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at) VALUES
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'Khóa học HTML CSS rất chi tiết và dễ hiểu. Giảng viên 28 Tech giải thích rất rõ ràng!', NOW() - INTERVAL '2 days'),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student2@test.com'), 5, 'Tôi đã học được rất nhiều từ khóa học này. Nội dung được cập nhật mới nhất.', NOW() - INTERVAL '1 day'),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'JavaScript course tuyệt vời! Từ cơ bản đến nâng cao đều có.', NOW() - INTERVAL '3 days'),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM users WHERE email = 'student2@test.com'), 5, 'Next.js 14 được giảng dạy rất kỹ lưỡng. Rất đáng để đầu tư.', NOW() - INTERVAL '1 day'),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM users WHERE email = 'student2@test.com'), 4, 'Backend với Node.js rất thực tế. Tuy nhiên cần thêm nhiều ví dụ hơn.', NOW() - INTERVAL '2 days'),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'React.js course tốt nhất tôi từng học. Hooks và Context API được giải thích rất rõ.', NOW() - INTERVAL '4 days');

-- ==== CẬP NHẬT ORDERS ====
-- Create orders for paid courses
INSERT INTO orders (user_id, order_number, total_amount_cents, currency, status, payment_provider, created_at, completed_at) VALUES
((SELECT id FROM users WHERE email = 'student1@test.com'), 'ORD-00000003', 0, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'ORD-00000004', 0, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE email = 'student1@test.com'), 'ORD-00000005', 390000, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'ORD-00000006', 690000, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Order items
INSERT INTO order_items (order_id, course_id, price_cents) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-00000003'), (SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 0),
((SELECT id FROM orders WHERE order_number = 'ORD-00000004'), (SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 0),
((SELECT id FROM orders WHERE order_number = 'ORD-00000005'), (SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 390000),
((SELECT id FROM orders WHERE order_number = 'ORD-00000006'), (SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 690000);

-- ==== CẬP NHẬT PAYMENTS ====
-- Link payments to enrollments
INSERT INTO payments (enrollment_id, provider, provider_txn_id, amount_cents, currency, status, created_at) VALUES
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1), 'VNPAY', 'VNPAY_TXN_200001', 0, 'VND', 'PAID', NOW() - INTERVAL '5 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND student_id = (SELECT id FROM users WHERE email = 'student2@test.com') LIMIT 1), 'MOMO', 'MOMO_TXN_200002', 0, 'VND', 'PAID', NOW() - INTERVAL '3 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1), 'VNPAY', 'VNPAY_TXN_200003', 390000, 'VND', 'PAID', NOW() - INTERVAL '7 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND student_id = (SELECT id FROM users WHERE email = 'student2@test.com') LIMIT 1), 'MOMO', 'MOMO_TXN_200004', 690000, 'VND', 'PAID', NOW() - INTERVAL '2 days');

-- Thông báo
SELECT 'Đã thêm dữ liệu khóa học mới thành công!' as message,
       (SELECT COUNT(*) FROM courses) as total_courses,
       (SELECT COUNT(*) FROM modules) as total_modules,
       (SELECT COUNT(*) FROM lessons) as total_lessons,
       (SELECT COUNT(*) FROM course_reviews) as total_reviews;
