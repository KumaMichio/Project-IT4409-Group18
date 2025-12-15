-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS online_course;
CREATE DATABASE online_course;
\c online_course;

-- Ensure UTF-8 encoding
SET client_encoding TO 'UTF8';

-- Tạo extension cho database
CREATE EXTENSION IF NOT EXISTS citext;

-- ==== ENUMs ==== 
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('VNPAY', 'MOMO', 'OTHER', 'SEPAY');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('VIDEO', 'PDF', 'LINK');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rec_feedback_type AS ENUM ('HIDE', 'PRIORITIZE', 'NOT_INTERESTED');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==== USERS & AUTH ==== 
-- Tạo bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           CITEXT UNIQUE NOT NULL,
  password_hash   TEXT,                 
  full_name       TEXT NOT NULL,
  role            role_type NOT NULL DEFAULT 'STUDENT',
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tạo bảng auth_providers (OAuth)
CREATE TABLE IF NOT EXISTS auth_providers (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,            
  provider_uid  TEXT NOT NULL,
  access_token  TEXT,
  refresh_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);

-- Tạo bảng hồ sơ giảng viên
CREATE TABLE IF NOT EXISTS instructor_profiles (
  user_id     BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio         TEXT,
  headline    TEXT,
  payout_info JSONB
);

-- Tạo bảng hồ sơ học viên
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id     BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  about       TEXT
);

-- ==== TAXONOMY ==== 
-- Tạo bảng tags (nhãn)
CREATE TABLE IF NOT EXISTS tags (
  id     BIGSERIAL PRIMARY KEY,
  name   CITEXT UNIQUE NOT NULL
);

-- ==== COURSES ==== 
-- Tạo bảng courses (khóa học)
CREATE TABLE IF NOT EXISTS courses (
  id              BIGSERIAL PRIMARY KEY,
  instructor_id   BIGINT NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,  
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

-- Index cho bảng courses
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);

-- Tạo bảng course_tags (liên kết khóa học với tags)
CREATE TABLE IF NOT EXISTS course_tags (
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id    BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- ==== CONTENT HIERARCHY ==== 
-- Tạo bảng modules (mô-đun trong khóa học)
CREATE TABLE IF NOT EXISTS modules (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL, 
  UNIQUE(course_id, position)
);

-- Tạo bảng lessons (bài học trong khóa học)
CREATE TABLE IF NOT EXISTS lessons (
  id          BIGSERIAL PRIMARY KEY,
  module_id   BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL,
  duration_s  INTEGER,          
  requires_quiz_pass BOOLEAN NOT NULL DEFAULT FALSE, 
  UNIQUE(module_id, position)
);

-- Tạo bảng lesson_assets (tài liệu liên kết với bài học)
CREATE TABLE IF NOT EXISTS lesson_assets (
  id          BIGSERIAL PRIMARY KEY,
  lesson_id   BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  asset_kind  asset_type NOT NULL,
  url         TEXT NOT NULL,
  meta        JSONB,
  position    INTEGER NOT NULL DEFAULT 1
);

-- ==== ENROLLMENT & PAYMENTS ==== 
-- Tạo bảng enrollments (đăng ký khóa học của học viên)
CREATE TABLE IF NOT EXISTS enrollments (
  id             BIGSERIAL PRIMARY KEY,
  course_id      BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         enrollment_status NOT NULL DEFAULT 'ACTIVE',
  enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ,
  UNIQUE(course_id, student_id)
);

-- Index cho bảng enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);

-- Tạo bảng orders (đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number      TEXT UNIQUE NOT NULL,
  total_amount_cents INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'VND',
  status            order_status NOT NULL DEFAULT 'PENDING',
  payment_provider  payment_provider,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ 
);

-- Index cho bảng orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Tạo bảng order_items (chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
  id         BIGSERIAL PRIMARY KEY,
  order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, course_id)
);

-- Index cho bảng order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

-- Tạo bảng payments (thanh toán)
CREATE TABLE IF NOT EXISTS payments (
  id                BIGSERIAL PRIMARY KEY,
  enrollment_id     BIGINT REFERENCES enrollments(id) ON DELETE CASCADE,
  order_id          BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  provider          payment_provider NOT NULL,
  provider_txn_id   TEXT, 
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'VND',
  status            payment_status NOT NULL,
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((enrollment_id IS NOT NULL) OR (order_id IS NOT NULL))
);

-- Index cho bảng payments
CREATE INDEX IF NOT EXISTS idx_payments_enroll ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- ==== QUIZ ==== 
-- Tạo bảng quizzes (bài kiểm tra)
CREATE TABLE IF NOT EXISTS quizzes (
  id          BIGSERIAL PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id   BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  time_limit_s INTEGER,
  attempts_allowed INTEGER,
  pass_score  INTEGER NOT NULL DEFAULT 60
);

-- Tạo bảng quiz_questions (câu hỏi trong bài kiểm tra)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          BIGSERIAL PRIMARY KEY,
  quiz_id     BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  qtype       question_type NOT NULL,
  position    INTEGER NOT NULL,
  points      INTEGER NOT NULL DEFAULT 1,
  UNIQUE (quiz_id, position)
);

-- Tạo bảng quiz_options (tùy chọn câu trả lời trong câu hỏi)
CREATE TABLE IF NOT EXISTS quiz_options (
  id            BIGSERIAL PRIMARY KEY,
  question_id   BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  position      INTEGER NOT NULL,
  UNIQUE (question_id, position)
);

-- Tạo bảng quiz_attempts (lần thi kiểm tra)
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

-- Tạo bảng quiz_attempt_answers (câu trả lời của học viên trong bài kiểm tra)
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id            BIGSERIAL PRIMARY KEY,
  attempt_id    BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id   BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids BIGINT[], 
  short_text    TEXT, 
  is_correct    BOOLEAN,
  UNIQUE (attempt_id, question_id)
);

-- ==== REVIEWS & FEEDBACK ==== 
-- Tạo bảng course_reviews (đánh giá khóa học)
CREATE TABLE IF NOT EXISTS course_reviews (
  id           BIGSERIAL PRIMARY KEY,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

-- Tạo bảng instructor_reviews (đánh giá giảng viên)
CREATE TABLE IF NOT EXISTS instructor_reviews (
  id           BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instructor_id, student_id)
);

-- Tạo bảng dm_threads (tin nhắn giữa giảng viên và học viên)
CREATE TABLE IF NOT EXISTS dm_threads (
  id           BIGSERIAL PRIMARY KEY,
  student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instructor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, instructor_id)
);

-- Index cho bảng dm_threads
CREATE INDEX IF NOT EXISTS idx_dm_threads_student_id ON dm_threads(student_id);
CREATE INDEX IF NOT EXISTS idx_dm_threads_instructor_id ON dm_threads(instructor_id);

-- Tạo bảng course_channels (channel chat cho mỗi course - UC13)
CREATE TABLE IF NOT EXISTS course_channels (
  id           BIGSERIAL PRIMARY KEY,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'General',
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id)
);

-- Index cho bảng course_channels
CREATE INDEX IF NOT EXISTS idx_course_channels_course_id ON course_channels(course_id);

-- Tạo bảng messages (tin nhắn trong course channel - UC13)
CREATE TABLE IF NOT EXISTS messages (
  id          BIGSERIAL PRIMARY KEY,
  channel_id  BIGINT NOT NULL REFERENCES course_channels(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  edited_at   TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index cho bảng messages
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;

-- Tạo bảng dm_messages (tin nhắn trong cuộc trò chuyện trực tiếp - UC14)
CREATE TABLE IF NOT EXISTS dm_messages (
  id          BIGSERIAL PRIMARY KEY,
  thread_id   BIGINT NOT NULL REFERENCES dm_threads(id) ON DELETE CASCADE,
  sender_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  edited_at   TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index cho bảng dm_messages
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_id ON dm_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_sender_id ON dm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_created_at ON dm_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_messages_is_read ON dm_messages(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_dm_messages_deleted_at ON dm_messages(deleted_at) WHERE deleted_at IS NULL;

-- ==== RECOMMENDATIONS ==== 
-- Tạo bảng recommendations (gợi ý khóa học)
CREATE TABLE IF NOT EXISTS recommendations (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  reason       TEXT,                
  shown_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, shown_at)
);

-- Tạo bảng rec_feedback (phản hồi gợi ý khóa học)
CREATE TABLE IF NOT EXISTS rec_feedback (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  feedback     rec_feedback_type NOT NULL,  
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, feedback)
);

-- ==== ADMIN / AUDIT (tối thiểu) ==== 
-- Tạo bảng audit_logs (lịch sử quản trị)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,         
  target_type TEXT NOT NULL,         
  target_id   BIGINT,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==== SYSTEM SETTINGS ==== 
-- Tạo bảng system_settings (cấu hình hệ thống)
CREATE TABLE IF NOT EXISTS system_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration script to create cart tables
-- Run this script if you get "relation 'carts' does not exist" error

-- ==== CART (SHOPPING CART) ====
CREATE TABLE IF NOT EXISTS carts (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

CREATE TABLE IF NOT EXISTS cart_items (
  id         BIGSERIAL PRIMARY KEY,
  cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_course_id ON cart_items(course_id);



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
