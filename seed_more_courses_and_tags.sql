-- ============================================
-- SEED MORE COURSES, MODULES, LESSONS & TAGS
-- ============================================
SET client_encoding TO 'UTF8';
BEGIN;


-- ==== TAGS ====
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

COMMIT;
