require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function updatePassword() {
  const client = await pool.connect();
  
  try {
    // Tìm user duc1@gmail.com
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['duc1@gmail.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User duc1@gmail.com không tồn tại!');
      console.log('💡 Chạy script insert-course-for-duc1.js để tạo user mới');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log('✅ Tìm thấy user:', userResult.rows[0].email, 'ID:', userId);

    // Tạo hash mới cho password: password123
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('✅ Đã tạo password hash mới');

    // Cập nhật password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    console.log('✅ Đã cập nhật password cho duc1@gmail.com');
    console.log('📧 Email: duc1@gmail.com');
    console.log('🔑 Password: password123');
    console.log('\n💡 Bây giờ bạn có thể đăng nhập với:');
    console.log('   Email: duc1@gmail.com');
    console.log('   Password: password123');

    // Test password
    const testResult = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    const isValid = await bcrypt.compare('password123', testResult.rows[0].password_hash);
    if (isValid) {
      console.log('\n✅ Password đã được cập nhật đúng!');
    } else {
      console.log('\n❌ Password không khớp!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

updatePassword()
  .then(() => {
    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Thất bại:', error);
    process.exit(1);
  });

