const pool = require('../config/db');

class ModuleRepository {
  async createModule(courseId, title, position) {
    const result = await pool.query(
      `INSERT INTO modules (course_id, title, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [courseId, title, position]
    );
    return result.rows[0];
  }

  async updateModule(moduleId, title, position) {
    const result = await pool.query(
      `UPDATE modules 
       SET title = $2, position = $3
       WHERE id = $1
       RETURNING *`,
      [moduleId, title, position]
    );
    return result.rows[0];
  }

  async deleteModule(moduleId) {
    await pool.query(
      `DELETE FROM modules WHERE id = $1`,
      [moduleId]
    );
  }

  async getModuleById(moduleId) {
    const result = await pool.query(
      `SELECT * FROM modules WHERE id = $1`,
      [moduleId]
    );
    return result.rows[0];
  }

  async getModulesByCourseId(courseId) {
    const result = await pool.query(
      `SELECT * FROM modules WHERE course_id = $1 ORDER BY position`,
      [courseId]
    );
    return result.rows;
  }
}

module.exports = new ModuleRepository();
