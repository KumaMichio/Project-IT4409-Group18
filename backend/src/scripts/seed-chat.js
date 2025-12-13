const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Check DATABASE_URL before importing db
if (!process.env.DATABASE_URL) {
  console.error(
    '\n❌ DATABASE_URL is not set!\n' +
    'Please create a .env file in the backend directory.\n'
  );
  process.exit(1);
}

const { pool } = require('../config/db');

// Test users data
const testUsers = [
  {
    email: 'student1@test.com',
    password: '123456',
    name: 'Học viên Nguyễn Văn A',
    role: 'STUDENT',
  },
  {
    email: 'student2@test.com',
    password: '123456',
    name: 'Học viên Trần Thị B',
    role: 'STUDENT',
  },
  {
    email: 'instructor1@test.com',
    password: '123456',
    name: 'Giảng viên Lê Văn C',
    role: 'INSTRUCTOR',
  },
  {
    email: 'instructor2@test.com',
    password: '123456',
    name: 'Giảng viên Phạm Thị D',
    role: 'INSTRUCTOR',
  },
];

async function createUser(userData) {
  const { email, password, name, role } = userData;
  
  // Check if user exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );

  if (existing.rows.length > 0) {
    console.log(`  ⚠️  User ${email} already exists (ID: ${existing.rows[0].id})`);
    return existing.rows[0].id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, passwordHash, name, role]
  );

  return result.rows[0].id;
}

async function createCourse(instructorId, courseData) {
  const { title, description, price } = courseData;
  
  // Check if course exists
  const existing = await pool.query(
    'SELECT id FROM courses WHERE instructor_id = $1 AND title = $2 LIMIT 1',
    [instructorId, title]
  );

  if (existing.rows.length > 0) {
    console.log(`  ⚠️  Course "${title}" already exists (ID: ${existing.rows[0].id})`);
    return existing.rows[0].id;
  }

  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const result = await pool.query(
    `INSERT INTO courses (instructor_id, title, slug, description, price_cents, is_published)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [instructorId, title, slug, description, price * 100, true]
  );

  return result.rows[0].id;
}

async function createEnrollment(studentId, courseId) {
  // Check if enrollment exists
  const existing = await pool.query(
    'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2 LIMIT 1',
    [studentId, courseId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO enrollments (student_id, course_id, status)
     VALUES ($1, $2, 'ACTIVE')
     RETURNING id`,
    [studentId, courseId]
  );

  return result.rows[0].id;
}

async function createChannelMessage(channelId, userId, content) {
  const result = await pool.query(
    `INSERT INTO messages (channel_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [channelId, userId, content]
  );
  return result.rows[0].id;
}

async function createDMMessage(threadId, senderId, content) {
  const result = await pool.query(
    `INSERT INTO dm_messages (thread_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [threadId, senderId, content]
  );
  return result.rows[0].id;
}

async function main() {
  console.log('🌱 Starting chat seed script...\n');

  try {
    // 1. Create test users
    console.log('📝 Step 1: Creating test users...');
    const userIds = {};
    
    for (const userData of testUsers) {
      const userId = await createUser(userData);
      userIds[userData.email] = userId;
      console.log(`  ✅ Created ${userData.role}: ${userData.name} (ID: ${userId})`);
    }

    const student1Id = userIds['student1@test.com'];
    const student2Id = userIds['student2@test.com'];
    const instructor1Id = userIds['instructor1@test.com'];
    const instructor2Id = userIds['instructor2@test.com'];

    console.log('\n📚 Step 2: Creating courses...');
    
    // 2. Create courses
    const course1Id = await createCourse(instructor1Id, {
      title: 'Lập trình JavaScript cơ bản',
      description: 'Khóa học JavaScript từ cơ bản đến nâng cao',
      price: 500000, // 500,000 VND
    });
    console.log(`  ✅ Created course 1 (ID: ${course1Id})`);

    const course2Id = await createCourse(instructor1Id, {
      title: 'React.js cho người mới bắt đầu',
      description: 'Học React.js từ zero to hero',
      price: 800000,
    });
    console.log(`  ✅ Created course 2 (ID: ${course2Id})`);

    const course3Id = await createCourse(instructor2Id, {
      title: 'Node.js Backend Development',
      description: 'Xây dựng API với Node.js và Express',
      price: 1000000,
    });
    console.log(`  ✅ Created course 3 (ID: ${course3Id})`);

    console.log('\n🎓 Step 3: Creating enrollments...');
    
    // 3. Create enrollments
    await createEnrollment(student1Id, course1Id);
    console.log(`  ✅ Student 1 enrolled in course 1`);
    
    await createEnrollment(student1Id, course2Id);
    console.log(`  ✅ Student 1 enrolled in course 2`);
    
    await createEnrollment(student2Id, course1Id);
    console.log(`  ✅ Student 2 enrolled in course 1`);
    
    await createEnrollment(student2Id, course3Id);
    console.log(`  ✅ Student 2 enrolled in course 3`);

    console.log('\n💬 Step 4: Creating course channel messages...');
    
    // 4. Get or create course channels
    const channels = {};
    for (const courseId of [course1Id, course2Id, course3Id]) {
      // Check if channel exists
      let channelRes = await pool.query(
        'SELECT id FROM course_channels WHERE course_id = $1',
        [courseId]
      );

      if (channelRes.rows.length === 0) {
        channelRes = await pool.query(
          `INSERT INTO course_channels (course_id, name, description)
           VALUES ($1, 'General', 'Course discussion channel')
           RETURNING id`,
          [courseId]
        );
      }
      channels[courseId] = channelRes.rows[0].id;
    }

    // Create sample messages in course 1 channel
    const channel1Id = channels[course1Id];
    await createChannelMessage(channel1Id, instructor1Id, 'Chào mừng các bạn đến với khóa học JavaScript!');
    await createChannelMessage(channel1Id, student1Id, 'Em chào thầy! Em rất hào hứng với khóa học này.');
    await createChannelMessage(channel1Id, student2Id, 'Em cũng vậy ạ!');
    await createChannelMessage(channel1Id, instructor1Id, 'Rất vui được đồng hành cùng các em!');
    console.log(`  ✅ Created 4 messages in course 1 channel`);

    // Create sample messages in course 2 channel
    const channel2Id = channels[course2Id];
    await createChannelMessage(channel2Id, instructor1Id, 'Khóa học React sẽ bắt đầu vào tuần tới!');
    await createChannelMessage(channel2Id, student1Id, 'Em đã sẵn sàng!');
    console.log(`  ✅ Created 2 messages in course 2 channel`);

    console.log('\n📨 Step 5: Creating DM threads and messages...');
    
    // 5. Create DM threads
    let thread1Res = await pool.query(
      'SELECT id FROM dm_threads WHERE student_id = $1 AND instructor_id = $2',
      [student1Id, instructor1Id]
    );
    if (thread1Res.rows.length === 0) {
      thread1Res = await pool.query(
        `INSERT INTO dm_threads (student_id, instructor_id)
         VALUES ($1, $2)
         RETURNING id`,
        [student1Id, instructor1Id]
      );
    }
    const thread1Id = thread1Res.rows[0].id;

    let thread2Res = await pool.query(
      'SELECT id FROM dm_threads WHERE student_id = $1 AND instructor_id = $2',
      [student2Id, instructor2Id]
    );
    if (thread2Res.rows.length === 0) {
      thread2Res = await pool.query(
        `INSERT INTO dm_threads (student_id, instructor_id)
         VALUES ($1, $2)
         RETURNING id`,
        [student2Id, instructor2Id]
      );
    }
    const thread2Id = thread2Res.rows[0].id;

    // Create DM messages
    await createDMMessage(thread1Id, student1Id, 'Em chào thầy! Em có câu hỏi về bài học hôm nay.');
    await createDMMessage(thread1Id, instructor1Id, 'Chào em! Em cứ hỏi đi, thầy sẵn sàng giải đáp.');
    await createDMMessage(thread1Id, student1Id, 'Cảm ơn thầy ạ!');
    console.log(`  ✅ Created 3 messages in DM thread 1 (Student 1 <-> Instructor 1)`);

    await createDMMessage(thread2Id, student2Id, 'Cô ơi, em muốn hỏi về project cuối khóa.');
    await createDMMessage(thread2Id, instructor2Id, 'Được rồi em, cô sẽ hướng dẫn chi tiết.');
    console.log(`  ✅ Created 2 messages in DM thread 2 (Student 2 <-> Instructor 2)`);

    console.log('\n✨ Seed completed successfully!\n');
    console.log('📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach((user) => {
      console.log(`  ${user.role}: ${user.email} / ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 Test URLs:');
    console.log(`  Course Chat: http://localhost:3000/chat/${course1Id}`);
    console.log(`  DM (Instructor): http://localhost:3000/chat/instructor/${student1Id}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    if (e.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection refused. Please check:');
      console.error('1. Is PostgreSQL running?');
      console.error('2. Is DATABASE_URL correct in .env file?');
    }
    process.exit(1);
  });

