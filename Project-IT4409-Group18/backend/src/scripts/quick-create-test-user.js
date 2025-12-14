#!/usr/bin/env node

console.log('🚀 Bắt đầu script...');

require('dotenv').config();
const bcrypt = require('bcryptjs');

console.log('✅ Đã load dotenv');

const pool = require('../config/db');

console.log('✅ Đã load database pool');

async function main() {
  let client;
  try {
    console.log('🔄 Đang kết nối database...');
    client = await pool.connect();
    console.log('✅ Đã kết nối database');

    const email = 'testuser@example.com';
    const password = 'password123';
    const name = 'Test User';

    console.log('\n📋 Thông tin user sẽ tạo:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Name:', name);

    // Tạo password hash
    console.log('\n🔄 Đang tạo password hash...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Đã tạo hash (length:', passwordHash.length, ')');

    // Kiểm tra user
    console.log('\n🔄 Đang kiểm tra user...');
    const userCheck = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    let userId;
    if (userCheck.rows.length === 0) {
      console.log('ℹ️  User chưa tồn tại, đang tạo mới...');
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, full_name`,
        [email, passwordHash, name, 'STUDENT', true]
      );
      userId = result.rows[0].id;
      console.log('✅ Đã tạo user mới:');
      console.log('   ID:', userId);
      console.log('   Email:', result.rows[0].email);
      console.log('   Name:', result.rows[0].full_name);
    } else {
      userId = userCheck.rows[0].id;
      console.log('ℹ️  User đã tồn tại, đang cập nhật password...');
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, userId]
      );
      console.log('✅ Đã cập nhật password');
    }

    // Test password
    console.log('\n🔄 Đang test password...');
    const testUser = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    const isValid = await bcrypt.compare(password, testUser.rows[0].password_hash);
    if (isValid) {
      console.log('✅ Password test thành công!');
    } else {
      console.log('❌ Password test thất bại!');
    }

    // Tìm hoặc tạo instructor
    console.log('\n🔄 Đang tìm instructor...');
    let instructorResult = await client.query(
      "SELECT id FROM users WHERE role = 'INSTRUCTOR' LIMIT 1"
    );

    let instructorId;
    if (instructorResult.rows.length === 0) {
      console.log('ℹ️  Chưa có instructor, đang tạo...');
      const instHash = await bcrypt.hash('password123', 10);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['instructor@example.com', instHash, 'Test Instructor', 'INSTRUCTOR', true]
      );
      instructorId = result.rows[0].id;
      console.log('✅ Đã tạo instructor (ID:', instructorId, ')');
    } else {
      instructorId = instructorResult.rows[0].id;
      console.log('✅ Tìm thấy instructor (ID:', instructorId, ')');
    }

    // Tìm khóa học
    console.log('\n🔄 Đang tìm khóa học...');
    let coursesResult = await client.query(
      `SELECT id, title FROM courses WHERE is_published = true ORDER BY id LIMIT 3`
    );

    if (coursesResult.rows.length === 0) {
      console.log('⚠️  Không có khóa học, đang tạo 3 khóa học mẫu...');
      
      const courses = [
        { title: 'JavaScript Cơ bản', price: 0 },
        { title: 'React.js', price: 490000 },
        { title: 'Node.js Backend', price: 590000 }
      ];

      for (const course of courses) {
        const slug = course.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const result = await client.query(
          `INSERT INTO courses (instructor_id, title, slug, description, price_cents, currency, is_published, published_at, lang)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
           RETURNING id, title`,
          [
            instructorId,
            course.title,
            slug,
            'Mô tả khóa học ' + course.title,
            course.price,
            'VND',
            true,
            'vi'
          ]
        );
        console.log('✅ Đã tạo:', result.rows[0].title, '(ID:', result.rows[0].id, ')');
      }

      // Lấy lại danh sách
      coursesResult = await client.query(
        `SELECT id, title FROM courses WHERE is_published = true ORDER BY id DESC LIMIT 3`
      );
    }

    console.log(`\n📚 Tìm thấy ${coursesResult.rows.length} khóa học`);

    // Đăng ký vào khóa học
    console.log('\n🔄 Đang đăng ký khóa học...');
    let enrolledCount = 0;
    for (const course of coursesResult.rows) {
      try {
        await client.query(
          `INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
           VALUES ($1, $2, 'ACTIVE', NOW())
           ON CONFLICT (course_id, student_id) DO NOTHING`,
          [course.id, userId]
        );
        
        const check = await client.query(
          'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
          [course.id, userId]
        );
        
        if (check.rows.length > 0) {
          enrolledCount++;
          console.log('✅ Đã đăng ký:', course.title);
        }
      } catch (err) {
        console.log('⚠️  Lỗi:', course.title, '-', err.message);
      }
    }

    console.log('\n🎉 Hoàn thành!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log(`\n📚 Đã đăng ký ${enrolledCount} khóa học`);

  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      client.release();
    }
    pool.end();
  }
}

main();

