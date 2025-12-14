require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function insertCourseForDuc1() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Tìm hoặc tạo user duc1@gmail.com
    let userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['duc1@gmail.com']
    );

    let userId;
    if (userResult.rows.length === 0) {
      // Tạo user mới với password: password123
      const passwordHash = await bcrypt.hash('password123', 10);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['duc1@gmail.com', passwordHash, 'Duc User', 'STUDENT', true]
      );
      userId = result.rows[0].id;
      console.log('✅ Đã tạo user mới: duc1@gmail.com với ID:', userId);
      console.log('   Password: password123');
    } else {
      userId = userResult.rows[0].id;
      console.log('ℹ️  User duc1@gmail.com đã tồn tại với ID:', userId);
      
      // Cập nhật password hash nếu cần (để đảm bảo password đúng)
      const passwordHash = await bcrypt.hash('password123', 10);
      await client.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [passwordHash, userId]
      );
      console.log('✅ Đã cập nhật password hash cho user (password: password123)');
    }

    // Tìm một instructor
    let instructorResult = await client.query(
      "SELECT id FROM users WHERE role = 'INSTRUCTOR' LIMIT 1"
    );

    let instructorId;
    if (instructorResult.rows.length === 0) {
      // Tạo instructor mẫu với password: password123
      const passwordHash = await bcrypt.hash('password123', 10);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['instructor@test.com', passwordHash, 'Instructor Test', 'INSTRUCTOR', true]
      );
      instructorId = result.rows[0].id;
      console.log('✅ Đã tạo instructor mới với ID:', instructorId);
      console.log('   Password: password123');
    } else {
      instructorId = instructorResult.rows[0].id;
      console.log('ℹ️  Sử dụng instructor có ID:', instructorId);
    }

    // Tạo khóa học mới
    const slug = `lap-trinh-web-fullstack-${Date.now()}`;
    const courseResult = await client.query(
      `INSERT INTO courses (
        instructor_id, title, slug, description, price_cents, currency,
        is_published, published_at, thumbnail_url, lang
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)
      RETURNING id, title, slug`,
      [
        instructorId,
        'Khóa học Lập trình Web Full-stack',
        slug,
        'Khóa học toàn diện về lập trình web full-stack, từ frontend đến backend. Học React, Node.js, PostgreSQL và các công nghệ hiện đại.',
        0, // Miễn phí
        'VND',
        true,
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        'vi'
      ]
    );

    const courseId = courseResult.rows[0].id;
    console.log('✅ Đã tạo khóa học mới:');
    console.log('   ID:', courseId);
    console.log('   Title:', courseResult.rows[0].title);
    console.log('   Slug:', courseResult.rows[0].slug);

    // Tạo enrollment
    await client.query(
      `INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
       VALUES ($1, $2, 'ACTIVE', NOW())
       ON CONFLICT (course_id, student_id) DO NOTHING`,
      [courseId, userId]
    );
    console.log('✅ Đã đăng ký user duc1@gmail.com vào khóa học');

    // Tạo module và lesson mẫu
    const moduleResult = await client.query(
      `INSERT INTO modules (course_id, title, position)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [courseId, 'Module 1: Giới thiệu', 1]
    );

    const moduleId = moduleResult.rows[0].id;
    
    await client.query(
      `INSERT INTO lessons (module_id, title, position, duration_s)
       VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Bài 1: Tổng quan về Web Development', 1, 1800]
    );
    console.log('✅ Đã tạo module và lesson mẫu');

    await client.query('COMMIT');
    
    console.log('\n🎉 Hoàn thành! User duc1@gmail.com đã có khóa học với ID:', courseId);
    
    // Hiển thị thông tin
    const infoResult = await client.query(
      `SELECT 
        c.id as course_id,
        c.title,
        c.slug,
        c.price_cents,
        u.email as student_email,
        u.full_name as student_name,
        e.status as enrollment_status,
        e.enrolled_at
      FROM courses c
      JOIN enrollments e ON e.course_id = c.id
      JOIN users u ON u.id = e.student_id
      WHERE u.email = 'duc1@gmail.com' AND c.id = $1`,
      [courseId]
    );

    if (infoResult.rows.length > 0) {
      console.log('\n📋 Thông tin khóa học:');
      console.log(JSON.stringify(infoResult.rows[0], null, 2));
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Chạy script
insertCourseForDuc1()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

