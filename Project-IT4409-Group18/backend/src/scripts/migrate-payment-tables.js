const pool = require('../config/db');
require('dotenv').config();

async function migratePaymentTables() {
  console.log('🔧 Starting payment tables migration...');

  try {
    // Create order_status enum
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log('✅ Created order_status enum');

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id                BIGSERIAL PRIMARY KEY,
        user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_number      TEXT UNIQUE NOT NULL,
        total_amount_cents INTEGER NOT NULL,
        currency          TEXT NOT NULL DEFAULT 'VND',
        status            order_status NOT NULL DEFAULT 'PENDING',
        payment_provider  payment_provider,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        completed_at      TIMESTAMPTZ
      );
    `);
    console.log('✅ Created orders table');

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id         BIGSERIAL PRIMARY KEY,
        order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        course_id  BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        price_cents INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(order_id, course_id)
      );
    `);
    console.log('✅ Created order_items table');

    // Add order_id column to payments table if not exists
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'order_id'
        ) THEN
          ALTER TABLE payments ADD COLUMN order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✅ Updated payments table (added order_id)');

    // Make enrollment_id nullable
    await pool.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'enrollment_id' AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE payments ALTER COLUMN enrollment_id DROP NOT NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Updated payments table (enrollment_id nullable)');

    // Add CHECK constraint if not exists
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'payments' AND constraint_name = 'payments_enrollment_or_order_check'
        ) THEN
          ALTER TABLE payments ADD CONSTRAINT payments_enrollment_or_order_check 
            CHECK ((enrollment_id IS NOT NULL) OR (order_id IS NOT NULL));
        END IF;
      END $$;
    `);
    console.log('✅ Added CHECK constraint to payments table');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    `);
    console.log('✅ Created index idx_orders_user_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    console.log('✅ Created index idx_orders_status');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    `);
    console.log('✅ Created index idx_orders_order_number');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    `);
    console.log('✅ Created index idx_order_items_order_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);
    `);
    console.log('✅ Created index idx_order_items_course_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    `);
    console.log('✅ Created index idx_payments_order_id');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('orders', 'order_items')
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

migratePaymentTables()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

