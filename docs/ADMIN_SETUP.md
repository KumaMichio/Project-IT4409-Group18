# Hướng dẫn thiết lập tài khoản Admin

## Tạo tài khoản Admin

Tài khoản admin là tài khoản cố định, không thể đăng ký qua form đăng ký thông thường. Để tạo tài khoản admin, chạy script seed:

```bash
cd backend
npm run db:seed-admin
```

Hoặc chạy trực tiếp:

```bash
cd backend
node src/scripts/seed-admin.js
```

### Thông tin đăng nhập mặc định

- **Email**: `admin@example.com`
- **Password**: `Admin123!`

### Tùy chỉnh thông tin admin

Bạn có thể tùy chỉnh thông tin admin bằng cách set các biến môi trường:

```bash
export SEED_ADMIN_EMAIL=admin@yourdomain.com
export SEED_ADMIN_PW=YourSecurePassword123!
export SEED_ADMIN_NAME="System Administrator"
```

Sau đó chạy script:

```bash
npm run db:seed-admin
```

## Tính năng Admin

Sau khi đăng nhập bằng tài khoản admin, bạn sẽ được tự động chuyển đến trang quản lý hệ thống tại `/admin/system`.

### Trang quản lý hệ thống bao gồm:

1. **Maintenance Mode Toggle**
   - Bật/tắt chế độ bảo trì hệ thống
   - Có thể sử dụng để hiển thị banner bảo trì cho người dùng

2. **Thống kê hệ thống**
   - Tổng số người dùng
   - Số học viên
   - Số giảng viên
   - Tổng số khóa học (và số khóa đã publish)
   - Số giao dịch hôm nay
   - Doanh thu tháng này

3. **Activity Logs**
   - Xem các log hoạt động của hệ thống
   - Bao gồm: user login, đăng ký, mua khóa, tạo khóa, nộp bài, v.v.
   - Hiển thị 50 log mới nhất

## API Endpoints cho Admin

### System Overview
```
GET /api/admin/system/overview
```
Trả về thống kê tổng quan của hệ thống.

### Activity Logs
```
GET /api/admin/system/logs?limit=50&action=LOGIN
```
Trả về danh sách activity logs. Có thể filter theo action.

### Maintenance Mode
```
GET /api/admin/system/maintenance-mode
```
Lấy trạng thái maintenance mode.

```
PUT /api/admin/system/maintenance-mode
Body: { "enabled": true/false }
```
Bật/tắt maintenance mode.

## Lưu ý

- Tất cả các API endpoints trên yêu cầu authentication và role ADMIN
- Maintenance mode được lưu trong bảng `system_settings` trong database
- Activity logs được lưu trong bảng `audit_logs`

