# API Endpoints cho UC16, UC17, UC18

## UC16 – Phản hồi chất lượng gợi ý

### 1. Gửi phản hồi cho khóa học gợi ý
- **Endpoint:** `POST /api/recommendations/feedback`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: STUDENT)
  - Body:
    ```json
    {
      "courseId": <number>,
      "action": "NOT_INTERESTED" | "PRIORITY" | "HIDE"
    }
    ```
- **Phản hồi:**
    ```json
    {
      "message": "Feedback saved",
      "feedback": { ... }
    }
    ```

### 2. Lấy danh sách feedback của user
- **Endpoint:** `GET /api/recommendations/feedback`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: STUDENT)
- **Phản hồi:**
    ```json
    [
      { "feedback_id": 1, "course_id": 10, "action": "HIDE", ... },
      ...
    ]
    ```

---

## UC17 – Quản lý doanh thu

### 1. Admin xem tổng doanh thu hệ thống
- **Endpoint:** `GET /api/revenue/admin/summary?from=<iso>&to=<iso>`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: ADMIN)
- **Phản hồi:**
    ```json
    {
      "total_revenue": "1000000",
      "total_paid_transactions": "5",
      "total_courses": "3",
      "from": "...",
      "to": "..."
    }
    ```

### 2. Admin xem doanh thu theo khóa học
- **Endpoint:** `GET /api/revenue/admin/by-course?from=<iso>&to=<iso>`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: ADMIN)
- **Phản hồi:**
    ```json
    {
      "from": "...",
      "to": "...",
      "data": [
        {
          "course_id": 1,
          "course_title": "Node.js",
          "instructor_name": "A",
          "total_revenue": "500000",
          "total_students": 10
        },
        ...
      ]
    }
    ```

### 3. Giảng viên xem doanh thu khóa học của mình
- **Endpoint:** `GET /api/revenue/instructor/my-courses?from=<iso>&to=<iso>`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: INSTRUCTOR)
- **Phản hồi:**
    ```json
    {
      "from": "...",
      "to": "...",
      "data": [
        {
          "course_id": 7,
          "course_title": "React",
          "total_revenue": "123456",
          "total_students": 4
        },
        ...
      ]
    }
    ```

---

## UC18 – Quản lý hệ thống

### 1. Lấy thống kê tổng quan hệ thống
- **Endpoint:** `GET /api/admin/system/overview`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: ADMIN)
- **Phản hồi:**
    ```json
    {
      "total_users": 100,
      "total_students": 70,
      "total_instructors": 30,
      "total_courses": 20,
      "published_courses": 15,
      "today_transactions": 3,
      "month_revenue": "999999"
    }
    ```

### 2. Lấy log hoạt động hệ thống
- **Endpoint:** `GET /api/admin/system/logs?limit=<number>&action=<action>`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: ADMIN)
- **Phản hồi:**
    ```json
    [
      {
        "log_id": 1,
        "user_id": 10,
        "full_name": "Nguyen Van A",
        "action": "USER_LOGIN",
        "detail": { ... },
        "created_at": "2025-12-08T10:00:00Z"
      },
      ...
    ]
    ```

### 3. (Tùy chọn) Bật/tắt maintenance mode
- **Endpoint:** `PUT /api/admin/system/maintenance`
- **Yêu cầu:**
  - Header: `Authorization: Bearer <JWT>` (role: ADMIN)
  - Body:
    ```json
    { "mode": "ON" | "OFF" }
    ```
- **Phản hồi:**
    ```json
    { "message": "Maintenance mode updated", "mode": "ON" }
    ```

---

> Lưu ý: Tất cả endpoint đều yêu cầu JWT hợp lệ và phân quyền đúng role.
