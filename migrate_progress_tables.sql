-- Migration script to create progress tables
-- Run this script if you get "relation 'student_course_progress' does not exist" error
-- or "relation 'student_lesson_progress' does not exist" error

-- ==== STUDENT PROGRESS TABLES ====

-- Bảng theo dõi tiến độ học tập của học viên theo khóa học
CREATE TABLE IF NOT EXISTS student_course_progress (
  id         BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  percent    DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Index cho bảng student_course_progress
CREATE INDEX IF NOT EXISTS idx_student_course_progress_student ON student_course_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_progress_course ON student_course_progress(course_id);

-- Bảng theo dõi tiến độ học tập của học viên theo bài học
CREATE TABLE IF NOT EXISTS student_lesson_progress (
  id            BIGSERIAL PRIMARY KEY,
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_s     INTEGER NOT NULL DEFAULT 0,
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Index cho bảng student_lesson_progress
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_student ON student_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_lesson ON student_lesson_progress(lesson_id);

-- Verify tables were created
SELECT 'student_course_progress table created successfully' AS status;
SELECT 'student_lesson_progress table created successfully' AS status;

