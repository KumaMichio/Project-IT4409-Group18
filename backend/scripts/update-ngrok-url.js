/**
 * Script tự động cập nhật ngrok URL vào .env file
 * Chạy script này sau khi start ngrok để tự động update URLs
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ENV_FILE = path.join(__dirname, '..', '.env');
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';

async function getNgrokUrl() {
  try {
    const response = await axios.get(NGROK_API, { timeout: 2000 });
    const tunnels = response.data.tunnels || [];
    
    // Tìm HTTPS tunnel
    const httpsTunnel = tunnels.find(t => t.proto === 'https');
    if (httpsTunnel) {
      return httpsTunnel.public_url;
    }
    
    // Fallback to HTTP tunnel
    const httpTunnel = tunnels.find(t => t.proto === 'http');
    if (httpTunnel) {
      return httpTunnel.public_url;
    }
    
    return null;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Ngrok không chạy. Hãy start ngrok trước: ngrok http 5000');
    } else {
      console.error('❌ Lỗi khi lấy ngrok URL:', error.message);
    }
    return null;
  }
}

function updateEnvFile(ngrokUrl) {
  try {
    let envContent = '';
    
    // Đọc file .env nếu tồn tại
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
    }
    
    // Update hoặc thêm BACKEND_URL
    if (envContent.includes('BACKEND_URL=')) {
      envContent = envContent.replace(/BACKEND_URL=.*/g, `BACKEND_URL=${ngrokUrl}`);
    } else {
      envContent += `\nBACKEND_URL=${ngrokUrl}\n`;
    }
    
    // Update hoặc thêm SEPAY_WEBHOOK_URL
    if (envContent.includes('SEPAY_WEBHOOK_URL=')) {
      envContent = envContent.replace(/SEPAY_WEBHOOK_URL=.*/g, `SEPAY_WEBHOOK_URL=${ngrokUrl}/api/payments/sepay-webhook`);
    } else {
      envContent += `SEPAY_WEBHOOK_URL=${ngrokUrl}/api/payments/sepay-webhook\n`;
    }
    
    // Update hoặc thêm SEPAY_RETURN_URL
    if (envContent.includes('SEPAY_RETURN_URL=')) {
      envContent = envContent.replace(/SEPAY_RETURN_URL=.*/g, `SEPAY_RETURN_URL=${ngrokUrl}/api/payments/sepay-return`);
    } else {
      envContent += `SEPAY_RETURN_URL=${ngrokUrl}/api/payments/sepay-return\n`;
    }
    
    // Ghi lại file
    fs.writeFileSync(ENV_FILE, envContent, 'utf8');
    console.log('✅ Đã cập nhật .env với ngrok URL:', ngrokUrl);
    console.log('📝 SEPAY_WEBHOOK_URL:', `${ngrokUrl}/api/payments/sepay-webhook`);
    console.log('📝 SEPAY_RETURN_URL:', `${ngrokUrl}/api/payments/sepay-return`);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật .env:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Đang lấy ngrok URL...');
  
  const ngrokUrl = await getNgrokUrl();
  
  if (!ngrokUrl) {
    console.log('\n💡 Hướng dẫn:');
    console.log('1. Mở terminal mới và chạy: ngrok http 5000');
    console.log('2. Đợi ngrok start xong');
    console.log('3. Chạy lại script này: node scripts/update-ngrok-url.js');
    process.exit(1);
  }
  
  console.log('✅ Tìm thấy ngrok URL:', ngrokUrl);
  updateEnvFile(ngrokUrl);
}

// Chạy script
main();

