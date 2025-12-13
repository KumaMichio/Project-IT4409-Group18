# Quick Start Guide - Fix DATABASE_URL Error

## Vấn đề
Lỗi: `DATABASE_URL is not set`

## Giải pháp nhanh (3 bước)

### Bước 1: Tạo file `.env`

Tạo file `backend/.env`:

```bash
cd backend
cat > .env << EOF
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3001
NODE_ENV=development
EOF
```

### Bước 2: Khởi động Database

```bash
# Từ thư mục root của project
docker-compose up -d postgres

# Đợi vài giây để database khởi động
sleep 5

# Tạo database và schema
docker exec -it ocp-postgres psql -U online_course -c "CREATE DATABASE online_course;" 2>/dev/null || true
psql -h localhost -U online_course -d online_course -f database.sql
```

**Lưu ý**: Nếu chưa có PostgreSQL client, có thể dùng Docker:

```bash
docker exec -i ocp-postgres psql -U online_course -d online_course < database.sql
```

### Bước 3: Test

```bash
cd backend
npm run db:seed-admin
```

Nếu thấy `✅ Database connected successfully` và `✅ Created admin user successfully!` thì đã thành công!

## Nếu không dùng Docker

### Cài đặt PostgreSQL local

**Windows**:
- Download từ https://www.postgresql.org/download/windows/
- Hoặc dùng Chocolatey: `choco install postgresql`

**Mac**:
```bash
brew install postgresql
brew services start postgresql
```

**Linux**:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Tạo database

```bash
# Tạo user (nếu chưa có)
createuser -s online_course

# Tạo database
createdb online_course

# Chạy schema
psql -d online_course -f database.sql
```

### Cập nhật .env

```env
DATABASE_URL=postgresql://online_course:your_password@localhost:5432/online_course
```

## Verify

Sau khi setup, chạy:

```bash
cd backend
npm run db:seed-admin
```

Kết quả mong đợi:
```
✅ Database connected successfully
🔧 Starting admin seed script...
📧 Email: admin@example.com
👤 Name: System Admin
✅ Created admin user successfully!
...
✨ Done!
```

## Troubleshooting

### "connection refused"
→ PostgreSQL chưa chạy. Kiểm tra: `docker ps` hoặc `pg_isready`

### "database does not exist"  
→ Chạy: `createdb online_course` hoặc tạo qua docker

### "password authentication failed"
→ Kiểm tra username/password trong DATABASE_URL

### "relation does not exist"
→ Chạy `database.sql` để tạo tables

## Xem thêm

Chi tiết đầy đủ: [ENV_SETUP.md](./ENV_SETUP.md)

