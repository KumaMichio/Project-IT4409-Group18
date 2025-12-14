# API Endpoints Documentation
## LMS Platform - Backend API

**Base URL:** `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### 1.1. Đăng ký tài khoản
- **Endpoint:** `POST /api/auth/signup`
- **Mô tả:** Đăng ký tài khoản mới
- **Authentication:** Không cần
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "STUDENT" | "INSTRUCTOR" | "ADMIN"
  }
  ```
- **Response:** `200 OK` với token và user info

### 1.2. Đăng nhập
- **Endpoint:** `POST /api/auth/signin`
- **Mô tả:** Đăng nhập vào hệ thống
- **Authentication:** Không cần
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `200 OK` với token và user info

### 1.3. Lấy thông tin user hiện tại
- **Endpoint:** `GET /api/auth/me`
- **Mô tả:** Lấy thông tin user đang đăng nhập
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với user info

---

## 2. Courses - Public Routes (`/api/courses`)

### 2.1. Lấy danh sách khóa học
- **Endpoint:** `GET /api/courses`
- **Mô tả:** Lấy danh sách tất cả khóa học đã xuất bản
- **Authentication:** Không cần
- **Query Parameters:**
  - `page` (optional): Số trang
  - `limit` (optional): Số lượng mỗi trang
  - `search` (optional): Tìm kiếm theo từ khóa
  - `tags` (optional): Lọc theo tags
- **Response:** `200 OK` với danh sách courses

### 2.2. Lấy chi tiết khóa học
- **Endpoint:** `GET /api/courses/:courseId`
- **Mô tả:** Lấy thông tin chi tiết của một khóa học
- **Authentication:** Không cần
- **Response:** `200 OK` với course detail

### 2.3. Lấy khóa học liên quan
- **Endpoint:** `GET /api/courses/:courseId/related`
- **Mô tả:** Lấy danh sách khóa học liên quan
- **Authentication:** Không cần
- **Response:** `200 OK` với danh sách related courses

---

## 3. Courses - Student Routes (`/api/courses`)

### 3.1. Lấy nội dung khóa học
- **Endpoint:** `GET /api/courses/:courseId/content`
- **Mô tả:** Lấy modules, lessons, assets của khóa học (chỉ cho học viên đã đăng ký)
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với course content (modules, lessons, assets)

### 3.2. Lấy tiến độ học tập
- **Endpoint:** `GET /api/courses/:courseId/progress`
- **Mô tả:** Lấy tiến độ học tập của học viên trong khóa học
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với progress data

---

## 4. Courses - Instructor Routes (`/api/courses/instructor`)

### 4.1. Quản lý Khóa học

#### 4.1.1. Lấy danh sách khóa học của instructor
- **Endpoint:** `GET /api/courses/instructor/my-courses`
- **Mô tả:** Lấy tất cả khóa học do instructor tạo
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách courses

#### 4.1.2. Lấy chi tiết khóa học (instructor)
- **Endpoint:** `GET /api/courses/instructor/my-courses/:courseId`
- **Mô tả:** Lấy chi tiết khóa học với đầy đủ modules, lessons, assets
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với course detail

#### 4.1.3. Tạo khóa học mới
- **Endpoint:** `POST /api/courses/instructor/my-courses`
- **Mô tả:** Tạo khóa học mới
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "price_cents": number,
    "currency": "VND",
    "thumbnail_url": "string",
    "lang": "vi" | "en"
  }
  ```
- **Response:** `201 Created` với course mới tạo

#### 4.1.4. Cập nhật khóa học
- **Endpoint:** `PUT /api/courses/instructor/my-courses/:courseId`
- **Mô tả:** Cập nhật thông tin khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:** (tương tự như create)
- **Response:** `200 OK` với course đã cập nhật

#### 4.1.5. Xóa khóa học
- **Endpoint:** `DELETE /api/courses/instructor/my-courses/:courseId`
- **Mô tả:** Xóa khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với success message

### 4.2. Quản lý Modules

#### 4.2.1. Lấy danh sách modules
- **Endpoint:** `GET /api/courses/instructor/my-courses/:courseId/modules`
- **Mô tả:** Lấy tất cả modules của khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách modules

#### 4.2.2. Tạo module mới
- **Endpoint:** `POST /api/courses/instructor/my-courses/:courseId/modules`
- **Mô tả:** Tạo module mới cho khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "title": "string",
    "position": number
  }
  ```
- **Response:** `201 Created` với module mới

#### 4.2.3. Cập nhật module
- **Endpoint:** `PUT /api/courses/instructor/modules/:moduleId`
- **Mô tả:** Cập nhật thông tin module
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "title": "string",
    "position": number
  }
  ```
- **Response:** `200 OK` với module đã cập nhật

#### 4.2.4. Xóa module
- **Endpoint:** `DELETE /api/courses/instructor/modules/:moduleId`
- **Mô tả:** Xóa module
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với success message

### 4.3. Quản lý Lessons

#### 4.3.1. Lấy danh sách lessons
- **Endpoint:** `GET /api/courses/instructor/modules/:moduleId/lessons`
- **Mô tả:** Lấy tất cả lessons của module
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách lessons

#### 4.3.2. Tạo lesson mới
- **Endpoint:** `POST /api/courses/instructor/modules/:moduleId/lessons`
- **Mô tả:** Tạo lesson mới cho module
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "title": "string",
    "position": number,
    "duration_s": number,
    "requires_quiz_pass": boolean
  }
  ```
- **Response:** `201 Created` với lesson mới

#### 4.3.3. Cập nhật lesson
- **Endpoint:** `PUT /api/courses/instructor/lessons/:lessonId`
- **Mô tả:** Cập nhật thông tin lesson
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:** (tương tự như create)
- **Response:** `200 OK` với lesson đã cập nhật

#### 4.3.4. Xóa lesson
- **Endpoint:** `DELETE /api/courses/instructor/lessons/:lessonId`
- **Mô tả:** Xóa lesson
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với success message

### 4.4. Quản lý Assets (Videos)

#### 4.4.1. Lấy danh sách assets
- **Endpoint:** `GET /api/courses/instructor/lessons/:lessonId/assets`
- **Mô tả:** Lấy tất cả assets (videos, PDFs, links) của lesson
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách assets

#### 4.4.2. Thêm asset bằng URL
- **Endpoint:** `POST /api/courses/instructor/lessons/:lessonId/assets`
- **Mô tả:** Thêm video/PDF/link bằng URL
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "asset_kind": "VIDEO" | "PDF" | "LINK",
    "url": "string",
    "position": number
  }
  ```
- **Response:** `201 Created` với asset mới

#### 4.4.3. Upload video file
- **Endpoint:** `POST /api/courses/instructor/lessons/:lessonId/assets/upload`
- **Mô tả:** Upload file video (.mp4, .webm, .ogg)
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `video`: File (max 500MB)
  - `position`: number
- **Response:** `201 Created` với asset mới (URL: `/uploads/videos/filename`)

#### 4.4.4. Cập nhật asset
- **Endpoint:** `PUT /api/courses/instructor/assets/:assetId`
- **Mô tả:** Cập nhật thông tin asset
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "url": "string",
    "position": number
  }
  ```
- **Response:** `200 OK` với asset đã cập nhật

#### 4.4.5. Xóa asset
- **Endpoint:** `DELETE /api/courses/instructor/assets/:assetId`
- **Mô tả:** Xóa asset
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với success message

### 4.5. Quản lý Quizzes

#### 4.5.1. Lấy danh sách quizzes
- **Endpoint:** `GET /api/courses/instructor/my-courses/:courseId/quizzes`
- **Mô tả:** Lấy tất cả quizzes của khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách quizzes

#### 4.5.2. Lấy chi tiết quiz
- **Endpoint:** `GET /api/courses/instructor/quizzes/:quizId`
- **Mô tả:** Lấy chi tiết quiz với questions và options
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với quiz detail

#### 4.5.3. Tạo quiz mới
- **Endpoint:** `POST /api/courses/instructor/lessons/:lessonId/quizzes`
- **Mô tả:** Tạo quiz mới cho lesson
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:**
  ```json
  {
    "title": "string",
    "time_limit_s": number,
    "attempts_allowed": number,
    "pass_score": number
  }
  ```
- **Response:** `201 Created` với quiz mới

#### 4.5.4. Cập nhật quiz
- **Endpoint:** `PUT /api/courses/instructor/quizzes/:quizId`
- **Mô tả:** Cập nhật thông tin quiz
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Request Body:** (tương tự như create)
- **Response:** `200 OK` với quiz đã cập nhật

#### 4.5.5. Xóa quiz
- **Endpoint:** `DELETE /api/courses/instructor/quizzes/:quizId`
- **Mô tả:** Xóa quiz
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với success message

### 4.6. Quản lý Học viên

#### 4.6.1. Lấy danh sách học viên theo khóa học
- **Endpoint:** `GET /api/courses/instructor/my-courses/:courseId/students`
- **Mô tả:** Lấy danh sách học viên đã đăng ký khóa học
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách students (kèm progress)

#### 4.6.2. Lấy tất cả học viên
- **Endpoint:** `GET /api/courses/instructor/students`
- **Mô tả:** Lấy danh sách tất cả học viên đã đăng ký khóa học của instructor
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với danh sách students

---

## 5. Enrollments (`/api/enrollments`)

### 5.1. Lấy khóa học đã đăng ký
- **Endpoint:** `GET /api/enrollments/my-courses`
- **Mô tả:** Lấy danh sách khóa học mà user đã đăng ký
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với danh sách enrolled courses

---

## 6. Payments (`/api/payments`)

### 6.1. Lấy thông tin checkout
- **Endpoint:** `GET /api/payments/checkout`
- **Mô tả:** Lấy thông tin đơn hàng từ cart để thanh toán
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `courseIds` (optional): Danh sách course IDs
- **Response:** `200 OK` với checkout info

### 6.2. Tạo đơn hàng
- **Endpoint:** `POST /api/payments/create-order`
- **Mô tả:** Tạo đơn hàng và redirect đến cổng thanh toán
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "courseIds": [number],
    "paymentProvider": "VNPAY" | "MOMO"
  }
  ```
- **Response:** `200 OK` với payment URL

### 6.3. VNPay Return
- **Endpoint:** `GET /api/payments/vnpay-return`
- **Mô tả:** Callback từ VNPay sau khi thanh toán
- **Authentication:** Không cần (public callback)
- **Query Parameters:** (từ VNPay)
- **Response:** Redirect đến success/cancel page

### 6.4. Lấy danh sách đơn hàng
- **Endpoint:** `GET /api/payments/orders`
- **Mô tả:** Lấy danh sách đơn hàng của user
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với danh sách orders

### 6.5. Lấy chi tiết đơn hàng
- **Endpoint:** `GET /api/payments/orders/:orderId`
- **Mô tả:** Lấy chi tiết một đơn hàng
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với order detail

---

## 7. Cart (`/api/cart`)

### 7.1. Lấy giỏ hàng
- **Endpoint:** `GET /api/cart`
- **Mô tả:** Lấy giỏ hàng của user với các items
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với cart data

### 7.2. Lấy tóm tắt giỏ hàng
- **Endpoint:** `GET /api/cart/summary`
- **Mô tả:** Lấy số lượng items và tổng tiền
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với summary (count, total)

### 7.3. Thêm khóa học vào giỏ
- **Endpoint:** `POST /api/cart/items`
- **Mô tả:** Thêm khóa học vào giỏ hàng
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "courseId": number
  }
  ```
- **Response:** `200 OK` với cart đã cập nhật

### 7.4. Xóa khóa học khỏi giỏ
- **Endpoint:** `DELETE /api/cart/items/:courseId`
- **Mô tả:** Xóa một khóa học khỏi giỏ hàng
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với cart đã cập nhật

### 7.5. Xóa toàn bộ giỏ hàng
- **Endpoint:** `DELETE /api/cart`
- **Mô tả:** Xóa toàn bộ items trong giỏ hàng
- **Authentication:** Required (Bearer Token)
- **Response:** `200 OK` với success message

---

## 8. Quizzes - Student (`/api/quizzes`)

### 8.1. Lấy chi tiết quiz
- **Endpoint:** `GET /api/quizzes/:quizId`
- **Mô tả:** Lấy thông tin quiz với questions và options
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với quiz detail

### 8.2. Tạo quiz attempt
- **Endpoint:** `POST /api/quizzes/:quizId/attempts`
- **Mô tả:** Bắt đầu làm quiz
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `201 Created` với attempt mới

### 8.3. Nộp bài quiz
- **Endpoint:** `POST /api/quizzes/:quizId/attempts/:attemptId/submit`
- **Mô tả:** Nộp bài và tính điểm
- **Authentication:** Required (Bearer Token - STUDENT)
- **Request Body:**
  ```json
  {
    "answers": [
      {
        "questionId": number,
        "selectedOptionIds": [number]
      }
    ]
  }
  ```
- **Response:** `200 OK` với kết quả (score, passed)

### 8.4. Lấy lịch sử làm bài
- **Endpoint:** `GET /api/quizzes/:quizId/attempts`
- **Mô tả:** Lấy tất cả attempts của student cho quiz này
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với danh sách attempts

---

## 9. Lessons (`/api/lessons`)

### 9.1. Cập nhật tiến độ học
- **Endpoint:** `POST /api/lessons/:lessonId/progress`
- **Mô tả:** Cập nhật số giây đã xem của lesson
- **Authentication:** Required (Bearer Token - STUDENT)
- **Request Body:**
  ```json
  {
    "studentId": number,
    "watchedSeconds": number
  }
  ```
- **Response:** `200 OK` với progress đã cập nhật

### 9.2. Đánh dấu hoàn thành lesson
- **Endpoint:** `POST /api/lessons/:lessonId/complete`
- **Mô tả:** Đánh dấu lesson đã hoàn thành
- **Authentication:** Required (Bearer Token - STUDENT)
- **Request Body:**
  ```json
  {
    "studentId": number
  }
  ```
- **Response:** `200 OK` với success message

---

## 10. Users - Admin (`/api/admin/users`)

### 10.1. Lấy danh sách users
- **Endpoint:** `GET /api/admin/users`
- **Mô tả:** Lấy tất cả users trong hệ thống
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với danh sách users

### 10.2. Lấy users theo role
- **Endpoint:** `GET /api/admin/users/role/:role`
- **Mô tả:** Lấy users theo role (STUDENT, INSTRUCTOR, ADMIN)
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với danh sách users

### 10.3. Lấy user theo ID
- **Endpoint:** `GET /api/admin/users/:id`
- **Mô tả:** Lấy thông tin chi tiết một user
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với user detail

### 10.4. Tạo user mới
- **Endpoint:** `POST /api/admin/users`
- **Mô tả:** Tạo user mới (admin)
- **Authentication:** Required (Bearer Token - ADMIN)
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "STUDENT" | "INSTRUCTOR" | "ADMIN"
  }
  ```
- **Response:** `201 Created` với user mới

### 10.5. Cập nhật user
- **Endpoint:** `PUT /api/admin/users/:id`
- **Mô tả:** Cập nhật thông tin user
- **Authentication:** Required (Bearer Token - ADMIN)
- **Request Body:** (tương tự như create)
- **Response:** `200 OK` với user đã cập nhật

### 10.6. Xóa user
- **Endpoint:** `DELETE /api/admin/users/:id`
- **Mô tả:** Xóa user khỏi hệ thống
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với success message

---

## 11. Revenue (`/api/revenue`)

### 11.1. Tổng quan doanh thu - Admin
- **Endpoint:** `GET /api/revenue/admin/summary`
- **Mô tả:** Lấy tổng quan doanh thu toàn hệ thống
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với revenue summary

### 11.2. Doanh thu theo khóa học - Admin
- **Endpoint:** `GET /api/revenue/admin/by-course`
- **Mô tả:** Lấy doanh thu chi tiết theo từng khóa học
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với revenue by course

### 11.3. Doanh thu của instructor
- **Endpoint:** `GET /api/revenue/instructor/my-courses`
- **Mô tả:** Lấy doanh thu các khóa học của instructor
- **Authentication:** Required (Bearer Token - INSTRUCTOR)
- **Response:** `200 OK` với instructor revenue

---

## 12. Recommendations (`/api/recommendations`)

### 12.1. Gửi feedback
- **Endpoint:** `POST /api/recommendations/feedback`
- **Mô tả:** Gửi feedback về khóa học được recommend
- **Authentication:** Required (Bearer Token - STUDENT)
- **Request Body:**
  ```json
  {
    "courseId": number,
    "isRelevant": boolean
  }
  ```
- **Response:** `200 OK` với success message

### 12.2. Lấy feedback của tôi
- **Endpoint:** `GET /api/recommendations/feedback`
- **Mô tả:** Lấy tất cả feedback đã gửi
- **Authentication:** Required (Bearer Token - STUDENT)
- **Response:** `200 OK` với danh sách feedback

---

## 13. System - Admin (`/api/admin/system`)

### 13.1. Tổng quan hệ thống
- **Endpoint:** `GET /api/admin/system/overview`
- **Mô tả:** Lấy tổng quan hệ thống (users, courses, revenue, etc.)
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với system overview

### 13.2. Lấy logs
- **Endpoint:** `GET /api/admin/system/logs`
- **Mô tả:** Lấy logs hệ thống
- **Authentication:** Required (Bearer Token - ADMIN)
- **Query Parameters:**
  - `page` (optional): Số trang
  - `limit` (optional): Số lượng mỗi trang
- **Response:** `200 OK` với danh sách logs

### 13.3. Lấy trạng thái maintenance mode
- **Endpoint:** `GET /api/admin/system/maintenance-mode`
- **Mô tả:** Kiểm tra trạng thái maintenance mode
- **Authentication:** Required (Bearer Token - ADMIN)
- **Response:** `200 OK` với maintenance mode status

### 13.4. Bật/tắt maintenance mode
- **Endpoint:** `PUT /api/admin/system/maintenance-mode`
- **Mô tả:** Bật hoặc tắt chế độ bảo trì
- **Authentication:** Required (Bearer Token - ADMIN)
- **Request Body:**
  ```json
  {
    "enabled": boolean
  }
  ```
- **Response:** `200 OK` với success message

---

## 14. Health Check

### 14.1. Kiểm tra trạng thái server
- **Endpoint:** `GET /api/health`
- **Mô tả:** Kiểm tra server có hoạt động không
- **Authentication:** Không cần
- **Response:** `200 OK` với status message

---

## Authentication

Tất cả các endpoints yêu cầu authentication sẽ cần header:
```
Authorization: Bearer <token>
```

Token được lấy từ endpoint `/api/auth/signin` hoặc `/api/auth/signup`.

---

## Error Responses

Tất cả các endpoints có thể trả về các lỗi sau:

- **400 Bad Request:** Dữ liệu request không hợp lệ
- **401 Unauthorized:** Chưa đăng nhập hoặc token không hợp lệ
- **403 Forbidden:** Không có quyền truy cập (sai role)
- **404 Not Found:** Resource không tồn tại
- **500 Internal Server Error:** Lỗi server

Format error response:
```json
{
  "error": "Error message"
}
```

---

## Notes

1. **File Upload:** Endpoint upload video sử dụng `multipart/form-data` với field name `video`
2. **Pagination:** Các endpoint list có thể hỗ trợ pagination với query params `page` và `limit`
3. **Base URL:** Tất cả endpoints đều có prefix `/api`
4. **Static Files:** Video files được serve tại `/uploads/videos/` (từ backend)

---

**Document Version:** 1.0  
**Last Updated:** 2024

