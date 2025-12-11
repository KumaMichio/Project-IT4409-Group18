# Sửa lỗi redirect admin và tạo trang quản lý

## Vấn đề
Khi đăng nhập bằng tài khoản admin, mặc dù API trả về 200 nhưng không redirect đến trang admin.

## Giải pháp đã triển khai

### 1. Tạo Admin Layout với Route Protection
**File**: `frontend/src/app/admin/layout.tsx`

- Tạo layout component để bảo vệ tất cả routes trong `/admin/*`
- Kiểm tra authentication và role trước khi render
- Tự động redirect nếu:
  - Không có token → `/auth/login`
  - User không phải admin → `/`
- Hiển thị navigation bar với các link:
  - Quản lý hệ thống (`/admin/system`)
  - Doanh thu (`/admin/revenue`)
- Hiển thị thông tin user và nút đăng xuất

### 2. Sửa Redirect Logic trong useAuth
**File**: `frontend/src/hooks/useAuth.ts`

- Thay đổi từ `router.push()` sang `router.replace()` để tránh lịch sử navigation
- Thêm `setTimeout` để đảm bảo state được cập nhật trước khi redirect
- Thêm console.log để debug role của user
- Kiểm tra role và redirect:
  - `role === 'admin'` → `/admin/system`
  - Khác → `/`

### 3. Cải thiện Admin System Page
**File**: `frontend/src/app/admin/system/page.tsx`

- Thêm authentication check trong component
- Thêm loading state khi đang kiểm tra quyền truy cập
- Xử lý lỗi 401/403 và redirect về login
- Cải thiện UI với loading indicators

### 4. Tạo Admin Index Page
**File**: `frontend/src/app/admin/page.tsx`

- Tạo trang index tự động redirect đến `/admin/system`
- Kiểm tra authentication trước khi redirect

## Cấu trúc Admin Routes

```
/admin/
├── layout.tsx          # Layout với route protection
├── page.tsx            # Index page (redirect to /admin/system)
├── system/
│   └── page.tsx        # Trang quản lý hệ thống
└── revenue/
    └── page.tsx        # Trang quản lý doanh thu
```

## Flow đăng nhập Admin

1. User đăng nhập tại `/auth/login`
2. API `/auth/signin` trả về token và user data (role: 'admin')
3. `useAuth.login()` lưu token và user vào localStorage
4. Kiểm tra `userData.role === 'admin'`
5. Redirect đến `/admin/system` bằng `router.replace()`
6. `AdminLayout` kiểm tra lại authentication và role
7. Nếu hợp lệ, render trang admin system

## Debug

Đã thêm console.log ở các điểm quan trọng:
- Login response user data
- User role
- Redirect decision
- AdminLayout auth check

Mở Developer Console để xem logs khi debug.

## Lưu ý

1. **Role Mapping**: Backend trả về role là 'admin' (lowercase) sau khi map từ 'ADMIN' enum
2. **Token Storage**: Token được lưu trong localStorage với key 'auth_token'
3. **Route Protection**: Tất cả routes trong `/admin/*` được bảo vệ bởi layout
4. **Redirect**: Sử dụng `router.replace()` thay vì `router.push()` để tránh back button issues

## Testing

Để test:

1. Tạo admin account:
   ```bash
   cd backend
   npm run db:seed-admin
   ```

2. Đăng nhập với:
   - Email: `admin@example.com` (hoặc giá trị từ env)
   - Password: `Admin123!` (hoặc giá trị từ env)

3. Kiểm tra:
   - Console logs để xem role và redirect
   - URL phải chuyển đến `/admin/system`
   - Navigation bar phải hiển thị
   - Trang admin system phải load được

## Troubleshooting

Nếu vẫn không redirect:

1. Kiểm tra console logs để xem role được trả về
2. Kiểm tra localStorage có token và user data không
3. Kiểm tra network tab để xem API response
4. Đảm bảo backend trả về role là 'admin' (lowercase)

