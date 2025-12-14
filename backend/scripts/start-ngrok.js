/**
 * Script helper để start ngrok và tự động update .env
 * Sử dụng: node scripts/start-ngrok.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ngrok...');
console.log('📝 Lưu ý: Script này sẽ start ngrok và tự động update .env');
console.log('⚠️  Nếu ngrok chưa được cài đặt, vui lòng cài đặt trước:\n');
console.log('   1. Download từ: https://ngrok.com/download');
console.log('   2. Hoặc dùng: npm install -g ngrok');
console.log('   3. Authenticate: ngrok config add-authtoken YOUR_TOKEN\n');

// Kiểm tra ngrok có sẵn không
const ngrokProcess = spawn('ngrok', ['http', '5000'], {
  stdio: 'inherit',
  shell: true
});

console.log('✅ Ngrok đang chạy trên port 5000');
console.log('⏳ Đợi 3 giây để ngrok khởi động...\n');

// Đợi ngrok start, sau đó update .env
setTimeout(() => {
  console.log('🔄 Đang cập nhật .env...\n');
  const updateScript = spawn('node', [path.join(__dirname, 'update-ngrok-url.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  updateScript.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Hoàn tất!');
      console.log('📋 Tiếp theo:');
      console.log('   1. Copy SEPAY_WEBHOOK_URL từ .env');
      console.log('   2. Cấu hình trên SePay Dashboard');
      console.log('   3. Giữ terminal này mở để ngrok tiếp tục chạy\n');
    }
  });
}, 3000);

// Xử lý khi ngrok bị tắt
ngrokProcess.on('close', (code) => {
  console.log(`\n⚠️  Ngrok đã dừng (code: ${code})`);
});

// Xử lý lỗi
ngrokProcess.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('❌ Ngrok chưa được cài đặt!');
    console.error('💡 Hãy cài đặt ngrok trước:');
    console.error('   - Download: https://ngrok.com/download');
    console.error('   - Hoặc: npm install -g ngrok');
  } else {
    console.error('❌ Lỗi:', error.message);
  }
  process.exit(1);
});

