-- (A) Người dùng - xác thực
--    Gồm các bảng users, auth_providers, instructor_profiles, student_profiles, tags, courses_tags
-- (B) khóa học & nội dung
--    Gồm các bảng courses, modules, lessons, lesson_assets, course_channels
-- (C) học viên & thanh toán
--    Gồm các bảng enrollments, payments, certificates
-- (D) bài kiểm tra & tiến độ
--    Gồm các bảng quizzes, quiz_questions, quiz_options, quiz_attempts, quiz_attempt_answers, student_lesson_progress, student_course_progress
-- (E) đánh giá & phản hồi
--    Gồm các bảng course_reviews, instructor_reviews, messages, message_attachments, message_mentions, dm_threads, dm_messages
-- (F) khuyến nghị & quản trị
--    Gồm các bảng recommendations, rec_feedback, audit_logs


-- Mối quan hệ (Entity Relationship - ER):

--  ===== USERS & PROFILES =====
-- users (1) --- (1) instructor_profiles
-- users (1) --- (1) student_profiles
-- users (1) --- (N) auth_providers
-- users (1) --- (N) courses (instructor_id)
-- users (1) --- (N) enrollments (student_id)
-- users (1) --- (N) payments (via enrollments)
-- users (1) --- (N) course_reviews (student_id)
-- users (1) --- (N) instructor_reviews (student_id)
-- users (1) --- (N) recommendations
-- users (1) --- (N) rec_feedback
-- users (1) --- (N) audit_logs (actor_id)

--  ===== COURSES & CONTENT =====
-- courses (1) --- (N) modules
-- modules (1) --- (N) lessons
-- lessons (1) --- (N) lesson_assets
-- courses (N) --- (N) tags (qua course_tags)
-- courses (1) --- (N) quizzes
-- courses (1) --- (N) course_channels
-- lessons (1) --- (N) quizzes
-- course_channels (1) --- (N) messages
-- messages (1) --- (N) message_attachments
-- messages (1) --- (N) message_mentions
-- dm_threads (1) --- (N) dm_messages

--  ===== ENROLLMENTS & PAYMENTS =====
-- courses (1) --- (N) enrollments
-- enrollments (1) --- (N) payments
-- enrollments (1) --- (1) certificates
-- users (1) --- (N) student_lesson_progress
-- users (1) --- (N) student_course_progress
-- quizzes (1) --- (N) quiz_questions
-- quiz_questions (1) --- (N) quiz_options
-- quizzes (1) --- (N) quiz_attempts
-- quiz_attempts (1) --- (N) quiz_attempt_answers
-- users (1) --- (N) course_reviews
-- users (1) --- (N) instructor_reviews
-- users (1) --- (N) recommendations
-- users (1) --- (N) rec_feedback
-- users (1) --- (N) audit_logs
--  ============================

-- Tạo extension cho database
CREATE EXTENSION IF NOT EXISTS citext;

-- ==== ENUMs ====
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('ADMIN','INSTRUCTOR','STUDENT');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('VNPAY','MOMO','OTHER');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING','PAID','FAILED','REFUNDED','CANCELLED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('ACTIVE','EXPIRED','CANCELLED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('VIDEO','PDF','LINK');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('SINGLE_CHOICE','MULTI_CHOICE','TRUE_FALSE','SHORT_TEXT');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rec_feedback_type AS ENUM ('HIDE','PRIORITIZE','NOT_INTERESTED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==== USERS & AUTH ====
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           CITEXT UNIQUE NOT NULL,
  password_hash   TEXT,                 -- null nếu đăng nhập thuần OAuth
  full_name       TEXT NOT NULL,
  role            role_type NOT NULL DEFAULT 'STUDENT',
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_providers (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,            -- 'google','github',...
  provider_uid  TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);

CREATE TABLE IF NOT EXISTS instructor_profiles (
  user_id     BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio         TEXT,
  headline    TEXT,
  payout_info JSONB
);

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id     BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  about       TEXT
);

-- ==== TAXONOMY ====
CREATE TABLE IF NOT EXISTS tags (
  id     BIGSERIAL PRIMARY KEY,
  name   CITEXT UNIQUE NOT NULL
);

-- ==== COURSES ====
CREATE TABLE IF NOT EXISTS courses (
  id              BIGSERIAL PRIMARY KEY,
  instructor_id   BIGINT NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,  -- tạo URL
  description     TEXT,
  price_cents     INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'VND',
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  thumbnail_url   TEXT,
  lang            TEXT DEFAULT 'vi',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);

CREATE TABLE IF NOT EXISTS course_tags (
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id    BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- ==== CONTENT HIERARCHY ====
CREATE TABLE IF NOT EXISTS modules (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL, -- 1..n
  UNIQUE(course_id, position)
);

CREATE TABLE IF NOT EXISTS lessons (
  id          BIGSERIAL PRIMARY KEY,
  module_id   BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL,
  duration_s  INTEGER,          -- tổng thời lượng video (nếu có)
  requires_quiz_pass BOOLEAN NOT NULL DEFAULT FALSE, -- có yêu cầu qua quiz mới mở khoá
  UNIQUE(module_id, position)
);
-- bảng lesson_assets để lưu trữ video, tài liệu, link,...
CREATE TABLE IF NOT EXISTS lesson_assets (
  id          BIGSERIAL PRIMARY KEY,
  lesson_id   BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  asset_kind  asset_type NOT NULL,
  url         TEXT NOT NULL,
  meta        JSONB,
  position    INTEGER NOT NULL DEFAULT 1
);

-- ==== ENROLLMENT & PAYMENTS ====
CREATE TABLE IF NOT EXISTS enrollments (
  id             BIGSERIAL PRIMARY KEY,
  course_id      BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         enrollment_status NOT NULL DEFAULT 'ACTIVE',
  enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ,
  UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);

CREATE TABLE IF NOT EXISTS payments (
  id                BIGSERIAL PRIMARY KEY,
  enrollment_id     BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  provider          payment_provider NOT NULL,
  provider_txn_id   TEXT, -- ID giao dịch từ nhà cung cấp
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'VND',
  status            payment_status NOT NULL,
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_enroll ON payments(enrollment_id);

-- (Tuỳ chọn) bảng refunds nếu cần tách:
-- CREATE TABLE refunds( ... REFERENCES payments(id) ... );

-- ==== PROGRESS & CERTIFICATES ====
CREATE TABLE IF NOT EXISTS student_lesson_progress (
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_s     INTEGER NOT NULL DEFAULT 0, -- 
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS student_course_progress (
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  percent       NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id           BIGSERIAL PRIMARY KEY,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  cert_code    TEXT UNIQUE NOT NULL
);

-- ==== QUIZ ====
CREATE TABLE IF NOT EXISTS quizzes (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id   BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  time_limit_s INTEGER,
  attempts_allowed INTEGER,
  pass_score  INTEGER NOT NULL DEFAULT 60
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id          BIGSERIAL PRIMARY KEY,
  quiz_id     BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  qtype       question_type NOT NULL,
  position    INTEGER NOT NULL,
  points      INTEGER NOT NULL DEFAULT 1,
  UNIQUE (quiz_id, position)
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id            BIGSERIAL PRIMARY KEY,
  question_id   BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  position      INTEGER NOT NULL,
  UNIQUE (question_id, position)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            BIGSERIAL PRIMARY KEY,
  quiz_id       BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at  TIMESTAMPTZ,
  score         INTEGER,
  passed        BOOLEAN,
  attempt_no    INTEGER NOT NULL,
  UNIQUE (quiz_id, student_id, attempt_no)
);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id            BIGSERIAL PRIMARY KEY,
  attempt_id    BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id   BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids BIGINT[],   -- cho MULTI_CHOICE
  short_text    TEXT, 
  is_correct    BOOLEAN,
  UNIQUE (attempt_id, question_id)
);

-- ==== REVIEWS & FEEDBACK ====
CREATE TABLE IF NOT EXISTS course_reviews (
  id           BIGSERIAL PRIMARY KEY,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

CREATE TABLE IF NOT EXISTS instructor_reviews (
  id           BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instructor_id, student_id)
);

-- DM giữa sinh viên và giảng viên 
CREATE TABLE IF NOT EXISTS dm_threads (
  id           BIGSERIAL PRIMARY KEY,
  student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instructor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, instructor_id)
);

-- ==== RECOMMENDATIONS ====
CREATE TABLE IF NOT EXISTS recommendations (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  reason       TEXT,                -- vì sao được gợi ý (topic, trending, CF, …)
  shown_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, shown_at)
);

CREATE TABLE IF NOT EXISTS rec_feedback (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  feedback     rec_feedback_type NOT NULL,  -- HIDE/PRIORITIZE/NOT_INTERESTED
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, feedback)
);

-- ==== ADMIN / AUDIT (tối thiểu) ====
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,         -- 'COURSE_APPROVE','USER_BAN',...
  target_type TEXT NOT NULL,         -- 'course','user','payment',...
  target_id   BIGINT,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==== SYSTEM SETTINGS ====
CREATE TABLE IF NOT EXISTS system_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

