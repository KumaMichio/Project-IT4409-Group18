const pool = require('../config/db');
require('dotenv').config();

async function migrateProgressTables() {
  console.log('🔧 Starting progress tables migration...');

  try {
    // Create student_course_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_course_progress (
        id         BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        percent    DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(student_id, course_id)
      );
    `);
    console.log('✅ Created student_course_progress table');

    // Create indexes for student_course_progress
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_student_course_progress_student ON student_course_progress(student_id);
    `);
    console.log('✅ Created index idx_student_course_progress_student');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_student_course_progress_course ON student_course_progress(course_id);
    `);
    console.log('✅ Created index idx_student_course_progress_course');

    // Create student_lesson_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_lesson_progress (
        id            BIGSERIAL PRIMARY KEY,
        student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        watched_s     INTEGER NOT NULL DEFAULT 0,
        is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
        last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(student_id, lesson_id)
      );
    `);
    console.log('✅ Created student_lesson_progress table');

    // Create indexes for student_lesson_progress
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_student ON student_lesson_progress(student_id);
    `);
    console.log('✅ Created index idx_student_lesson_progress_student');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_lesson ON student_lesson_progress(lesson_id);
    `);
    console.log('✅ Created index idx_student_lesson_progress_lesson');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('student_course_progress', 'student_lesson_progress')
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProgressTables()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateProgressTables;

