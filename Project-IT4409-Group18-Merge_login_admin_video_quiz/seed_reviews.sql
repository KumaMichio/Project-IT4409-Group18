-- Thêm dữ liệu đánh giá từ học viên

-- Xóa reviews cũ nếu có (để tránh conflict)
-- DELETE FROM course_reviews WHERE course_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13);

-- Thêm thêm nhiều reviews cho khóa học hiện có
-- Mỗi học viên chỉ có thể review 1 lần cho mỗi khóa học
INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at) VALUES
-- Khóa học 1: Cơ sở dữ liệu - student 2
(1, 2, 5, 'Khóa học rất chi tiết và dễ hiểu. Tôi đã nắm vững các khái niệm về database sau khóa học này.', NOW() - INTERVAL '5 days'),

-- Khóa học 2: Backend Node.js - student 1, 2 (đã có student 2 rating 4 ở seed.sql)
(2, 1, 5, 'Giảng viên dạy rất tốt. Các ví dụ thực tế giúp tôi hiểu rõ hơn về Node.js và Express.', NOW() - INTERVAL '4 days'),

-- Khóa học 3: React.js - student 2 (đã có student 1 rating 5 ở seed.sql)
(3, 2, 5, 'Khóa học React.js tốt nhất tôi từng tham gia. Giảng viên giải thích rất rõ ràng và dễ hiểu.', NOW() - INTERVAL '7 days'),

-- Khóa học 5: JavaScript - student 2
(5, 2, 5, 'JavaScript từ cơ bản đến nâng cao được giảng dạy rất có hệ thống. Rất đáng để học!', NOW() - INTERVAL '5 days'),

-- Khóa học 6: Git GitHub - student 2
(6, 2, 4, 'Git và GitHub là kỹ năng quan trọng và khóa học này dạy rất tốt. Chỉ có điều hơi ngắn.', NOW() - INTERVAL '4 days'),

-- Khóa học 7: TypeScript - student 2
(7, 2, 5, 'TypeScript giúp code của tôi tốt hơn rất nhiều. Khóa học này giải thích rõ ràng về type system.', NOW() - INTERVAL '3 days'),

-- Khóa học 8: Next.js - student 1
(8, 1, 5, 'Next.js 14 với App Router được giảng dạy rất chi tiết. Best course về Next.js!', NOW() - INTERVAL '2 days'),

-- Khóa học 9: Docker Kubernetes - student 2
(9, 2, 4, 'Docker và K8s là những công nghệ phức tạp nhưng giảng viên đã đơn giản hóa rất tốt.', NOW() - INTERVAL '5 days'),

-- Khóa học 10: Python Data Science - student 2
(10, 2, 5, 'Khóa học Python cho Data Science rất hay. Pandas và NumPy được giảng dạy rất kỹ.', NOW() - INTERVAL '6 days'),

-- Khóa học 11: MongoDB - student 1
(11, 1, 5, 'MongoDB được giải thích rất rõ ràng. Tôi đã hiểu được NoSQL và khi nào nên dùng.', NOW() - INTERVAL '4 days'),

-- Khóa học 12: AWS Cloud - student 2
(12, 2, 4, 'AWS là dịch vụ rộng lớn và khóa học này cover các service cơ bản rất tốt.', NOW() - INTERVAL '3 days'),

-- Khóa học 13: RESTful API - student 1
(13, 1, 4, 'Best practices về API design được trình bày rất tốt. Rất hữu ích cho backend developer.', NOW() - INTERVAL '2 days')

ON CONFLICT (course_id, student_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  created_at = EXCLUDED.created_at;

-- Thông báo
SELECT 'Đã thêm dữ liệu đánh giá mới thành công!' as message,
       (SELECT COUNT(*) FROM course_reviews) as total_reviews,
       (SELECT ROUND(AVG(rating)::numeric, 2) FROM course_reviews) as average_rating;
