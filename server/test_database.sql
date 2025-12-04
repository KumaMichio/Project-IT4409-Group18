DROP DATABASE IF EXISTS online_course;
CREATE DATABASE online_course
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
    
\c online_course;

CREATE TABLE recommendation_feedback (
    feedback_id      BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    course_id        BIGINT NOT NULL,
    action           TEXT NOT NULL CHECK (action IN ('NOT_INTERESTED', 'PRIORITY', 'HIDE')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)   -- mỗi user 1 record / course
);


CREATE TABLE payments (
    payment_id    BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    course_id     BIGINT NOT NULL,
    amount        NUMERIC(12,2) NOT NULL,
    status        TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    paid_at       TIMESTAMPTZ,
    method        TEXT, -- VNPay / Momo
    transaction_id TEXT
);

CREATE TABLE activity_logs (
    log_id      BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    action      TEXT NOT NULL,        -- e.g. 'USER_LOGIN', 'COURSE_PURCHASED'
    detail      JSONB,                -- chứa thêm info (course_id, amount,...)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE system_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

/* ví dụ:
   ('maintenance_mode', 'ON'/'OFF')
*/

