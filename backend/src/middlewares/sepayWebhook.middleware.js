/**
 * Middleware để verify SePay Webhook API Key
 * SePay gửi header: Authorization: APIkey_YOUR_API_KEY
 */

function verifySePayWebhookApiKey(req, res, next) {
  const authHeader = req.headers['authorization'];
  const expectedApiKey = process.env.SEPAY_WEBHOOK_API_KEY;

  // Kiểm tra API Key có được cấu hình không
  if (!expectedApiKey) {
    console.error('⚠️  SEPAY_WEBHOOK_API_KEY chưa được cấu hình trong .env');
    return res.status(500).json({ 
      error: 'Webhook authentication not configured' 
    });
  }

  // Kiểm tra header có tồn tại không
  if (!authHeader) {
    console.warn('⚠️  SePay webhook request thiếu Authorization header');
    return res.status(401).json({ 
      error: 'Missing Authorization header' 
    });
  }

  // SePay có thể gửi nhiều format:
  // 1. "APIkey_YOUR_API_KEY" (format chuẩn)
  // 2. "Apikey YOUR_API_KEY" (có khoảng trắng, chữ thường "Apikey")
  // 3. "APIkey YOUR_API_KEY" (có khoảng trắng, chữ hoa "APIkey")
  
  // Normalize header: loại bỏ khoảng trắng, chuẩn hóa prefix
  let normalizedHeader = authHeader.trim();
  
  // Xử lý các format khác nhau
  if (normalizedHeader.startsWith('Apikey ')) {
    // Format: "Apikey KEY" -> chuyển thành "APIkey_KEY"
    normalizedHeader = normalizedHeader.replace(/^Apikey\s+/i, 'APIkey_');
  } else if (normalizedHeader.startsWith('APIkey ')) {
    // Format: "APIkey KEY" -> chuyển thành "APIkey_KEY"
    normalizedHeader = normalizedHeader.replace(/^APIkey\s+/i, 'APIkey_');
  } else if (!normalizedHeader.startsWith('APIkey_')) {
    // Nếu không khớp format nào, thử thêm prefix
    if (!normalizedHeader.includes('_') && !normalizedHeader.includes(' ')) {
      normalizedHeader = `APIkey_${normalizedHeader}`;
    }
  }

  // Format mong đợi: "APIkey_YOUR_API_KEY"
  const expectedHeader = `APIkey_${expectedApiKey}`;

  // So sánh API Key (case-insensitive cho phần prefix)
  if (normalizedHeader.toLowerCase() !== expectedHeader.toLowerCase()) {
    console.warn('⚠️  SePay webhook API Key không hợp lệ');
    console.warn('   Received:', authHeader.substring(0, 30) + '...');
    console.warn('   Normalized:', normalizedHeader.substring(0, 30) + '...');
    console.warn('   Expected:', expectedHeader.substring(0, 30) + '...');
    return res.status(401).json({ 
      error: 'Invalid API Key' 
    });
  }

  // API Key hợp lệ, tiếp tục
  console.log('✅ SePay webhook API Key verified');
  next();
}

module.exports = {
  verifySePayWebhookApiKey,
};

