# Website Khóa Học Trực Tuyến

## Tổng Quan Dự Án

Dự án này nhằm phát triển một nền tảng khóa học trực tuyến toàn diện, nơi học viên có thể đăng ký, học và tương tác với giảng viên, trong khi giảng viên có thể quản lý khóa học và theo dõi tiến độ học viên. Hệ thống sẽ bao gồm các tính năng như nội dung khóa học đa phương tiện, bài kiểm tra, quản lý học viên tự động, và chứng chỉ điện tử. Nền tảng cũng sẽ có tính năng gợi ý khóa học dựa trên AI.

---

## Các Tính Năng

### 1. **Đăng Ký & Xác Thực Người Dùng**
   - **Học viên**: Đăng ký tài khoản với email và mật khẩu, quản lý thông tin cá nhân.
   - **Giảng viên**: Đăng nhập để quản lý khóa học.
   - **Quản trị viên**: Quản lý người dùng và nội dung trên nền tảng.

### 2. **Quản Lý Khóa Học**
   - **Giảng viên**: Tạo mới, cập nhật và quản lý các khóa học.
   - **Quản trị viên**: Duyệt khóa học trước khi khóa học được công khai.

### 3. **Đăng Ký và Thanh Toán**
   - **Học viên**: Tìm kiếm khóa học, đăng ký và thanh toán qua các cổng thanh toán trực tuyến (VNPay/Momo).
   - **Hệ thống**: Quản lý giao dịch và quyền truy cập khóa học.

### 4. **Học Tập & Tương Tác**
   - **Học viên**: Xem nội dung khóa học (video, PDF, bài quiz), làm bài kiểm tra và tải chứng chỉ sau khi hoàn thành khóa học.
   - **Giảng viên**: Tạo bài kiểm tra, đánh giá và phản hồi cho học viên.

### 5. **Gợi Ý Khóa Học Dựa Trên AI**
   - **Hệ thống**: Đưa ra các khóa học gợi ý được cá nhân hóa dựa trên hành vi và sở thích của người dùng.

### 6. **Giao Tiếp & Tương Tác Thực Tế**
   - **Học viên & Giảng viên**: Tham gia các kênh chat theo nhóm và chat riêng, trao đổi và nhận phản hồi về bài tập và khóa học.

---

## Công Nghệ Sử Dụng

### Front-end:
- **HTML5**, **CSS3**, **JavaScript**
- **ReactJS** hoặc **Next.js** để xây dựng giao diện người dùng động và phản hồi.
- **TailwindCSS/Bootstrap** để tạo kiểu giao diện.

### Back-end:
- **Node.js (Express.js)** để phát triển phía máy chủ và quản lý API.
- **REST API** để giao tiếp giữa client và server.

### Cơ Sở Dữ Liệu:
- **PostgreSQL** để lưu trữ dữ liệu người dùng và khóa học.

### Thanh Toán:
- **VNPay** và **Momo** để xử lý các giao dịch thanh toán trực tuyến.

### Quản Lý Video & Dữ Liệu Đám Mây:
- **AWS S3** hoặc **Cloudflare Stream** để lưu trữ và phát video khóa học.

### Xác Thực & Bảo Mật:
- **JWT Authentication**, **OAuth 2.0**, **SSL/TLS** để đảm bảo an toàn cho đăng nhập và truyền tải dữ liệu.

### Triển Khai:
- **Docker** để đóng gói ứng dụng.
- **AWS EC2**, **Vercel**, hoặc **Railway** để triển khai ứng dụng trên nền tảng đám mây.

### Kiểm Thử:
- **Jest/Mocha** để kiểm thử đơn vị.
- **Postman** để kiểm thử API.

---

## Các Use Case

### Use Case của Học viên:
- **Đăng ký / Đăng nhập**: Tạo tài khoản, đăng nhập để truy cập các khóa học.
- **Tìm kiếm & Đăng ký khóa học**: Tìm khóa học và mua khóa học.
- **Xem nội dung khóa học**: Xem video, đọc tài liệu, hoàn thành quiz.
- **Gửi phản hồi**: Đánh giá khóa học và giảng viên.
- **Chat**: Tham gia chat nhóm khóa học hoặc 1-1 với giảng viên.

### Use Case của Giảng viên:
- **Tạo khóa học**: Tạo mới khóa học với video, tài liệu, và mô tả.
- **Quản lý học viên**: Theo dõi tiến độ học của học viên.
- **Quản lý doanh thu**: Xem báo cáo số lượng học viên và doanh thu từ khóa học.

### Use Case của Quản trị viên:
- **Quản lý người dùng**: Thêm, xóa và phân quyền cho người dùng.
- **Duyệt khóa học**: Xem xét và duyệt khóa học trước khi công khai.
- **Quản lý thanh toán**: Theo dõi giao dịch thanh toán.
- **Quản lý hệ thống**: Sao lưu dữ liệu và theo dõi các log hệ thống.

---

## Cài Đặt

Để chạy dự án này trên máy tính của bạn, làm theo các bước sau:

1. **Clone repository**:
   ```bash
   git clone <repository_url>
   cd <thư_mục_dự_án>
   ```

2. **Cài đặt các dependencies**:
   - Front-end:
     ```bash
     npm install
     ```

   - Back-end:
     ```bash
     npm install
     ```

3. **Cài đặt cơ sở dữ liệu**:
   Tạo một cơ sở dữ liệu PostgreSQL và cấu hình kết nối trong phần back-end.

4. **Khởi động ứng dụng**:
   - Chạy trong chế độ phát triển:
     ```bash
     npm run dev
     ```

---

## Hướng Dẫn Đóng Góp

1. Fork repository.
2. Tạo một nhánh tính năng (`git checkout -b ten-tinh-nang`).
3. Commit thay đổi của bạn (`git commit -am 'Thêm tính năng mới'`).
4. Đẩy nhánh lên (`git push origin ten-tinh-nang`).
5. Tạo pull request.

---

## Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem chi tiết trong file [LICENSE](LICENSE).
