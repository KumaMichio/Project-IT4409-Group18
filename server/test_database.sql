DROP DATABASE IF EXISTS online_course;

CREATE DATABASE online_course
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8';

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

INSERT INTO recommendation_feedback (user_id, course_id, action)
VALUES
    (1, 101, 'PRIORITY'),
    (1, 102, 'NOT_INTERESTED'),
    (2, 101, 'HIDE'),
    (3, 105, 'PRIORITY');

INSERT INTO payments (user_id, course_id, amount, status, paid_at, method, transaction_id)
VALUES
    (1, 101, 199000, 'PAID', NOW(), 'Momo', 'TXN001'),
    (1, 102, 299000, 'FAILED', NULL, 'VNPay', 'TXN002'),
    (2, 103, 159000, 'PENDING', NULL, NULL, NULL),
    (3, 104, 199000, 'PAID', NOW(), 'VNPay', 'TXN003');


INSERT INTO activity_logs (user_id, action, detail)
VALUES
    (1, 'USER_LOGIN', '{"ip": "192.168.1.10"}'),
    (1, 'COURSE_PURCHASED', '{"course_id": 101, "amount": 199000}'),
    (2, 'USER_LOGOUT', '{"duration": "25m"}'),
    (3, 'PAYMENT_FAILED', '{"course_id": 102, "reason": "Card error"}');


INSERT INTO system_settings (key, value)
VALUES
    ('maintenance_mode', 'OFF'),
    ('homepage_banner', 'Welcome to Online Course!'),
    ('max_login_attempts', '5'),
    ('enable_recommendation', 'TRUE');

/* ví dụ:
   ('maintenance_mode', 'ON'/'OFF')
*/

