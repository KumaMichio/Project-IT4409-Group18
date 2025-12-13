#!/bin/bash

# Script tự động chạy dự án Chat (UC13, UC14)
# Sử dụng: ./start.sh

set -e

echo "🚀 Bắt đầu setup dự án Chat..."

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js chưa được cài đặt. Vui lòng cài Node.js >= 18.x${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker chưa được cài đặt. Bạn cần cài PostgreSQL thủ công.${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}✅ Docker đã được cài đặt${NC}"
    USE_DOCKER=true
fi

# Bước 1: Setup Database
echo ""
echo -e "${YELLOW}📦 Bước 1: Setup Database...${NC}"

if [ "$USE_DOCKER" = true ]; then
    echo "Đang khởi động PostgreSQL container..."
    docker-compose up -d postgres
    
    echo "Đợi database khởi động..."
    sleep 5
    
    # Kiểm tra database đã tồn tại chưa
    if docker exec ocp-postgres psql -U online_course -d online_course -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Database đã tồn tại${NC}"
    else
        echo "Đang tạo database và schema..."
        docker exec -i ocp-postgres psql -U online_course -d postgres -c "CREATE DATABASE online_course;" 2>/dev/null || true
        docker exec -i ocp-postgres psql -U online_course -d online_course < database.sql
        echo -e "${GREEN}✅ Database đã được tạo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Vui lòng setup PostgreSQL thủ công và chạy database.sql${NC}"
fi

# Bước 2: Setup Backend
echo ""
echo -e "${YELLOW}🔧 Bước 2: Setup Backend...${NC}"

cd backend

# Kiểm tra .env
if [ ! -f .env ]; then
    echo "Đang tạo file .env..."
    cat > .env << EOF
DATABASE_URL=postgresql://online_course:secret@localhost:5432/online_course
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Đã tạo file .env${NC}"
else
    echo -e "${GREEN}✅ File .env đã tồn tại${NC}"
fi

# Cài đặt dependencies
if [ ! -d "node_modules" ]; then
    echo "Đang cài đặt dependencies..."
    npm install
    echo -e "${GREEN}✅ Đã cài đặt dependencies${NC}"
else
    echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
fi

# Seed admin (nếu chưa có)
echo "Đang seed admin user..."
npm run db:seed-admin || echo -e "${YELLOW}⚠️  Có thể admin đã tồn tại${NC}"

cd ..

# Bước 3: Setup Frontend
echo ""
echo -e "${YELLOW}🎨 Bước 3: Setup Frontend...${NC}"

cd frontend

# Kiểm tra .env.local
if [ ! -f .env.local ]; then
    echo "Đang tạo file .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
EOF
    echo -e "${GREEN}✅ Đã tạo file .env.local${NC}"
else
    echo -e "${GREEN}✅ File .env.local đã tồn tại${NC}"
fi

# Cài đặt dependencies
if [ ! -d "node_modules" ]; then
    echo "Đang cài đặt dependencies..."
    npm install
    echo -e "${GREEN}✅ Đã cài đặt dependencies${NC}"
else
    echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
fi

cd ..

# Hoàn thành
echo ""
echo -e "${GREEN}✨ Setup hoàn tất!${NC}"
echo ""
echo "📝 Để chạy dự án:"
echo ""
echo "  1. Chạy Backend (terminal 1):"
echo "     cd backend && npm run dev"
echo ""
echo "  2. Chạy Frontend (terminal 2):"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Truy cập:"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend API: http://localhost:4000"
echo ""
echo "  4. Test Chat:"
echo "     - Course Chat: http://localhost:3000/chat/[courseId]"
echo "     - Instructor DM: http://localhost:3000/chat/instructor/[studentId]"
echo ""

