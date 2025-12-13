#!/bin/bash

# Script để kill process đang dùng port 4000 hoặc 3000

PORT=${1:-4000}

echo "🔍 Đang tìm process đang dùng port $PORT..."

PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT không có process nào đang sử dụng"
    exit 0
fi

echo "📌 Tìm thấy process: $PID"
echo "🛑 Đang kill process..."

kill -9 $PID

sleep 1

# Kiểm tra lại
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Không thể kill process. Thử với quyền sudo:"
    echo "   sudo kill -9 $PID"
else
    echo "✅ Đã giải phóng port $PORT"
fi

