# Hướng dẫn thiết lập Environment Variables

## Vấn đề: DATABASE_URL is not set

Lỗi này xảy ra khi biến môi trường `DATABASE_URL` chưa được cấu hình.

## Giải pháp

### Bước 1: Tạo file `.env` trong thư mục `backend/`

Tạo file `backend/.env` với nội dung sau:

```env
# Database Configuration
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course

# JWT Secret Key (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Seed Configuration (optional)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PW=Admin123!
SEED_ADMIN_NAME=System Admin
```

### Bước 2: Cấu hình DATABASE_URL

#### Nếu sử dụng Docker Compose:

```env
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course
```

**Lưu ý**: Database name đã được thống nhất là `online_course` trong cả docker-compose.yml và database.sql.

#### Nếu sử dụng PostgreSQL local:

```env
DATABASE_URL=postgresql://[username]:[password]@localhost:5432/[database_name]
```

Ví dụ:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/online_course
```

### Bước 3: Khởi động Database

#### Với Docker Compose:

```bash
# Khởi động PostgreSQL
docker-compose up -d postgres

# Chờ vài giây để database khởi động, sau đó chạy schema
psql -h localhost -U online_course -d online_course -f database.sql
```

Hoặc nếu database chưa tồn tại:

```bash
# Tạo database trước
docker exec -it ocp-postgres psql -U online_course -c "CREATE DATABASE online_course;"

# Sau đó chạy schema
psql -h localhost -U online_course -d online_course -f database.sql
```

#### Với PostgreSQL local:

```bash
# Tạo database
createdb online_course

# Chạy schema
psql -d online_course -f database.sql
```

### Bước 4: Test kết nối

```bash
cd backend
npm run db:seed-admin
```

Nếu thành công, bạn sẽ thấy:
```
✅ Database connected successfully
✅ Created admin user successfully!
```

## Các biến môi trường quan trọng

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `DATABASE_URL` | Connection string cho PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret key cho JWT tokens | `your-secret-key` |
| `PORT` | Port cho backend server | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `SEED_ADMIN_EMAIL` | Email cho admin account | `admin@example.com` |
| `SEED_ADMIN_PW` | Password cho admin account | `Admin123!` |

## Troubleshooting

### Lỗi: "connection refused"

**Nguyên nhân**: PostgreSQL chưa chạy hoặc sai host/port

**Giải pháp**:
1. Kiểm tra PostgreSQL đang chạy: `docker ps` hoặc `pg_isready`
2. Kiểm tra DATABASE_URL có đúng host và port không
3. Với Docker: `docker-compose up -d postgres`

### Lỗi: "database does not exist"

**Nguyên nhân**: Database chưa được tạo

**Giải pháp**:
1. Tạo database: `createdb online_course`
2. Hoặc chạy database.sql để tạo schema

### Lỗi: "password authentication failed"

**Nguyên nhân**: Sai username/password

**Giải pháp**:
1. Kiểm tra DATABASE_URL có đúng username/password không
2. Với Docker: kiểm tra POSTGRES_USER và POSTGRES_PASSWORD trong docker-compose.yml

### Lỗi: "relation does not exist"

**Nguyên nhân**: Tables chưa được tạo

**Giải pháp**:
1. Chạy database.sql để tạo tất cả tables
2. `psql -d online_course -f database.sql`

## Quick Start

```bash
# 1. Tạo file .env
cd backend
cp .env.example .env  # Nếu có file .env.example
# Hoặc tạo thủ công theo hướng dẫn trên

# 2. Khởi động database
docker-compose up -d postgres

# 3. Tạo database và schema
docker exec -it ocp-postgres psql -U online_course -c "CREATE DATABASE online_course;"
psql -h localhost -U online_course -d online_course -f database.sql

# 4. Seed admin account
npm run db:seed-admin

# 5. Start backend
npm run dev
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: 
- Không commit file `.env` vào git (đã có trong .gitignore)
- Thay đổi `JWT_SECRET` và password trong production
- Sử dụng strong password cho database trong production

