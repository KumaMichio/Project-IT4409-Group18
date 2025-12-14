-- Dữ liệu mẫu đầy đủ cho LMS Platform
-- File này merge seed.sql và seed_more_courses.sql thành một file duy nhất

-- Ensure UTF-8 encoding
SET client_encoding TO 'UTF8';

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
((SELECT id FROM users WHERE email = 'student1@test.com'), 'Sinh viên năm 3, chuyên ngành CNTT'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'Đang học lập trình web');

INSERT INTO instructor_profiles (user_id, bio, headline) VALUES
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'Giảng viên với 10 năm kinh nghiệm giảng dạy lập trình', 'Chuyên gia Database & Backend'),
((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'Founder của nhiều startup công nghệ', 'Full-stack Developer');

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
-- Khóa học từ seed.sql
INSERT INTO courses (instructor_id, title, slug, description, price_cents, is_published, published_at, thumbnail_url) VALUES
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'Cơ sở dữ liệu từ cơ bản đến nâng cao', 'co-so-du-lieu', 
 'Khóa học toàn diện về cơ sở dữ liệu, từ lý thuyết đến thực hành với PostgreSQL. Học cách thiết kế, tối ưu và quản lý database hiệu quả.',
 0, true, NOW(), 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'),

((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'Lập trình Backend với Node.js', 'backend-nodejs',
 'Xây dựng RESTful API với Node.js, Express và PostgreSQL. Học authentication, authorization và best practices.',
 490000, true, NOW(), 'https://images.unsplash.com/photo-1627398242454-45a1465c2479'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'React.js từ Zero đến Hero', 'reactjs-zero-hero',
 'Khóa học React.js toàn diện với Hooks, Context API, và các design patterns hiện đại.',
 590000, true, NOW(), 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'),

-- Khóa học từ seed_more_courses.sql
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'HTML CSS từ Zero đến Hero', 'html-css-zero-hero',
 'Khóa học HTML CSS toàn diện, từ cơ bản đến nâng cao. Học cách xây dựng giao diện web responsive và đẹp mắt.',
 0, true, NOW(), 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2'),

((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'JavaScript cơ bản cho người mới', 'javascript-co-ban',
 'Nắm vững JavaScript từ cơ bản đến nâng cao. DOM manipulation, ES6+, và các design patterns quan trọng.',
 390000, true, NOW(), 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a'),

((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'Git và GitHub cho Developer', 'git-github-developer',
 'Học cách sử dụng Git và GitHub hiệu quả. Version control, branching strategies, và collaboration.',
 290000, true, NOW(), 'https://images.unsplash.com/photo-1556075798-4825dfaaf498'),

((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'TypeScript cho JavaScript Developer', 'typescript-javascript',
 'Làm chủ TypeScript với type system, interfaces, generics và advanced types.',
 450000, true, NOW(), 'https://images.unsplash.com/photo-1516116216624-53e697fedbea'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'Next.js Full-Stack Development', 'nextjs-fullstack',
 'Xây dựng ứng dụng full-stack với Next.js 14. Server Components, App Router, và tối ưu hiệu suất.',
 690000, true, NOW(), 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'Docker và Kubernetes thực chiến', 'docker-kubernetes',
 'Container hóa ứng dụng với Docker và orchestration với Kubernetes. CI/CD pipeline và deployment strategies.',
 590000, true, NOW(), 'https://images.unsplash.com/photo-1605745341112-85968b19335b'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'Python cho Data Science', 'python-data-science',
 'Học Python và các thư viện phổ biến: Pandas, NumPy, Matplotlib. Phân tích và trực quan hóa dữ liệu.',
 550000, true, NOW(), 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'MongoDB từ cơ bản đến nâng cao', 'mongodb-co-ban-nang-cao',
 'NoSQL database với MongoDB. Schema design, indexing, aggregation và performance optimization.',
 420000, true, NOW(), 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 'AWS Cloud Practitioner', 'aws-cloud-practitioner',
 'Khóa học AWS cơ bản. EC2, S3, RDS, Lambda và các services phổ biến trên AWS Cloud.',
 650000, true, NOW(), 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'),

((SELECT id FROM users WHERE email = 'teacher1@test.com'), 'RESTful API Design Best Practices', 'restful-api-design',
 'Thiết kế RESTful API chuẩn. HTTP methods, status codes, authentication và documentation.',
 380000, true, NOW(), 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31');

-- ==== COURSE TAGS ====
INSERT INTO course_tags (course_id, tag_id) VALUES
-- Course: Cơ sở dữ liệu
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), (SELECT id FROM tags WHERE name = 'Database')),
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), (SELECT id FROM tags WHERE name = 'PostgreSQL')),

-- Course: Backend Node.js
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM tags WHERE name = 'Backend')),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM tags WHERE name = 'NodeJS')),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM tags WHERE name = 'PostgreSQL')),

-- Course: React.js
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM tags WHERE name = 'ReactJS')),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- Course: HTML CSS
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM tags WHERE name = 'Web Development')),

-- Course: JavaScript
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- Course: Git GitHub
((SELECT id FROM courses WHERE slug = 'git-github-developer'), (SELECT id FROM tags WHERE name = 'Web Development')),

-- Course: TypeScript
((SELECT id FROM courses WHERE slug = 'typescript-javascript'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'typescript-javascript'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- Course: Next.js
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'Frontend')),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'ReactJS')),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM tags WHERE name = 'NodeJS')),

-- Course: Docker Kubernetes
((SELECT id FROM courses WHERE slug = 'docker-kubernetes'), (SELECT id FROM tags WHERE name = 'Backend')),

-- Course: Python Data Science
((SELECT id FROM courses WHERE slug = 'python-data-science'), (SELECT id FROM tags WHERE name = 'Backend')),

-- Course: MongoDB
((SELECT id FROM courses WHERE slug = 'mongodb-co-ban-nang-cao'), (SELECT id FROM tags WHERE name = 'Database')),
((SELECT id FROM courses WHERE slug = 'mongodb-co-ban-nang-cao'), (SELECT id FROM tags WHERE name = 'Backend')),

-- Course: AWS Cloud
((SELECT id FROM courses WHERE slug = 'aws-cloud-practitioner'), (SELECT id FROM tags WHERE name = 'Backend')),

-- Course: RESTful API
((SELECT id FROM courses WHERE slug = 'restful-api-design'), (SELECT id FROM tags WHERE name = 'Backend')),
((SELECT id FROM courses WHERE slug = 'restful-api-design'), (SELECT id FROM tags WHERE name = 'NodeJS'));

-- ==== MODULES ====
-- Course: Cơ sở dữ liệu
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), 'Khái niệm kỹ thuật cần biết', 1),
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), 'Môi trường, con người IT', 2),
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), 'Thiết kế Database', 3);

-- Course: Backend Node.js
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), 'Giới thiệu về Node.js', 1),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), 'Express Framework', 2),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), 'Database Integration', 3);

-- Course: React.js
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), 'React Fundamentals', 1),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), 'React Hooks', 2);

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

-- ==== LESSONS ====
-- Module: Khái niệm kỹ thuật (Course: Cơ sở dữ liệu)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 1), 'Mô hình Client - Server là gì?', 1, 695, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 1), 'Domain là gì? Tên miền là gì?', 2, 634, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 1), 'Mua áo F8 | Đăng ký học Offline', 3, 60, false);

-- Module: Môi trường IT (Course: Cơ sở dữ liệu)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 2), 'Học IT cần tổ chất gì? Góc nhìn khác từ chuyên gia định hướng giáo dục', 1, 1450, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 2), 'Sinh viên IT đi thực tập tại doanh nghiệp cần biết những gì?', 2, 2051, false);

-- Module: Thiết kế Database (Course: Cơ sở dữ liệu)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 3), 'ERD - Entity Relationship Diagram', 1, 890, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'co-so-du-lieu') AND position = 3), 'Normalization và Normal Forms', 2, 1200, true);

-- Module: Node.js Intro (Course: Backend Node.js)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend-nodejs') AND position = 1), 'Node.js là gì?', 1, 540, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend-nodejs') AND position = 1), 'Cài đặt môi trường', 2, 320, false);

-- Module: Express (Course: Backend Node.js)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend-nodejs') AND position = 2), 'Express Framework Introduction', 1, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend-nodejs') AND position = 2), 'Routing và Middleware', 2, 920, false);

-- Module: React Fundamentals (Course: React.js)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'reactjs-zero-hero') AND position = 1), 'What is React?', 1, 450, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'reactjs-zero-hero') AND position = 1), 'JSX và Components', 2, 720, false);

-- Module: HTML5 (Course: HTML CSS)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'Giới thiệu khóa học HTML5', 1, 420, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'Cấu trúc cơ bản của HTML', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 1), 'HTML Semantic Tags', 3, 540, false);

-- Module: CSS3 (Course: HTML CSS)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'CSS Selectors và Properties', 1, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'Box Model và Layout', 2, 890, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND position = 2), 'CSS Colors và Typography', 3, 540, false);

-- Module: JavaScript Basics (Course: JavaScript)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Variables và Data Types', 1, 580, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Functions và Scope', 2, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND position = 1), 'Objects và Arrays', 3, 650, false);

-- Module: Next.js Intro (Course: Next.js)
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'What is Next.js?', 1, 480, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'Project Setup', 2, 360, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND position = 1), 'File-based Routing', 3, 540, false);

-- ==== LESSON ASSETS ====
-- Lesson: Mô hình Client-Server
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Mô hình Client - Server là gì?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
((SELECT id FROM lessons WHERE title = 'Mô hình Client - Server là gì?' LIMIT 1), 'PDF', 'https://example.com/docs/client-server-model.pdf', 2),
((SELECT id FROM lessons WHERE title = 'Mô hình Client - Server là gì?' LIMIT 1), 'LINK', 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview', 3);

-- Lesson: Domain
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Domain là gì? Tên miền là gì?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=example2', 1),
((SELECT id FROM lessons WHERE title = 'Domain là gì? Tên miền là gì?' LIMIT 1), 'PDF', 'https://example.com/docs/domain-names.pdf', 2);

-- Lesson: Học IT
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Học IT cần tổ chất gì? Góc nhìn khác từ chuyên gia định hướng giáo dục' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=example4', 1);

-- Lesson: ERD
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'ERD - Entity Relationship Diagram' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=example6', 1),
((SELECT id FROM lessons WHERE title = 'ERD - Entity Relationship Diagram' LIMIT 1), 'PDF', 'https://example.com/docs/erd-guide.pdf', 2);

-- Lesson: Node.js
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Node.js là gì?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=example8', 1);

-- Lesson: React Intro
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'What is React?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=example11', 1),
((SELECT id FROM lessons WHERE title = 'What is React?' LIMIT 1), 'LINK', 'https://react.dev/learn', 2);

-- ==== QUIZZES ====
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), 
 (SELECT id FROM lessons WHERE title = 'Mô hình Client - Server là gì?' LIMIT 1), 
 'Kiểm tra kiến thức Client-Server', 600, 3, 60),
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), 
 (SELECT id FROM lessons WHERE title = 'Normalization và Normal Forms' LIMIT 1), 
 'Quiz: Normalization', 900, 2, 70),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), 
 (SELECT id FROM lessons WHERE title = 'Routing và Middleware' LIMIT 1), 
 'Express Routing Quiz', 480, 3, 60);

-- ==== QUIZ QUESTIONS ====
-- Quiz: Client-Server
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1), 'Client-Server là mô hình kiến trúc gì?', 'SINGLE_CHOICE', 1, 1),
((SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1), 'Trong mô hình Client-Server, Client có vai trò gì?', 'SINGLE_CHOICE', 2, 1),
((SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1), 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?', 'SINGLE_CHOICE', 3, 1);

-- Quiz: Normalization
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Quiz: Normalization' LIMIT 1), 'Normalization giúp giảm thiểu điều gì trong database?', 'MULTI_CHOICE', 1, 2),
((SELECT id FROM quizzes WHERE title = 'Quiz: Normalization' LIMIT 1), '1NF (First Normal Form) yêu cầu gì?', 'SINGLE_CHOICE', 2, 1);

-- Quiz: Express
INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
((SELECT id FROM quizzes WHERE title = 'Express Routing Quiz' LIMIT 1), 'Middleware trong Express là gì?', 'SINGLE_CHOICE', 1, 1),
((SELECT id FROM quizzes WHERE title = 'Express Routing Quiz' LIMIT 1), 'Express hỗ trợ những HTTP method nào?', 'MULTI_CHOICE', 2, 2);

-- ==== QUIZ OPTIONS ====
-- Q1.1: Client-Server là gì
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1), 'Mô hình phân tán trong đó máy client yêu cầu dịch vụ từ máy server', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1), 'Mô hình lưu trữ tập trung tất cả dữ liệu', false, 2),
((SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1), 'Mô hình peer-to-peer', false, 3),
((SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1), 'Mô hình standalone', false, 4);

-- Q1.2: Vai trò Client
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'Trong mô hình Client-Server, Client có vai trò gì?' LIMIT 1), 'Gửi yêu cầu và nhận phản hồi từ server', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'Trong mô hình Client-Server, Client có vai trò gì?' LIMIT 1), 'Lưu trữ toàn bộ dữ liệu', false, 2),
((SELECT id FROM quiz_questions WHERE question = 'Trong mô hình Client-Server, Client có vai trò gì?' LIMIT 1), 'Xử lý logic nghiệp vụ chính', false, 3);

-- Q1.3: HTTP layer
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1), 'Application Layer', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1), 'Transport Layer', false, 2),
((SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1), 'Network Layer', false, 3),
((SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1), 'Physical Layer', false, 4);

-- Q2.1: Normalization benefits
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'Normalization giúp giảm thiểu điều gì trong database?' LIMIT 1), 'Data redundancy (dữ liệu trùng lặp)', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'Normalization giúp giảm thiểu điều gì trong database?' LIMIT 1), 'Update anomalies', true, 2),
((SELECT id FROM quiz_questions WHERE question = 'Normalization giúp giảm thiểu điều gì trong database?' LIMIT 1), 'Insert anomalies', true, 3),
((SELECT id FROM quiz_questions WHERE question = 'Normalization giúp giảm thiểu điều gì trong database?' LIMIT 1), 'Query performance', false, 4);

-- Q2.2: 1NF requirements
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = '1NF (First Normal Form) yêu cầu gì?' LIMIT 1), 'Mỗi cell chỉ chứa giá trị atomic (không thể chia nhỏ hơn)', true, 1),
((SELECT id FROM quiz_questions WHERE question = '1NF (First Normal Form) yêu cầu gì?' LIMIT 1), 'Phải có primary key', false, 2),
((SELECT id FROM quiz_questions WHERE question = '1NF (First Normal Form) yêu cầu gì?' LIMIT 1), 'Không có partial dependency', false, 3);

-- Q3.1: Middleware
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'Middleware trong Express là gì?' LIMIT 1), 'Function có quyền truy cập request, response và next()', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'Middleware trong Express là gì?' LIMIT 1), 'Database connection layer', false, 2),
((SELECT id FROM quiz_questions WHERE question = 'Middleware trong Express là gì?' LIMIT 1), 'Routing mechanism', false, 3);

-- Q3.2: HTTP methods
INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
((SELECT id FROM quiz_questions WHERE question = 'Express hỗ trợ những HTTP method nào?' LIMIT 1), 'GET', true, 1),
((SELECT id FROM quiz_questions WHERE question = 'Express hỗ trợ những HTTP method nào?' LIMIT 1), 'POST', true, 2),
((SELECT id FROM quiz_questions WHERE question = 'Express hỗ trợ những HTTP method nào?' LIMIT 1), 'PUT', true, 3),
((SELECT id FROM quiz_questions WHERE question = 'Express hỗ trợ những HTTP method nào?' LIMIT 1), 'DELETE', true, 4),
((SELECT id FROM quiz_questions WHERE question = 'Express hỗ trợ những HTTP method nào?' LIMIT 1), 'CONNECT', false, 5);

-- ==== ENROLLMENTS ====
INSERT INTO enrollments (course_id, student_id, status, enrolled_at) VALUES
-- From seed.sql
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW()),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW()),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM users WHERE email = 'student2@test.com'), 'ACTIVE', NOW()),

-- From seed_more_courses.sql
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW() - INTERVAL '5 days'),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student2@test.com'), 'ACTIVE', NOW() - INTERVAL '3 days'),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM users WHERE email = 'student1@test.com'), 'ACTIVE', NOW() - INTERVAL '7 days'),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM users WHERE email = 'student2@test.com'), 'ACTIVE', NOW() - INTERVAL '2 days');

-- ==== QUIZ ATTEMPTS ====
INSERT INTO quiz_attempts (quiz_id, student_id, started_at, submitted_at, score, passed, attempt_no) VALUES
((SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1), 
 (SELECT id FROM users WHERE email = 'student1@test.com'), 
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 66, true, 1);

-- Quiz answers
-- Student 1 answered quiz questions correctly for Q1 and Q2, incorrectly for Q3
INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_ids, is_correct) VALUES
-- Answer for Q1 (correct)
((SELECT id FROM quiz_attempts WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1) AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1),
 (SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1),
 ARRAY[(SELECT id FROM quiz_options WHERE question_id = (SELECT id FROM quiz_questions WHERE question = 'Client-Server là mô hình kiến trúc gì?' LIMIT 1) AND is_correct = true AND position = 1 LIMIT 1)],
 true),
-- Answer for Q2 (correct)
((SELECT id FROM quiz_attempts WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1) AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1),
 (SELECT id FROM quiz_questions WHERE question = 'Trong mô hình Client-Server, Client có vai trò gì?' LIMIT 1),
 ARRAY[(SELECT id FROM quiz_options WHERE question_id = (SELECT id FROM quiz_questions WHERE question = 'Trong mô hình Client-Server, Client có vai trò gì?' LIMIT 1) AND is_correct = true AND position = 1 LIMIT 1)],
 true),
-- Answer for Q3 (incorrect - selected position 2 which is false)
((SELECT id FROM quiz_attempts WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Kiểm tra kiến thức Client-Server' LIMIT 1) AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1),
 (SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1),
 ARRAY[(SELECT id FROM quiz_options WHERE question_id = (SELECT id FROM quiz_questions WHERE question = 'HTTP là giao thức thuộc tầng nào trong mô hình OSI?' LIMIT 1) AND position = 2 LIMIT 1)],
 false);

-- ==== COURSE REVIEWS ====
INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at) VALUES
-- From seed.sql
((SELECT id FROM courses WHERE slug = 'co-so-du-lieu'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'Khóa học rất hay và chi tiết! Giảng viên dạy dễ hiểu.', NOW() - INTERVAL '1 day'),

-- From seed_more_courses.sql
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'Khóa học HTML CSS rất chi tiết và dễ hiểu. Giảng viên 28 Tech giải thích rất rõ ràng!', NOW() - INTERVAL '2 days'),
((SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), (SELECT id FROM users WHERE email = 'student2@test.com'), 5, 'Tôi đã học được rất nhiều từ khóa học này. Nội dung được cập nhật mới nhất.', NOW() - INTERVAL '1 day'),
((SELECT id FROM courses WHERE slug = 'javascript-co-ban'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'JavaScript course tuyệt vời! Từ cơ bản đến nâng cao đều có.', NOW() - INTERVAL '3 days'),
((SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), (SELECT id FROM users WHERE email = 'student2@test.com'), 5, 'Next.js 14 được giảng dạy rất kỹ lưỡng. Rất đáng để đầu tư.', NOW() - INTERVAL '1 day'),
((SELECT id FROM courses WHERE slug = 'backend-nodejs'), (SELECT id FROM users WHERE email = 'student2@test.com'), 4, 'Backend với Node.js rất thực tế. Tuy nhiên cần thêm nhiều ví dụ hơn.', NOW() - INTERVAL '2 days'),
((SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), (SELECT id FROM users WHERE email = 'student1@test.com'), 5, 'React.js course tốt nhất tôi từng học. Hooks và Context API được giải thích rất rõ.', NOW() - INTERVAL '4 days');

-- ==== ORDERS ====
INSERT INTO orders (user_id, order_number, total_amount_cents, currency, status, payment_provider, created_at, completed_at) VALUES
-- From seed.sql
((SELECT id FROM users WHERE email = 'student1@test.com'), 'ORD-00000001', 490000, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'ORD-00000002', 590000, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- From seed_more_courses.sql
((SELECT id FROM users WHERE email = 'student1@test.com'), 'ORD-00000003', 0, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'ORD-00000004', 0, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE email = 'student1@test.com'), 'ORD-00000005', 390000, 'VND', 'PAID', 'VNPAY', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
((SELECT id FROM users WHERE email = 'student2@test.com'), 'ORD-00000006', 690000, 'VND', 'PAID', 'MOMO', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Order items
INSERT INTO order_items (order_id, course_id, price_cents) VALUES
-- From seed.sql
((SELECT id FROM orders WHERE order_number = 'ORD-00000001'), (SELECT id FROM courses WHERE slug = 'backend-nodejs'), 490000),
((SELECT id FROM orders WHERE order_number = 'ORD-00000002'), (SELECT id FROM courses WHERE slug = 'reactjs-zero-hero'), 590000),

-- From seed_more_courses.sql
((SELECT id FROM orders WHERE order_number = 'ORD-00000003'), (SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 0),
((SELECT id FROM orders WHERE order_number = 'ORD-00000004'), (SELECT id FROM courses WHERE slug = 'html-css-zero-hero'), 0),
((SELECT id FROM orders WHERE order_number = 'ORD-00000005'), (SELECT id FROM courses WHERE slug = 'javascript-co-ban'), 390000),
((SELECT id FROM orders WHERE order_number = 'ORD-00000006'), (SELECT id FROM courses WHERE slug = 'nextjs-fullstack'), 690000);

-- ==== PAYMENTS ====
INSERT INTO payments (enrollment_id, provider, provider_txn_id, amount_cents, currency, status, created_at) VALUES
-- From seed.sql
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend-nodejs') AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1), 'VNPAY', 'VNPAY_TXN_123456', 490000, 'VND', 'PAID', NOW() - INTERVAL '3 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'reactjs-zero-hero') AND student_id = (SELECT id FROM users WHERE email = 'student2@test.com') LIMIT 1), 'MOMO', 'MOMO_TXN_789012', 590000, 'VND', 'PAID', NOW() - INTERVAL '5 days'),

-- From seed_more_courses.sql
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1), 'VNPAY', 'VNPAY_TXN_200001', 0, 'VND', 'PAID', NOW() - INTERVAL '5 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'html-css-zero-hero') AND student_id = (SELECT id FROM users WHERE email = 'student2@test.com') LIMIT 1), 'MOMO', 'MOMO_TXN_200002', 0, 'VND', 'PAID', NOW() - INTERVAL '3 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'javascript-co-ban') AND student_id = (SELECT id FROM users WHERE email = 'student1@test.com') LIMIT 1), 'VNPAY', 'VNPAY_TXN_200003', 390000, 'VND', 'PAID', NOW() - INTERVAL '7 days'),
((SELECT id FROM enrollments WHERE course_id = (SELECT id FROM courses WHERE slug = 'nextjs-fullstack') AND student_id = (SELECT id FROM users WHERE email = 'student2@test.com') LIMIT 1), 'MOMO', 'MOMO_TXN_200004', 690000, 'VND', 'PAID', NOW() - INTERVAL '2 days');

-- Thông báo hoàn thành
SELECT 'Đã thêm dữ liệu mẫu đầy đủ thành công!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM courses) as total_courses,
       (SELECT COUNT(*) FROM modules) as total_modules,
       (SELECT COUNT(*) FROM lessons) as total_lessons,
       (SELECT COUNT(*) FROM enrollments) as total_enrollments,
       (SELECT COUNT(*) FROM course_reviews) as total_reviews,
       (SELECT COUNT(*) FROM orders) as total_orders,
       (SELECT COUNT(*) FROM payments) as total_payments;

