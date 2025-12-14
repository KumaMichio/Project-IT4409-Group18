const pool = require('../src/config/db');

async function checkLessons() {
  try {
    const result = await pool.query(`
      SELECT l.id, l.title, l.duration_s, m.title as module_name, c.slug 
      FROM lessons l 
      JOIN modules m ON l.module_id = m.id 
      JOIN courses c ON m.course_id = c.id 
      WHERE c.slug = 'reactjs-zero-hero' 
      ORDER BY l.id
    `);
    
    console.log('\n📚 Lessons in React course:');
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLessons();
