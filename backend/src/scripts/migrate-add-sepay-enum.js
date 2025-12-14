/**
 * Migration script để thêm 'SEPAY' vào enum payment_provider
 * Chạy: node src/scripts/migrate-add-sepay-enum.js
 */

const pool = require('../config/db');
require('dotenv').config();

async function migrateAddSePayEnum() {
  console.log('🔧 Starting migration: Add SEPAY to payment_provider enum...');

  try {
    // Kiểm tra xem 'SEPAY' đã có trong enum chưa
    const checkResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'payment_provider'
      ) AND enumlabel = 'SEPAY';
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ SEPAY already exists in payment_provider enum');
      return;
    }

    // Thêm 'SEPAY' vào enum payment_provider
    await pool.query(`
      ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'SEPAY';
    `);

    console.log('✅ Successfully added SEPAY to payment_provider enum');

    // Verify
    const verifyResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'payment_provider'
      )
      ORDER BY enumsortorder;
    `);

    console.log('📋 Current payment_provider enum values:');
    verifyResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.enumlabel}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy migration
migrateAddSePayEnum()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

