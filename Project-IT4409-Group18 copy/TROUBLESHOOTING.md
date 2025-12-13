# Troubleshooting - Failed to fetch

## Lỗi: "Failed to fetch" hoặc "Cannot connect to backend server"

### Nguyên nhân

Lỗi này thường xảy ra khi:
1. Backend server chưa chạy
2. Port không khớp giữa frontend và backend
3. CORS chưa được cấu hình đúng
4. NEXT_PUBLIC_API_URL chưa được set

### Giải pháp

#### 1. Kiểm tra Backend đang chạy

```bash
cd backend
npm run dev
```

Backend mặc định chạy trên port **4000** (không phải 3001).

Bạn sẽ thấy:
```
Backend listening on port 4000
✅ Database connected successfully
```

#### 2. Cấu hình Frontend Environment Variable

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Lưu ý**: 
- File phải có prefix `NEXT_PUBLIC_` để Next.js expose ra client-side
- Sau khi tạo/sửa file `.env.local`, cần **restart Next.js dev server**

#### 3. Restart Frontend Server

Sau khi set environment variable:

```bash
# Dừng frontend server (Ctrl+C)
# Sau đó chạy lại
cd frontend
npm run dev
```

#### 4. Kiểm tra CORS

Backend đã được cấu hình CORS để cho phép requests từ:
- `http://localhost:3000` (Next.js default)
- Hoặc giá trị từ `FRONTEND_URL` environment variable

Nếu frontend chạy trên port khác, set trong `backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
```

### Kiểm tra nhanh

1. **Test backend health check**:
   ```bash
   curl http://localhost:4000/
   ```
   Kết quả mong đợi: `{"status":"ok"}`

2. **Test API endpoint** (với token):
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/users
   ```

3. **Kiểm tra browser console**:
   - Mở Developer Tools (F12)
   - Tab Network
   - Xem request có được gửi đi không
   - Xem response status code

### Ports mặc định

- **Backend**: `4000` (hoặc từ `PORT` env var)
- **Frontend**: `3000` (Next.js default)
- **Database**: `5432` (PostgreSQL)

### Các lỗi thường gặp

#### "ECONNREFUSED"
→ Backend chưa chạy hoặc sai port

#### "CORS policy"
→ Cần cấu hình CORS trong backend (đã có sẵn)

#### "401 Unauthorized"
→ Token không hợp lệ hoặc đã hết hạn, cần đăng nhập lại

#### "403 Forbidden"
→ User không có quyền ADMIN

### Quick Fix

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (sau khi đã set .env.local)
cd frontend
npm run dev
```

### Verify

1. Backend: http://localhost:4000/ → `{"status":"ok"}`
2. Frontend: http://localhost:3000 → Load được trang
3. Admin page: http://localhost:3000/admin/users → Load được danh sách users


