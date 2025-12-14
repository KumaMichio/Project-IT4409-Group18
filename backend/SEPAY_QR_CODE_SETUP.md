# Hướng dẫn cấu hình SePay QR Code

## Tổng quan

SePay cung cấp QR code URL với format:
```
https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=ORDER_NUMBER
```

## Cấu hình .env

Thêm các biến sau vào file `.env`:

```env
# SePay QR Code Configuration
SEPAY_QR_ACCOUNT=VQRQAFXEL0318  # Số tài khoản SePay của bạn
SEPAY_QR_BANK=MBBank            # Tên ngân hàng (ví dụ: MBBank, Vietcombank, Techcombank, etc.)
```

## Các tham số QR Code URL

- `acc`: Số tài khoản SePay (từ `SEPAY_QR_ACCOUNT`)
- `bank`: Tên ngân hàng (từ `SEPAY_QR_BANK`)
- `amount`: Số tiền cần thanh toán (từ order)
- `des`: Mô tả/Nội dung chuyển khoản (order_number)

## Ví dụ QR Code URL

```
https://qr.sepay.vn/img?acc=VQRQAFXEL0318&bank=MBBank&amount=100000&des=DH102969
```

## Cách hoạt động

1. **Khi tạo order với SePay:**
   - Backend gọi SePay API để tạo payment URL
   - Backend tự động tạo QR code URL từ config
   - Trả về cả `paymentUrl` và `qrCodeUrl`

2. **Frontend nhận được:**
   ```json
   {
     "paymentUrl": "https://sepay.vn/payment/...",
     "qrCodeUrl": "https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=..."
   }
   ```

3. **User có 2 lựa chọn:**
   - Quét QR code để thanh toán (nhanh, tiện lợi)
   - Click vào payment URL để xem thông tin chuyển khoản

## Lưu ý

- ✅ QR code URL được tạo tự động từ config, không cần gọi API
- ✅ QR code luôn có sẵn nếu đã cấu hình `SEPAY_QR_ACCOUNT` và `SEPAY_QR_BANK`
- ⚠️ Nếu không cấu hình, hệ thống sẽ không tạo QR code URL
- ⚠️ Đảm bảo số tài khoản và tên ngân hàng chính xác

## Danh sách tên ngân hàng phổ biến

- `MBBank` - Ngân hàng Quân đội
- `Vietcombank` - Ngân hàng Ngoại thương
- `Techcombank` - Ngân hàng Kỹ thương
- `BIDV` - Ngân hàng Đầu tư và Phát triển
- `Vietinbank` - Ngân hàng Công thương
- `ACB` - Ngân hàng Á Châu
- `VPBank` - Ngân hàng Việt Nam Thịnh Vượng
- `Sacombank` - Ngân hàng Sài Gòn Thương Tín

(Lưu ý: Tên ngân hàng phải khớp với format mà SePay yêu cầu)

