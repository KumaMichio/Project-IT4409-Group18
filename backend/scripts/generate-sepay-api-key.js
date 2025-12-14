/**
 * Script tạo API Key an toàn cho SePay Webhook
 * Chạy: node scripts/generate-sepay-api-key.js
 */

const crypto = require('crypto');

// Tạo API Key ngẫu nhiên 32 bytes (64 ký tự hex)
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('🔑 SePay Webhook API Key đã được tạo:');
console.log('━'.repeat(60));
console.log(apiKey);
console.log('━'.repeat(60));
console.log('\n📝 Thêm vào file .env:');
console.log(`SEPAY_WEBHOOK_API_KEY=${apiKey}`);
console.log('\n⚠️  Lưu ý:');
console.log('   - Giữ key này bí mật, không commit lên git');
console.log('   - Copy key này và cấu hình trên SePay Dashboard');
console.log('   - Format trên SePay: APIkey_' + apiKey);

