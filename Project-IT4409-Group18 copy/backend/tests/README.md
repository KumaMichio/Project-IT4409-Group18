# Test Cases Documentation

## Cấu trúc Test

```
tests/
├── setup.js                          # Test configuration và setup
├── unit/                             # Unit tests
│   ├── services/
│   │   └── auth.service.test.js      # Tests cho authentication service
│   ├── controllers/
│   │   └── auth.controller.test.js   # Tests cho authentication controllers
│   ├── repositories/
│   │   └── user.repository.test.js   # Tests cho user repository
│   ├── utils/
│   │   ├── jwt.test.js               # Tests cho JWT utilities
│   │   └── password.test.js           # Tests cho password utilities
│   └── middlewares/
│       ├── auth.middleware.test.js    # Tests cho authentication middleware
│       └── error.middleware.test.js   # Tests cho error handling middleware
└── integration/
    └── auth.routes.test.js            # Integration tests cho auth routes
```

## Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy unit tests
```bash
npm run test:unit
```

### Chạy integration tests
```bash
npm run test:integration
```

### Chạy test với coverage
```bash
npm test -- --coverage
```

## Test Cases Chi Tiết

### 1. Auth Service Tests (`auth.service.test.js`)

#### Signup Tests
- ✅ Đăng ký thành công với đầy đủ thông tin
- ✅ Throw error khi thiếu các trường bắt buộc (name, email, password)
- ✅ Throw error khi email đã tồn tại
- ✅ Throw error khi role không hợp lệ
- ✅ Mặc định role là 'student' khi không cung cấp
- ✅ Normalize role về lowercase

#### Signin Tests
- ✅ Đăng nhập thành công với credentials hợp lệ
- ✅ Throw error khi thiếu email hoặc password
- ✅ Throw error khi user không tồn tại
- ✅ Throw error khi password sai

#### GetMeFromToken Tests
- ✅ Lấy thông tin user thành công từ token hợp lệ
- ✅ Throw error khi token không hợp lệ
- ✅ Throw error khi token đã hết hạn
- ✅ Throw error khi user không tồn tại

### 2. Auth Controller Tests (`auth.controller.test.js`)

#### SignupController Tests
- ✅ Trả về 201 với token và user khi đăng ký thành công
- ✅ Trả về 400 khi thiếu các trường bắt buộc
- ✅ Trả về 409 khi email đã tồn tại
- ✅ Trả về 500 khi có lỗi server
- ✅ Xử lý empty body gracefully

#### SigninController Tests
- ✅ Trả về 200 với token và user khi đăng nhập thành công
- ✅ Trả về 401 khi credentials không hợp lệ
- ✅ Trả về 500 khi có lỗi server

#### MeController Tests
- ✅ Trả về user info khi token hợp lệ
- ✅ Trả về 401 khi thiếu Authorization header
- ✅ Trả về 401 khi token format không đúng
- ✅ Trả về 401 khi token không hợp lệ
- ✅ Trả về 404 khi user không tồn tại
- ✅ Trả về 500 khi có lỗi server

### 3. User Repository Tests (`user.repository.test.js`)

#### GetUsers Tests
- ✅ Lấy danh sách tất cả users
- ✅ Trả về empty array khi không có users

#### FindUserByEmail Tests
- ✅ Tìm user theo email (case-insensitive)
- ✅ Trả về null khi user không tồn tại

#### AddUser Tests
- ✅ Thêm user mới vào database
- ✅ Tự động generate ID khi không cung cấp
- ✅ Mặc định role là 'student' khi không cung cấp
- ✅ Hỗ trợ cả `name` và `full_name` field
- ✅ Hỗ trợ cả `passwordHash` và `password_hash` field

#### CreateUser Tests
- ✅ Gọi addUser với parameters đúng
- ✅ Mặc định role là 'student'

### 4. JWT Utils Tests (`jwt.test.js`)

#### SignToken Tests
- ✅ Tạo JWT token hợp lệ
- ✅ Token có thời gian hết hạn 7 ngày
- ✅ Sử dụng default secret khi JWT_SECRET không được set

#### VerifyToken Tests
- ✅ Verify và decode token hợp lệ
- ✅ Throw error khi token không hợp lệ
- ✅ Throw error khi token đã hết hạn
- ✅ Throw error khi token signature không đúng
- ✅ Sử dụng default secret khi JWT_SECRET không được set

### 5. Password Utils Tests (`password.test.js`)

#### HashPassword Tests
- ✅ Hash password bằng bcrypt với salt rounds = 10
- ✅ Xử lý các loại password khác nhau

#### ComparePassword Tests
- ✅ Trả về true khi password khớp với hash
- ✅ Trả về false khi password không khớp
- ✅ Xử lý empty password

### 6. Auth Middleware Tests (`auth.middleware.test.js`)

- ✅ Gọi next() khi token hợp lệ và gắn user vào req.user
- ✅ Gọi next với AppError khi token thiếu
- ✅ Gọi next với AppError khi Authorization header thiếu
- ✅ Gọi next với AppError khi token format không đúng
- ✅ Gọi next với AppError khi scheme không phải Bearer
- ✅ Gọi next với AppError khi token verification thất bại
- ✅ Xử lý case-insensitive Bearer scheme

### 7. Error Middleware Tests (`error.middleware.test.js`)

- ✅ Xử lý AppError với status code và message đúng
- ✅ Xử lý AppError với các status codes khác nhau
- ✅ Xử lý generic errors với status 500
- ✅ Xử lý errors không có message

### 8. Integration Tests (`auth.routes.test.js`)

#### POST /auth/signup
- ✅ Đăng ký thành công
- ✅ Trả về 400 khi thiếu fields
- ✅ Trả về 409 khi email đã tồn tại
- ✅ Trả về 400 khi role không hợp lệ

#### POST /auth/signin
- ✅ Đăng nhập thành công
- ✅ Trả về 401 khi email không tồn tại
- ✅ Trả về 401 khi password sai
- ✅ Trả về 400 khi thiếu email hoặc password

#### GET /auth/me
- ✅ Trả về user info với token hợp lệ
- ✅ Trả về 401 khi token thiếu
- ✅ Trả về 401 khi token format không đúng
- ✅ Trả về 401 khi token không hợp lệ
- ✅ Trả về 404 khi user không tồn tại

#### GET /
- ✅ Trả về health check status

## Mocking Strategy

- **Repositories**: Mocked để tránh phụ thuộc vào database thực
- **bcryptjs**: Mocked để kiểm soát hash/compare operations
- **JWT**: Sử dụng thực tế nhưng với test secret key
- **Database Pool**: Mocked trong repository tests

## Test Coverage Goals

- Services: 100%
- Controllers: 100%
- Repositories: 100%
- Utils: 100%
- Middlewares: 100%
- Routes: 100%

## Notes

- Tất cả tests sử dụng Jest framework
- Tests được chạy với `--runInBand` để tránh race conditions
- Test timeout được set là 10 giây
- Environment variables được set trong `tests/setup.js`


