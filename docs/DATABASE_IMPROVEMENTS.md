# Cải thiện Database Schema

## Các chỉnh sửa đã thực hiện cho phần DB (dòng 68-138)

### 1. Thêm Indexes cho bảng `users`

**Lý do**: Cần tối ưu các query thống kê admin (đếm users theo role, tìm kiếm user, v.v.)

```sql
-- Index cho role (quan trọng cho admin queries)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index cho email (tối ưu login/authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index cho is_active (filter active users)
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index cho created_at (thống kê theo thời gian)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
```

### 2. Thêm Index cho bảng `auth_providers`

**Lý do**: Tối ưu query khi tìm auth providers của user

```sql
CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);
```

### 3. Thêm Indexes cho bảng `audit_logs`

**Lý do**: Admin cần query logs thường xuyên, cần tối ưu performance

```sql
-- Index cho actor_id (tìm logs của user cụ thể)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);

-- Index cho action (filter theo loại action)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Index cho created_at DESC (lấy logs mới nhất)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index cho target (tìm logs của một entity cụ thể)
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
```

### 4. Thêm Indexes cho bảng `payments`

**Lý do**: Admin dashboard cần query thống kê doanh thu nhanh

```sql
-- Index cho status (filter payments theo trạng thái)
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Index cho created_at (thống kê theo ngày/tháng)
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Composite index cho status + created_at (query phổ biến nhất)
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at);
```

## Tác động

### Performance Improvements

1. **Admin System Overview Query**: 
   - Query đếm users theo role nhanh hơn với `idx_users_role`
   - Query payments theo ngày/tháng nhanh hơn với `idx_payments_status_created`

2. **Activity Logs Query**:
   - Query logs mới nhất nhanh hơn với `idx_audit_logs_created_at DESC`
   - Filter theo action nhanh hơn với `idx_audit_logs_action`

3. **Authentication**:
   - Login query nhanh hơn với `idx_users_email` (mặc dù đã có UNIQUE constraint)

### Lưu ý

- Tất cả indexes sử dụng `IF NOT EXISTS` để tránh lỗi khi chạy lại script
- Indexes được tạo ngay sau khi tạo table để đảm bảo thứ tự đúng
- DESC index cho `audit_logs.created_at` tối ưu cho query "lấy logs mới nhất"

## Không cần chỉnh sửa

Các phần sau đã đúng và không cần thay đổi:

1. ✅ **ENUM `role_type`**: Đã có 'ADMIN' - đúng
2. ✅ **Bảng `users` structure**: Đã đúng với các field cần thiết
3. ✅ **Foreign keys**: Đã đúng với ON DELETE CASCADE/SET NULL
4. ✅ **UNIQUE constraints**: Email đã có UNIQUE constraint

## Kết quả

Sau khi thêm các indexes này:
- Admin dashboard load nhanh hơn
- Activity logs query nhanh hơn
- Revenue statistics query nhanh hơn
- Authentication queries tối ưu hơn


