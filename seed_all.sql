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
((SELECT id FROM lessons WHERE title = 'Domain là gì? Tên miền là gì?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=Rck3BALhI5c', 1),
((SELECT id FROM lessons WHERE title = 'Domain là gì? Tên miền là gì?' LIMIT 1), 'PDF', 'https://example.com/docs/domain-names.pdf', 2);

-- Lesson: Học IT
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Học IT cần tổ chất gì? Góc nhìn khác từ chuyên gia định hướng giáo dục' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=kJocbLHH0vU', 1);

-- Lesson: ERD
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'ERD - Entity Relationship Diagram' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=-CuY5ADwn24', 1),
((SELECT id FROM lessons WHERE title = 'ERD - Entity Relationship Diagram' LIMIT 1), 'PDF', 'https://example.com/docs/erd-guide.pdf', 2);

-- Lesson: Node.js
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'Node.js là gì?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 1);

-- Lesson: React Intro
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'What is React?' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1),
((SELECT id FROM lessons WHERE title = 'What is React?' LIMIT 1), 'LINK', 'https://react.dev/learn', 2);

-- Lesson: JSX và Components
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
((SELECT id FROM lessons WHERE title = 'JSX và Components' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=9hb_0TZ_MVI', 1);

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

INSERT INTO tags (name) VALUES
('AI'),
('Machine Learning'),
('Deep Learning'),
('Data Science'),
('Python'),
('JavaScript'),
('TypeScript'),
('Web Development'),
('Frontend'),
('Backend'),
('Full Stack'),
('Mobile Development'),
('Flutter'),
('React Native'),
('Database'),
('SQL'),
('NoSQL'),
('MongoDB'),
('DevOps'),
('Docker'),
('Kubernetes'),
('Cloud Computing'),
('AWS'),
('Blockchain'),
('UI/UX Design'),
('Game Development'),
('Toán học'),
('Lập trình thi đấu')
ON CONFLICT (name) DO NOTHING;

-- ==== COURSES ====
INSERT INTO courses (instructor_id, title, slug, description, price_cents, is_published, thumbnail_url) VALUES
-- AI & ML Courses
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 
 'Python cho AI & Machine Learning', 
 'python-ai-ml',
 'Khóa học toàn diện về AI và Machine Learning với Python. Học từ cơ bản đến nâng cao về Neural Networks, Deep Learning, và các thuật toán ML phổ biến.',
 890000, 
 true, 
 'https://images.unsplash.com/photo-1555949963-aa79dcee981c'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 
 'Deep Learning với TensorFlow', 
 'deep-learning-tensorflow',
 'Khóa học chuyên sâu về Deep Learning sử dụng TensorFlow. Xây dựng các mô hình CNN, RNN, và Transformer.',
 1200000, 
 true, 
 'https://images.unsplash.com/photo-1677442136019-21780ecad995'),

-- Mobile Development
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 
 'Flutter - Xây dựng App đa nền tảng', 
 'flutter-mobile-dev',
 'Học Flutter để xây dựng ứng dụng mobile chạy trên cả iOS và Android. Từ cơ bản đến deploy lên Store.',
 790000, 
 true, 
 'https://images.unsplash.com/photo-1551650975-87deedd944c3'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 
 'React Native - Mobile App Development', 
 'react-native-mobile',
 'Phát triển ứng dụng mobile với React Native. Tận dụng kiến thức React để build app iOS/Android.',
 750000, 
 true, 
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c'),

-- Database
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 
 'MongoDB từ Zero đến Hero', 
 'mongodb-complete',
 'Khóa học MongoDB toàn diện. NoSQL database phổ biến nhất cho web development hiện đại.',
 590000, 
 true, 
 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'),

((SELECT id FROM users WHERE email = 'teacher2@test.com'), 
 'PostgreSQL Advanced', 
 'postgresql-advanced',
 'PostgreSQL nâng cao: Query optimization, Indexing, Transactions, Replication và Performance tuning.',
 690000, 
 true, 
 'https://images.unsplash.com/photo-1551434678-e076c223a692'),

-- DevOps
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 
 'Docker & Kubernetes cho Developers', 
 'docker-kubernetes-devops',
 'Container hóa ứng dụng với Docker và orchestration với Kubernetes. Từ cơ bản đến production deployment.',
 990000, 
 true, 
 'https://images.unsplash.com/photo-1605745341112-85968b19335b'),

-- Data Science
((SELECT id FROM users WHERE email = 'teacher2@test.com'), 
 'Data Science với Python', 
 'data-science-python',
 'Phân tích dữ liệu và Data Science với Python. Pandas, NumPy, Matplotlib, Scikit-learn và nhiều thư viện khác.',
 850000, 
 true, 
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'),

-- Full Stack
((SELECT id FROM users WHERE email = 'teacher1@test.com'), 
 'MERN Stack - Full Stack Development', 
 'mern-stack-fullstack',
 'Xây dựng ứng dụng web Full Stack với MongoDB, Express, React, và Node.js. Dự án thực tế từ đầu đến cuối.',
 1100000, 
 true, 
 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4'),

-- Blockchain
((SELECT id FROM users WHERE email = 'teacher2@test.com'), 
 'Blockchain & Smart Contracts', 
 'blockchain-smart-contracts',
 'Tìm hiểu về Blockchain, Ethereum, và lập trình Smart Contracts với Solidity.',
 1300000, 
 true, 
 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0')
ON CONFLICT (slug) DO NOTHING;

-- ==== COURSE TAGS ====
INSERT INTO course_tags (course_id, tag_id) VALUES
-- Python AI & ML
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), (SELECT id FROM tags WHERE name = 'AI')),
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), (SELECT id FROM tags WHERE name = 'Machine Learning')),
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), (SELECT id FROM tags WHERE name = 'Python')),
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), (SELECT id FROM tags WHERE name = 'Data Science')),

-- Deep Learning TensorFlow
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), (SELECT id FROM tags WHERE name = 'Deep Learning')),
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), (SELECT id FROM tags WHERE name = 'AI')),
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), (SELECT id FROM tags WHERE name = 'Python')),

-- Flutter
((SELECT id FROM courses WHERE slug = 'flutter-mobile-dev'), (SELECT id FROM tags WHERE name = 'Flutter')),
((SELECT id FROM courses WHERE slug = 'flutter-mobile-dev'), (SELECT id FROM tags WHERE name = 'Mobile Development')),

-- React Native
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), (SELECT id FROM tags WHERE name = 'React Native')),
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), (SELECT id FROM tags WHERE name = 'Mobile Development')),
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), (SELECT id FROM tags WHERE name = 'JavaScript')),

-- MongoDB
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), (SELECT id FROM tags WHERE name = 'MongoDB')),
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), (SELECT id FROM tags WHERE name = 'NoSQL')),
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), (SELECT id FROM tags WHERE name = 'Database')),

-- PostgreSQL
((SELECT id FROM courses WHERE slug = 'postgresql-advanced'), (SELECT id FROM tags WHERE name = 'SQL')),
((SELECT id FROM courses WHERE slug = 'postgresql-advanced'), (SELECT id FROM tags WHERE name = 'Database')),

-- Docker & Kubernetes
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), (SELECT id FROM tags WHERE name = 'Docker')),
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), (SELECT id FROM tags WHERE name = 'Kubernetes')),
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), (SELECT id FROM tags WHERE name = 'DevOps')),

-- Data Science
((SELECT id FROM courses WHERE slug = 'data-science-python'), (SELECT id FROM tags WHERE name = 'Data Science')),
((SELECT id FROM courses WHERE slug = 'data-science-python'), (SELECT id FROM tags WHERE name = 'Python')),

-- MERN Stack
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), (SELECT id FROM tags WHERE name = 'Full Stack')),
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), (SELECT id FROM tags WHERE name = 'JavaScript')),
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), (SELECT id FROM tags WHERE name = 'Web Development')),
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), (SELECT id FROM tags WHERE name = 'MongoDB')),

-- Blockchain
((SELECT id FROM courses WHERE slug = 'blockchain-smart-contracts'), (SELECT id FROM tags WHERE name = 'Blockchain'))
ON CONFLICT (course_id, tag_id) DO NOTHING;

-- ==== MODULES ====

-- Python AI & ML Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), 'Python Cơ bản cho AI', 1),
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), 'Machine Learning Algorithms', 2),
((SELECT id FROM courses WHERE slug = 'python-ai-ml'), 'Neural Networks & Deep Learning', 3);

-- Deep Learning TensorFlow Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), 'TensorFlow Basics', 1),
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), 'Convolutional Neural Networks', 2),
((SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow'), 'Recurrent Neural Networks', 3);

-- Flutter Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'flutter-mobile-dev'), 'Flutter Fundamentals', 1),
((SELECT id FROM courses WHERE slug = 'flutter-mobile-dev'), 'State Management & Navigation', 2),
((SELECT id FROM courses WHERE slug = 'flutter-mobile-dev'), 'Deploy to Production', 3);

-- React Native Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), 'React Native Basics', 1),
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), 'Navigation & API Integration', 2),
((SELECT id FROM courses WHERE slug = 'react-native-mobile'), 'Publishing Apps', 3);

-- MongoDB Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), 'MongoDB Fundamentals', 1),
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), 'Advanced Queries & Aggregation', 2),
((SELECT id FROM courses WHERE slug = 'mongodb-complete'), 'MongoDB with Node.js', 3);

-- PostgreSQL Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'postgresql-advanced'), 'Advanced SQL Queries', 1),
((SELECT id FROM courses WHERE slug = 'postgresql-advanced'), 'Performance Optimization', 2);

-- Docker & Kubernetes Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), 'Docker Essentials', 1),
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), 'Kubernetes Fundamentals', 2),
((SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops'), 'Production Deployment', 3);

-- Data Science Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'data-science-python'), 'Python for Data Analysis', 1),
((SELECT id FROM courses WHERE slug = 'data-science-python'), 'Data Visualization', 2),
((SELECT id FROM courses WHERE slug = 'data-science-python'), 'Machine Learning Basics', 3);

-- MERN Stack Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), 'MongoDB & Express Backend', 1),
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), 'React Frontend', 2),
((SELECT id FROM courses WHERE slug = 'mern-stack-fullstack'), 'Full Stack Integration', 3);

-- Blockchain Modules
INSERT INTO modules (course_id, title, position) VALUES
((SELECT id FROM courses WHERE slug = 'blockchain-smart-contracts'), 'Blockchain Fundamentals', 1),
((SELECT id FROM courses WHERE slug = 'blockchain-smart-contracts'), 'Solidity Programming', 2);

-- ==== LESSONS ====

-- Python AI & ML Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: Python Cơ bản
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 1), 'Giới thiệu về AI và Machine Learning', 1, 420, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 1), 'Python Libraries: NumPy và Pandas', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 1), 'Data Preprocessing', 3, 540, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 1), 'Feature Engineering', 4, 620, false),

-- Module 2: ML Algorithms
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 2), 'Linear Regression', 1, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 2), 'Logistic Regression', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 2), 'Decision Trees và Random Forest', 3, 820, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 2), 'Support Vector Machines', 4, 740, false),

-- Module 3: Neural Networks
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 3), 'Neural Networks Basics', 1, 920, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 3), 'Backpropagation Algorithm', 2, 840, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ai-ml') AND position = 3), 'Deep Learning with Keras', 3, 980, false);

-- Deep Learning TensorFlow Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: TensorFlow Basics
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 1), 'TensorFlow Introduction', 1, 480, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 1), 'Tensors and Operations', 2, 620, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 1), 'Building Your First Model', 3, 720, false),

-- Module 2: CNN
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 2), 'Convolutional Layers', 1, 840, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 2), 'Image Classification Project', 2, 1020, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 2), 'Transfer Learning', 3, 920, false),

-- Module 3: RNN
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 3), 'Recurrent Neural Networks', 1, 780, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 3), 'LSTM và GRU', 2, 880, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'deep-learning-tensorflow') AND position = 3), 'Text Generation với RNN', 3, 940, false);

-- Flutter Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: Fundamentals
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 1), 'Flutter Setup và First App', 1, 520, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 1), 'Widgets và Layout', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 1), 'Stateful vs Stateless Widgets', 3, 640, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 1), 'Flutter Material Design', 4, 580, false),

-- Module 2: State Management
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 2), 'Provider State Management', 1, 820, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 2), 'Navigation và Routing', 2, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 2), 'API Integration', 3, 880, false),

-- Module 3: Deploy
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 3), 'Build for Android', 1, 620, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 3), 'Build for iOS', 2, 640, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'flutter-mobile-dev') AND position = 3), 'Publishing to Stores', 3, 720, false);

-- MongoDB Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: Fundamentals
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 1), 'MongoDB Installation và Setup', 1, 380, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 1), 'CRUD Operations', 2, 620, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 1), 'Schema Design', 3, 720, false),

-- Module 2: Advanced
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 2), 'Aggregation Pipeline', 1, 840, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 2), 'Indexes và Performance', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 2), 'Transactions', 3, 620, false),

-- Module 3: With Node.js
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 3), 'Mongoose ODM', 1, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mongodb-complete') AND position = 3), 'Building REST API', 2, 880, false);

-- Docker & Kubernetes Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: Docker
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 1), 'Docker Introduction', 1, 420, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 1), 'Dockerfile và Images', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 1), 'Docker Compose', 3, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 1), 'Docker Networking', 4, 620, false),

-- Module 2: Kubernetes
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 2), 'Kubernetes Architecture', 1, 540, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 2), 'Pods và Deployments', 2, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 2), 'Services và Ingress', 3, 820, false),

-- Module 3: Production
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 3), 'CI/CD Pipeline', 1, 920, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'docker-kubernetes-devops') AND position = 3), 'Monitoring và Logging', 2, 780, false);

-- MERN Stack Lessons
INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass) VALUES
-- Module 1: Backend
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 1), 'Express.js Setup', 1, 480, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 1), 'MongoDB Integration', 2, 620, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 1), 'REST API Development', 3, 840, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 1), 'Authentication với JWT', 4, 920, false),

-- Module 2: Frontend
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 2), 'React Project Setup', 1, 520, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 2), 'React Router', 2, 620, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 2), 'State Management với Redux', 3, 880, false),

-- Module 3: Integration
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 3), 'Connecting Frontend to Backend', 1, 720, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 3), 'File Upload Features', 2, 680, false),
((SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'mern-stack-fullstack') AND position = 3), 'Deployment trên Heroku', 3, 820, false);

-- ==== LESSON ASSETS (Sample Videos for some lessons) ====
INSERT INTO lesson_assets (lesson_id, asset_kind, url, position) VALUES
-- Python AI ML
((SELECT id FROM lessons WHERE title = 'Giới thiệu về AI và Machine Learning' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=ukzFI9rgwfU', 1),
((SELECT id FROM lessons WHERE title = 'Python Libraries: NumPy và Pandas' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=ZyhVh-qRZPA', 1),
((SELECT id FROM lessons WHERE title = 'Linear Regression' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=7ArmBVF2dCs', 1),

-- Flutter
((SELECT id FROM lessons WHERE title = 'Flutter Setup và First App' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=1xipg02Wu8s', 1),
((SELECT id FROM lessons WHERE title = 'Widgets và Layout' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=78JYgJUMqt8', 1),

-- MongoDB
((SELECT id FROM lessons WHERE title = 'MongoDB Installation và Setup' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=-56x56UppqQ', 1),
((SELECT id FROM lessons WHERE title = 'CRUD Operations' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=ofme2o29ngU', 1),

-- Docker
((SELECT id FROM lessons WHERE title = 'Docker Introduction' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=pg19Z8LL06w', 1),
((SELECT id FROM lessons WHERE title = 'Dockerfile và Images' LIMIT 1), 'VIDEO', 'https://www.youtube.com/watch?v=LQjaJINkQXY', 1);

