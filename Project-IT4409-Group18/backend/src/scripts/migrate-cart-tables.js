const pool = require('../config/db');
require('dotenv').config();

async function migrateCartTables() {
  console.log('🔧 Starting cart tables migration...');

  try {
    // Create carts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log('✅ Created carts table');

    // Create index for carts
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
    `);
    console.log('✅ Created index idx_carts_user_id');

    // Create cart_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id         BIGSERIAL PRIMARY KEY,
        cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(cart_id, course_id)
      );
    `);
    console.log('✅ Created cart_items table');

    // Create indexes for cart_items
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    `);
    console.log('✅ Created index idx_cart_items_cart_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_course_id ON cart_items(course_id);
    `);
    console.log('✅ Created index idx_cart_items_course_id');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('carts', 'cart_items')
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    if (error.code === '42P01') {
      console.error('💡 One of the referenced tables (users or courses) does not exist.');
      console.error('   Please run database.sql first to create all base tables.');
    } else if (error.code === '23503') {
      console.error('💡 Foreign key constraint violation.');
      console.error('   Make sure users and courses tables exist.');
    }
    throw error;
  } finally {
    await pool.end();
  }
}

migrateCartTables()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

