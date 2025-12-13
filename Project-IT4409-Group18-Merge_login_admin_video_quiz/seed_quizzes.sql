-- Thêm dữ liệu quiz cho các bài học

-- Xóa dữ liệu cũ nếu có
DELETE FROM quiz_attempt_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts);
DELETE FROM quiz_attempts;
DELETE FROM quiz_options;
DELETE FROM quiz_questions;
DELETE FROM quizzes;

-- Reset sequences
ALTER SEQUENCE quizzes_id_seq RESTART WITH 1;
ALTER SEQUENCE quiz_questions_id_seq RESTART WITH 1;
ALTER SEQUENCE quiz_options_id_seq RESTART WITH 1;

-- Quiz cho Khóa học 1: Cơ sở dữ liệu
-- Bài 1.1: Giới thiệu về Database
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(1, 1, 'Quiz: Giới thiệu Database', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(1, 'Database là gì?', 'SINGLE_CHOICE', 1, 1),
(1, 'DBMS viết tắt của cụm từ nào?', 'SINGLE_CHOICE', 2, 1),
(1, 'Lợi ích chính của việc sử dụng database là gì?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(1, 'Một tập hợp dữ liệu có tổ chức', true, 1),
(1, 'Một ngôn ngữ lập trình', false, 2),
(1, 'Một loại phần mềm đồ họa', false, 3),
(1, 'Một công cụ thiết kế web', false, 4),
-- Câu 2
(2, 'Database Management System', true, 1),
(2, 'Data Backup Management Service', false, 2),
(2, 'Digital Base Management System', false, 3),
(2, 'Database Memory System', false, 4),
-- Câu 3
(3, 'Quản lý dữ liệu tập trung', true, 1),
(3, 'Bảo mật dữ liệu tốt hơn', true, 2),
(3, 'Tăng tốc độ xử lý', false, 3),
(3, 'Giảm chi phí phần cứng', false, 4);

-- Bài 1.2: SQL cơ bản
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(1, 2, 'Quiz: SQL Cơ bản', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(2, 'Câu lệnh nào dùng để truy vấn dữ liệu?', 'SINGLE_CHOICE', 1, 1),
(2, 'WHERE dùng để làm gì?', 'SINGLE_CHOICE', 2, 1),
(2, 'Các câu lệnh SQL nào thuộc DML?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(4, 'SELECT', true, 1),
(4, 'INSERT', false, 2),
(4, 'UPDATE', false, 3),
(4, 'DELETE', false, 4),
-- Câu 2
(5, 'Lọc dữ liệu theo điều kiện', true, 1),
(5, 'Sắp xếp dữ liệu', false, 2),
(5, 'Nhóm dữ liệu', false, 3),
(5, 'Join bảng', false, 4),
-- Câu 3
(6, 'SELECT', false, 1),
(6, 'INSERT', true, 2),
(6, 'UPDATE', true, 3),
(6, 'DELETE', true, 4);

-- Quiz cho Khóa học 2: Backend với Node.js
-- Bài 2.1: Cài đặt Node.js
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(2, 4, 'Quiz: Node.js Cơ bản', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(3, 'Node.js chạy trên engine nào?', 'SINGLE_CHOICE', 1, 1),
(3, 'npm là gì?', 'SINGLE_CHOICE', 2, 1),
(3, 'Node.js có thể làm gì?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(7, 'V8 Engine', true, 1),
(7, 'SpiderMonkey', false, 2),
(7, 'Chakra', false, 3),
(7, 'JavaScriptCore', false, 4),
-- Câu 2
(8, 'Node Package Manager', true, 1),
(8, 'Network Protocol Manager', false, 2),
(8, 'Node Process Manager', false, 3),
(8, 'New Package Module', false, 4),
-- Câu 3
(9, 'Tạo REST API', true, 1),
(9, 'Xử lý file system', true, 2),
(9, 'Thiết kế giao diện', false, 3),
(9, 'Xây dựng real-time app', true, 4);

-- Bài 2.2: Express Framework
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(2, 5, 'Quiz: Express Framework', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(4, 'Express.js là gì?', 'SINGLE_CHOICE', 1, 1),
(4, 'Middleware trong Express dùng để làm gì?', 'SINGLE_CHOICE', 2, 1),
(4, 'HTTP methods phổ biến là gì?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(10, 'Web framework cho Node.js', true, 1),
(10, 'Database cho Node.js', false, 2),
(10, 'Template engine', false, 3),
(10, 'Testing framework', false, 4),
-- Câu 2
(11, 'Xử lý request/response', true, 1),
(11, 'Tạo database', false, 2),
(11, 'Render HTML', false, 3),
(11, 'Compress file', false, 4),
-- Câu 3
(12, 'GET', true, 1),
(12, 'POST', true, 2),
(12, 'PUT', true, 3),
(12, 'SEND', false, 4);

-- Quiz cho Khóa học 3: React.js
-- Bài 3.1: React Components
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(3, 7, 'Quiz: React Components', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(5, 'Component trong React là gì?', 'SINGLE_CHOICE', 1, 1),
(5, 'Props trong React dùng để làm gì?', 'SINGLE_CHOICE', 2, 1),
(5, 'Hook nào được dùng để quản lý state?', 'SINGLE_CHOICE', 3, 1);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(13, 'Khối xây dựng UI độc lập và tái sử dụng', true, 1),
(13, 'Một function JavaScript thông thường', false, 2),
(13, 'Một CSS class', false, 3),
(13, 'Một HTML element', false, 4),
-- Câu 2
(14, 'Truyền dữ liệu từ parent đến child component', true, 1),
(14, 'Lưu trữ state', false, 2),
(14, 'Gọi API', false, 3),
(14, 'Style component', false, 4),
-- Câu 3
(15, 'useState', true, 1),
(15, 'useEffect', false, 2),
(15, 'useContext', false, 3),
(15, 'useRef', false, 4);

-- Quiz cho Khóa học 5: JavaScript nâng cao
-- Bài 5.1: ES6 Features
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(5, 10, 'Quiz: ES6 Features', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(6, 'Arrow function khác function thông thường ở điểm nào?', 'SINGLE_CHOICE', 1, 1),
(6, 'Destructuring dùng để làm gì?', 'SINGLE_CHOICE', 2, 1),
(6, 'ES6 có những tính năng nào?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(16, 'Không có this riêng', true, 1),
(16, 'Chạy nhanh hơn', false, 2),
(16, 'Có thể truyền tham số', false, 3),
(16, 'Có thể return giá trị', false, 4),
-- Câu 2
(17, 'Trích xuất giá trị từ object/array', true, 1),
(17, 'Tạo object mới', false, 2),
(17, 'Xóa property', false, 3),
(17, 'Sắp xếp array', false, 4),
-- Câu 3
(18, 'Let và Const', true, 1),
(18, 'Arrow Functions', true, 2),
(18, 'Template Literals', true, 3),
(18, 'Eval function', false, 4);

-- Quiz cho Khóa học 6: Git và GitHub
INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score) VALUES
(6, 12, 'Quiz: Git Cơ bản', 600, 3, 70);

INSERT INTO quiz_questions (quiz_id, question, qtype, position, points) VALUES
(7, 'Git là gì?', 'SINGLE_CHOICE', 1, 1),
(7, 'Lệnh git commit dùng để làm gì?', 'SINGLE_CHOICE', 2, 1),
(7, 'Các lệnh Git cơ bản là gì?', 'MULTI_CHOICE', 3, 2);

INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES
-- Câu 1
(19, 'Hệ thống quản lý phiên bản phân tán', true, 1),
(19, 'Một ngôn ngữ lập trình', false, 2),
(19, 'Một text editor', false, 3),
(19, 'Một database', false, 4),
-- Câu 2
(20, 'Lưu thay đổi vào repository', true, 1),
(20, 'Tải code từ remote', false, 2),
(20, 'Xóa file', false, 3),
(20, 'Tạo branch mới', false, 4),
-- Câu 3
(21, 'git add', true, 1),
(21, 'git commit', true, 2),
(21, 'git push', true, 3),
(21, 'git install', false, 4);

-- Thông báo
SELECT 'Đã thêm dữ liệu quiz thành công!' as message,
       (SELECT COUNT(*) FROM quizzes) as total_quizzes,
       (SELECT COUNT(*) FROM quiz_questions) as total_questions;
