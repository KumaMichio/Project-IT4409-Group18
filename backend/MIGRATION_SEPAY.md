# Migration: Thêm SEPAY vào payment_provider enum

## Vấn đề

Khi tạo order với `paymentProvider: 'SEPAY'`, database báo lỗi:
```
error: invalid input value for enum payment_provider: "SEPAY"
```

## Nguyên nhân

Enum `payment_provider` trong database chỉ có các giá trị:
- `VNPAY`
- `MOMO`
- `OTHER`

Thiếu giá trị `SEPAY`.

## Giải pháp

Đã tạo migration script để thêm `SEPAY` vào enum.

### Chạy migration:

```bash
cd backend
node src/scripts/migrate-add-sepay-enum.js
```

### Kết quả:

Enum `payment_provider` hiện có 4 giá trị:
1. `VNPAY`
2. `MOMO`
3. `OTHER`
4. `SEPAY` ✅

## Lưu ý

- Migration script tự động kiểm tra xem `SEPAY` đã tồn tại chưa
- Có thể chạy nhiều lần mà không gây lỗi
- Đã cập nhật `database.sql` để bao gồm `SEPAY` trong enum definition

## File liên quan

- Migration script: `backend/src/scripts/migrate-add-sepay-enum.js`
- Database schema: `database.sql` (đã cập nhật)

