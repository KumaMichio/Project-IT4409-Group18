require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const testEmail = 'testuser@example.com';
    const testPassword = 'password123';
    const testName = 'Test User';

    console.log('🔧 Bắt đầu tạo user test...');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);

    // Kiểm tra user đã tồn tại chưa
    let userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [testEmail]
    );

    let userId;
    if (userResult.rows.length === 0) {
      // Tạo user mới với password hash đúng
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, full_name, role`,
        [testEmail, passwordHash, testName, 'STUDENT', true]
      );
      userId = result.rows[0].id;
      console.log('✅ Đã tạo user mới:');
      console.log('   ID:', userId);
      console.log('   Email:', result.rows[0].email);
      console.log('   Name:', result.rows[0].full_name);
      console.log('   Role:', result.rows[0].role);
    } else {
      userId = userResult.rows[0].id;
      console.log('ℹ️  User đã tồn tại, cập nhật password...');
      
      // Cập nhật password để đảm bảo đúng
      const passwordHash = await bcrypt.hash(testPassword, 10);
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, userId]
      );
      console.log('✅ Đã cập nhật password');
    }

    // Tìm các khóa học có sẵn (đã published)
    const coursesResult = await client.query(
      `SELECT id, title, slug, price_cents 
       FROM courses 
       WHERE is_published = true 
       ORDER BY id 
       LIMIT 5`
    );

    if (coursesResult.rows.length === 0) {
      console.log('⚠️  Không có khóa học nào, đang tạo khóa học mẫu...');
      
      // Tìm hoặc tạo instructor
      let instructorResult = await client.query(
        "SELECT id FROM users WHERE role = 'INSTRUCTOR' LIMIT 1"
      );

      let instructorId;
      if (instructorResult.rows.length === 0) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const result = await client.query(
          `INSERT INTO users (email, password_hash, full_name, role, is_active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          ['instructor@example.com', passwordHash, 'Test Instructor', 'INSTRUCTOR', true]
        );
        instructorId = result.rows[0].id;
      } else {
        instructorId = instructorResult.rows[0].id;
      }

      // Tạo 3 khóa học mẫu
      const sampleCourses = [
        {
          title: 'Khóa học JavaScript Cơ bản',
          slug: `javascript-co-ban-${Date.now()}`,
          description: 'Học JavaScript từ cơ bản đến nâng cao, ES6+, async/await, và các best practices.',
          price: 0
        },
        {
          title: 'Khóa học React.js',
          slug: `reactjs-${Date.now()}`,
          description: 'Xây dựng ứng dụng web hiện đại với React, Hooks, Context API, và Redux.',
          price: 490000
        },
        {
          title: 'Khóa học Node.js Backend',
          slug: `nodejs-backend-${Date.now()}`,
          description: 'Xây dựng RESTful API với Node.js, Express, và PostgreSQL.',
          price: 590000
        }
      ];

      for (const course of sampleCourses) {
        const result = await client.query(
          `INSERT INTO courses (
            instructor_id, title, slug, description, price_cents, currency,
            is_published, published_at, thumbnail_url, lang
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)
          RETURNING id, title`,
          [
            instructorId,
            course.title,
            course.slug,
            course.description,
            course.price,
            'VND',
            true,
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            'vi'
          ]
        );
        console.log(`✅ Đã tạo khóa học: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
      }

      // Lấy lại danh sách khóa học
      const newCoursesResult = await client.query(
        `SELECT id, title, slug, price_cents 
         FROM courses 
         WHERE is_published = true 
         ORDER BY id DESC
         LIMIT 3`
      );
      coursesResult.rows = newCoursesResult.rows;
    }

    console.log(`\n📚 Tìm thấy ${coursesResult.rows.length} khóa học, đang đăng ký...`);

    // Đăng ký user vào các khóa học (tối đa 3 khóa)
    const coursesToEnroll = coursesResult.rows.slice(0, 3);
    let enrolledCount = 0;

    for (const course of coursesToEnroll) {
      try {
        await client.query(
          `INSERT INTO enrollments (course_id, student_id, status, enrolled_at)
           VALUES ($1, $2, 'ACTIVE', NOW())
           ON CONFLICT (course_id, student_id) DO NOTHING`,
          [course.id, userId]
        );
        
        // Kiểm tra xem có insert thành công không
        const checkResult = await client.query(
          'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
          [course.id, userId]
        );
        
        if (checkResult.rows.length > 0) {
          enrolledCount++;
          console.log(`✅ Đã đăng ký: ${course.title} (ID: ${course.id})`);
        } else {
          console.log(`ℹ️  Đã đăng ký trước đó: ${course.title}`);
        }
      } catch (err) {
        console.log(`⚠️  Lỗi khi đăng ký ${course.title}:`, err.message);
      }
    }

    // Tạo module và lesson cho khóa học đầu tiên (nếu chưa có)
    if (coursesToEnroll.length > 0) {
      const firstCourseId = coursesToEnroll[0].id;
      
      // Kiểm tra xem đã có module chưa
      const moduleCheck = await client.query(
        'SELECT id FROM modules WHERE course_id = $1 LIMIT 1',
        [firstCourseId]
      );

      if (moduleCheck.rows.length === 0) {
        const moduleResult = await client.query(
          `INSERT INTO modules (course_id, title, position)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [firstCourseId, 'Module 1: Giới thiệu', 1]
        );

        const moduleId = moduleResult.rows[0].id;
        
        await client.query(
          `INSERT INTO lessons (module_id, title, position, duration_s)
           VALUES ($1, $2, $3, $4)`,
          [moduleId, 'Bài 1: Tổng quan', 1, 1800]
        );
        console.log('✅ Đã tạo module và lesson mẫu cho khóa học đầu tiên');
      }
    }

    await client.query('COMMIT');

    console.log('\n🎉 Hoàn thành!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log(`\n📚 Đã đăng ký ${enrolledCount} khóa học:`);
    
    // Hiển thị danh sách khóa học đã đăng ký
    const enrollmentsResult = await client.query(
      `SELECT 
        c.id as course_id,
        c.title,
        c.slug,
        c.price_cents,
        e.status,
        e.enrolled_at
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    enrollmentsResult.rows.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (ID: ${course.course_id})`);
      console.log(`      Status: ${course.status}, Đăng ký: ${new Date(course.enrolled_at).toLocaleString('vi-VN')}`);
    });

    console.log('\n💡 Bây giờ bạn có thể:');
    console.log('   1. Đăng nhập với:', testEmail, '/', testPassword);
    console.log('   2. Vào /my-courses để xem các khóa học đã đăng ký');
    console.log('   3. Vào /courses/[courseId] để xem chi tiết khóa học');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Chạy script
createTestUser()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

