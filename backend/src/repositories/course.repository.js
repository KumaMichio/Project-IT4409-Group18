const pool = require('../config/db');

class CourseRepository {
  async checkEnrollment(courseId, studentId) {
    const result = await pool.query(
      `SELECT id, status FROM enrollments 
       WHERE course_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
      [courseId, studentId]
    );
    return result.rows[0];
  }

  async getCourseById(courseId) {
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.thumbnail_url, 
              u.full_name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );
    return result.rows[0];
  }

  async getModulesByCourseId(courseId) {
    const result = await pool.query(
      `SELECT m.id, m.title, m.position
       FROM modules m
       WHERE m.course_id = $1
       ORDER BY m.position`,
      [courseId]
    );
    return result.rows;
  }

  async getLessonsByCourseId(courseId, studentId) {
    const result = await pool.query(
      `SELECT 
        l.id, l.module_id, l.title, l.position, l.duration_s, l.requires_quiz_pass,
        COALESCE(slp.watched_s, 0) as watched_s,
        COALESCE(slp.is_completed, false) as is_completed
       FROM lessons l
       LEFT JOIN student_lesson_progress slp 
         ON l.id = slp.lesson_id AND slp.student_id = $2
       WHERE l.module_id IN (
         SELECT id FROM modules WHERE course_id = $1
       )
       ORDER BY l.position`,
      [courseId, studentId]
    );
    return result.rows;
  }

  // Get lessons by course ID without student progress (for public view)
  async getLessonsByCourseIdPublic(courseId) {
    const result = await pool.query(
      `SELECT 
        l.id, l.module_id, l.title, l.position, l.duration_s, l.requires_quiz_pass
       FROM lessons l
       WHERE l.module_id IN (
         SELECT id FROM modules WHERE course_id = $1
       )
       ORDER BY l.position`,
      [courseId]
    );
    return result.rows;
  }

  async getAssetsByCourseId(courseId) {
    const result = await pool.query(
      `SELECT 
        la.id, la.lesson_id, la.asset_kind, la.url, la.meta, la.position
       FROM lesson_assets la
       WHERE la.lesson_id IN (
         SELECT l.id FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1
       )
       ORDER BY la.position`,
      [courseId]
    );
    return result.rows;
  }

  async getQuizzesByCourseId(courseId) {
    const result = await pool.query(
      `SELECT 
        q.id, q.lesson_id, q.title, q.time_limit_s, q.attempts_allowed, q.pass_score
       FROM quizzes q
       WHERE q.lesson_id IN (
         SELECT l.id FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1
       )`,
      [courseId]
    );
    return result.rows;
  }

  async getCourseProgress(studentId, courseId) {
    const result = await pool.query(
      `SELECT percent, updated_at
       FROM student_course_progress
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    return result.rows[0];
  }

  async upsertCourseProgress(studentId, courseId, percent) {
    await pool.query(
      `INSERT INTO student_course_progress (student_id, course_id, percent, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET percent = $3, updated_at = NOW()`,
      [studentId, courseId, percent]
    );
  }

  async getCourseIdByLessonId(lessonId) {
    const result = await pool.query(
      `SELECT m.course_id 
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lessonId]
    );
    return result.rows[0]?.course_id;
  }

  async calculateCourseProgress(studentId, courseId) {
    const result = await pool.query(
      `SELECT 
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN slp.is_completed = true THEN 1 END) as completed_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       LEFT JOIN student_lesson_progress slp 
         ON l.id = slp.lesson_id AND slp.student_id = $1
       WHERE m.course_id = $2`,
      [studentId, courseId]
    );
    return result.rows[0];
  }

  async getCourseDetailById(courseId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.title, c.description, c.thumbnail_url, c.price_cents, 
        c.currency, c.lang, c.created_at, c.updated_at,
        u.id as instructor_id, u.full_name as instructor_name, u.avatar_url as instructor_avatar,
        ip.bio as instructor_bio, ip.headline as instructor_headline
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );
    return result.rows[0];
  }

  async getCourseStats(courseId) {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT l.id) as total_lessons,
        COALESCE(SUM(l.duration_s), 0) as total_duration_s,
        COUNT(DISTINCT m.id) as total_modules
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON m.id = l.module_id
       WHERE c.id = $1`,
      [courseId]
    );
    return result.rows[0];
  }

  async getCourseReviews(courseId, limit = 10) {
    const result = await pool.query(
      `SELECT 
        cr.id, cr.rating, cr.comment, cr.created_at,
        u.full_name as student_name, u.avatar_url as student_avatar
       FROM course_reviews cr
       JOIN users u ON cr.student_id = u.id
       WHERE cr.course_id = $1
       ORDER BY cr.created_at DESC
       LIMIT $2`,
      [courseId, limit]
    );
    return result.rows;
  }

  async getCourseRating(courseId) {
    const result = await pool.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
       FROM course_reviews
       WHERE course_id = $1`,
      [courseId]
    );
    return result.rows[0];
  }

  async checkStudentEnrollment(courseId, studentId) {
    const result = await pool.query(
      `SELECT id, status, enrolled_at FROM enrollments 
       WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId]
    );
    return result.rows[0];
  }

  async getRelatedCourses(courseId, limit = 8) {
    const result = await pool.query(
      `WITH current_course AS (
        SELECT instructor_id FROM courses WHERE id = $1
      ),
      same_instructor AS (
        SELECT 
          c.id, c.title, c.slug, c.description, c.price_cents, c.thumbnail_url,
          u.full_name as instructor_name,
          COUNT(DISTINCT e.student_id) as total_students,
          COALESCE(AVG(cr.rating), 0) as avg_rating,
          1 as priority
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.instructor_id = (SELECT instructor_id FROM current_course)
          AND c.id != $1
          AND c.is_published = true
        GROUP BY c.id, u.full_name
      ),
      popular_courses AS (
        SELECT 
          c.id, c.title, c.slug, c.description, c.price_cents, c.thumbnail_url,
          u.full_name as instructor_name,
          COUNT(DISTINCT e.student_id) as total_students,
          COALESCE(AVG(cr.rating), 0) as avg_rating,
          2 as priority
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.id != $1
          AND c.is_published = true
          AND c.id NOT IN (SELECT id FROM same_instructor)
        GROUP BY c.id, u.full_name
        ORDER BY total_students DESC, avg_rating DESC
        LIMIT $2
      )
      SELECT * FROM same_instructor
      UNION ALL
      SELECT * FROM popular_courses
      ORDER BY priority, total_students DESC, avg_rating DESC
      LIMIT $2`,
      [courseId, limit]
    );
    return result.rows;
  }

  /**
   * Build price filter WHERE clause
   * price_range: 'free', 'under_100k', '100k_500k', '500k_1m', 'over_1m'
   */
  buildPriceFilter(priceRange) {
    if (!priceRange) return '';
    
    const priceFilters = {
      'free': 'c.price_cents = 0',
      'under_100k': 'c.price_cents > 0 AND c.price_cents < 100000',
      '100k_500k': 'c.price_cents >= 100000 AND c.price_cents < 500000',
      '500k_1m': 'c.price_cents >= 500000 AND c.price_cents < 1000000',
      'over_1m': 'c.price_cents >= 1000000'
    };
    
    return priceFilters[priceRange] || '';
  }

  /**
   * Build rating filter WHERE clause
   * minRating: 3.0, 3.5, 4.0, 4.5
   */
  buildRatingFilter(minRating) {
    if (!minRating) return '';
    return `COALESCE(AVG(cr.rating), 0) >= ${parseFloat(minRating)}`;
  }

  /**
   * Build ORDER BY clause
   * sortBy: 'price', 'rating', 'date'
   * sortOrder: 'asc', 'desc'
   */
  buildOrderBy(sortBy, sortOrder = 'desc') {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const sortMappings = {
      'price': `c.price_cents ${order}`,
      'rating': `avg_rating ${order}`,
      'date': `c.published_at ${order} NULLS LAST, c.created_at ${order}`
    };
    
    if (sortBy && sortMappings[sortBy]) {
      return sortMappings[sortBy];
    }
    
    // Default: sort by date
    return 'c.published_at DESC NULLS LAST, c.created_at DESC';
  }

  async getAllPublishedCourses(limit = 50, offset = 0, filters = {}) {
    const { priceRange, minRating, sortBy, sortOrder } = filters;
    
    // Build WHERE conditions
    const whereConditions = ['c.is_published = true'];
    
    // Add price filter
    const priceFilter = this.buildPriceFilter(priceRange);
    if (priceFilter) {
      whereConditions.push(priceFilter);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Build ORDER BY
    const orderByClause = this.buildOrderBy(sortBy, sortOrder);
    
    // Build HAVING clause for rating filter (after GROUP BY)
    const havingConditions = [];
    if (minRating) {
      havingConditions.push(`COALESCE(AVG(cr.rating), 0) >= ${parseFloat(minRating)}`);
    }
    const havingClause = havingConditions.length > 0 
      ? `HAVING ${havingConditions.join(' AND ')}` 
      : '';
    
    const query = `
      SELECT 
        c.id, c.title, c.slug, c.description, c.thumbnail_url,
        c.price_cents, c.currency, c.created_at, c.published_at,
        u.id as instructor_id, u.full_name as instructor_name,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT cr.id) as review_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      WHERE ${whereClause}
      GROUP BY c.id, u.id, u.full_name
      ${havingClause}
      ORDER BY ${orderByClause}
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  async countPublishedCourses(filters = {}) {
    const { priceRange, minRating } = filters;
    
    // Build WHERE conditions
    const whereConditions = ['c.is_published = true'];
    
    // Add price filter
    const priceFilter = this.buildPriceFilter(priceRange);
    if (priceFilter) {
      whereConditions.push(priceFilter);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // If rating filter, need to use subquery with GROUP BY and HAVING
    if (minRating) {
      const query = `
        SELECT COUNT(*) as total
        FROM (
          SELECT c.id
          FROM courses c
          JOIN users u ON c.instructor_id = u.id
          LEFT JOIN course_reviews cr ON c.id = cr.course_id
          WHERE ${whereClause}
          GROUP BY c.id
          HAVING COALESCE(AVG(cr.rating), 0) >= ${parseFloat(minRating)}
        ) as filtered_courses
      `;
      const result = await pool.query(query);
      return parseInt(result.rows[0].total);
    }
    
    // No rating filter, simple count
    const query = `SELECT COUNT(*) as total FROM courses c WHERE ${whereClause}`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  async searchCourses(keyword, limit = 50, offset = 0, filters = {}) {
    const { priceRange, minRating, sortBy, sortOrder } = filters;
    const searchTerm = `%${keyword}%`;
    
    // Build WHERE conditions
    const whereConditions = [
      'c.is_published = true',
      `(
        c.title ILIKE $1
        OR c.description ILIKE $1
        OR u.full_name ILIKE $1
      )`
    ];
    
    // Add price filter
    const priceFilter = this.buildPriceFilter(priceRange);
    if (priceFilter) {
      whereConditions.push(priceFilter);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Build ORDER BY
    // If no custom sort, use relevance-based sorting
    let orderByClause;
    if (sortBy) {
      orderByClause = this.buildOrderBy(sortBy, sortOrder);
    } else {
      // Default: relevance first, then date
      orderByClause = `
        CASE 
          WHEN c.title ILIKE $1 THEN 1
          WHEN c.description ILIKE $1 THEN 2
          ELSE 3
        END,
        c.published_at DESC NULLS LAST, c.created_at DESC
      `;
    }
    
    // Build HAVING clause for rating filter
    const havingConditions = [];
    if (minRating) {
      havingConditions.push(`COALESCE(AVG(cr.rating), 0) >= ${parseFloat(minRating)}`);
    }
    const havingClause = havingConditions.length > 0 
      ? `HAVING ${havingConditions.join(' AND ')}` 
      : '';
    
    const query = `
      SELECT 
        c.id, c.title, c.slug, c.description, c.thumbnail_url,
        c.price_cents, c.currency, c.created_at, c.published_at,
        u.id as instructor_id, u.full_name as instructor_name,
        COALESCE(AVG(cr.rating), 0) as avg_rating,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT cr.id) as review_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      WHERE ${whereClause}
      GROUP BY c.id, u.id, u.full_name
      ${havingClause}
      ORDER BY ${orderByClause}
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [searchTerm, limit, offset]);
    return result.rows;
  }

  async countSearchResults(keyword, filters = {}) {
    const { priceRange, minRating } = filters;
    const searchTerm = `%${keyword}%`;
    
    // Build WHERE conditions
    const whereConditions = [
      'c.is_published = true',
      `(
        c.title ILIKE $1
        OR c.description ILIKE $1
        OR u.full_name ILIKE $1
      )`
    ];
    
    // Add price filter
    const priceFilter = this.buildPriceFilter(priceRange);
    if (priceFilter) {
      whereConditions.push(priceFilter);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // If rating filter, need to use subquery with GROUP BY and HAVING
    if (minRating) {
      const query = `
        SELECT COUNT(*) as total
        FROM (
          SELECT c.id
          FROM courses c
          JOIN users u ON c.instructor_id = u.id
          LEFT JOIN course_reviews cr ON c.id = cr.course_id
          WHERE ${whereClause}
          GROUP BY c.id
          HAVING COALESCE(AVG(cr.rating), 0) >= ${parseFloat(minRating)}
        ) as filtered_courses
      `;
      const result = await pool.query(query, [searchTerm]);
      return parseInt(result.rows[0].total);
    }
    
    // No rating filter, simple count
    const query = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE ${whereClause}
    `;
    const result = await pool.query(query, [searchTerm]);
    return parseInt(result.rows[0].total);
  }

  // ==== INSTRUCTOR COURSE MANAGEMENT ====
  
  async getInstructorCourses(instructorId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.title, c.slug, c.description, c.thumbnail_url,
        c.price_cents, c.currency, c.is_published, c.created_at, c.updated_at, c.published_at,
        COUNT(DISTINCT e.student_id) as total_students,
        COUNT(DISTINCT m.id) as total_modules,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ACTIVE'
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      WHERE c.instructor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [instructorId]
    );
    return result.rows;
  }

  async getCourseByIdForInstructor(courseId, instructorId) {
    const result = await pool.query(
      `SELECT 
        c.id, c.title, c.slug, c.description, c.thumbnail_url,
        c.price_cents, c.currency, c.is_published, c.lang,
        c.created_at, c.updated_at, c.published_at
      FROM courses c
      WHERE c.id = $1 AND c.instructor_id = $2`,
      [courseId, instructorId]
    );
    return result.rows[0];
  }

  async createCourse(instructorId, courseData) {
    const { title, description, price_cents, currency, thumbnail_url, lang, slug } = courseData;
    const result = await pool.query(
      `INSERT INTO courses (instructor_id, title, slug, description, price_cents, currency, thumbnail_url, lang)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [instructorId, title, slug, description, price_cents || 0, currency || 'VND', thumbnail_url, lang || 'vi']
    );
    return result.rows[0];
  }

  async updateCourse(courseId, instructorId, courseData) {
    const { title, description, price_cents, currency, thumbnail_url, lang, slug, is_published } = courseData;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (price_cents !== undefined) {
      updates.push(`price_cents = $${paramIndex++}`);
      values.push(price_cents);
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }
    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex++}`);
      values.push(thumbnail_url);
    }
    if (lang !== undefined) {
      updates.push(`lang = $${paramIndex++}`);
      values.push(lang);
    }
    if (is_published !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      values.push(is_published);
      if (is_published === true) {
        updates.push(`published_at = CASE WHEN published_at IS NULL THEN NOW() ELSE published_at END`);
      }
    }
    
    updates.push(`updated_at = NOW()`);
    
    values.push(courseId, instructorId);
    
    const result = await pool.query(
      `UPDATE courses 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND instructor_id = $${paramIndex++}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async deleteCourse(courseId, instructorId) {
    const result = await pool.query(
      `DELETE FROM courses 
       WHERE id = $1 AND instructor_id = $2
       RETURNING id`,
      [courseId, instructorId]
    );
    return result.rows[0];
  }

  async checkSlugExists(slug, excludeCourseId = null) {
    let query = `SELECT id FROM courses WHERE slug = $1`;
    const params = [slug];
    
    if (excludeCourseId) {
      query += ` AND id != $2`;
      params.push(excludeCourseId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
    return result.rows.length > 0;
  }

  // ==== MODULE MANAGEMENT ====
  
  async getModulesByCourseIdForInstructor(courseId, instructorId) {
    const result = await pool.query(
      `SELECT m.id, m.title, m.position, m.course_id
       FROM modules m
       JOIN courses c ON m.course_id = c.id
       WHERE m.course_id = $1 AND c.instructor_id = $2
       ORDER BY m.position`,
      [courseId, instructorId]
    );
    return result.rows;
  }

  async createModule(courseId, instructorId, moduleData) {
    const { title, position } = moduleData;
    // Verify course belongs to instructor
    const course = await this.getCourseByIdForInstructor(courseId, instructorId);
    if (!course) {
      throw new Error('Course not found or access denied');
    }
    
    const result = await pool.query(
      `INSERT INTO modules (course_id, title, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [courseId, title, position]
    );
    return result.rows[0];
  }

  async updateModule(moduleId, instructorId, moduleData) {
    const { title, position } = moduleData;
    const result = await pool.query(
      `UPDATE modules m
       SET title = COALESCE($1, m.title), position = COALESCE($2, m.position)
       FROM courses c
       WHERE m.id = $3 AND m.course_id = c.id AND c.instructor_id = $4
       RETURNING m.*`,
      [title, position, moduleId, instructorId]
    );
    return result.rows[0];
  }

  async deleteModule(moduleId, instructorId) {
    const result = await pool.query(
      `DELETE FROM modules m
       USING courses c
       WHERE m.id = $1 AND m.course_id = c.id AND c.instructor_id = $2
       RETURNING m.id`,
      [moduleId, instructorId]
    );
    return result.rows[0];
  }

  // ==== LESSON MANAGEMENT ====
  
  async getLessonsByModuleIdForInstructor(moduleId, instructorId) {
    const result = await pool.query(
      `SELECT l.id, l.module_id, l.title, l.position, l.duration_s, l.requires_quiz_pass
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE l.module_id = $1 AND c.instructor_id = $2
       ORDER BY l.position`,
      [moduleId, instructorId]
    );
    return result.rows;
  }

  async createLesson(moduleId, instructorId, lessonData) {
    const { title, position, duration_s, requires_quiz_pass } = lessonData;
    // Verify module belongs to instructor's course
    const module = await pool.query(
      `SELECT m.id FROM modules m
       JOIN courses c ON m.course_id = c.id
       WHERE m.id = $1 AND c.instructor_id = $2`,
      [moduleId, instructorId]
    );
    if (module.rows.length === 0) {
      throw new Error('Module not found or access denied');
    }
    
    const result = await pool.query(
      `INSERT INTO lessons (module_id, title, position, duration_s, requires_quiz_pass)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [moduleId, title, position, duration_s || null, requires_quiz_pass || false]
    );
    return result.rows[0];
  }

  async updateLesson(lessonId, instructorId, lessonData) {
    const { title, position, duration_s, requires_quiz_pass } = lessonData;
    const result = await pool.query(
      `UPDATE lessons l
       SET 
         title = COALESCE($1, l.title),
         position = COALESCE($2, l.position),
         duration_s = COALESCE($3, l.duration_s),
         requires_quiz_pass = COALESCE($4, l.requires_quiz_pass)
       FROM modules m
       JOIN courses c ON m.course_id = c.id
       WHERE l.id = $5 AND l.module_id = m.id AND c.instructor_id = $6
       RETURNING l.*`,
      [title, position, duration_s, requires_quiz_pass, lessonId, instructorId]
    );
    return result.rows[0];
  }

  async deleteLesson(lessonId, instructorId) {
    const result = await pool.query(
      `DELETE FROM lessons l
       USING modules m
       JOIN courses c ON m.course_id = c.id
       WHERE l.id = $1 AND l.module_id = m.id AND c.instructor_id = $2
       RETURNING l.id`,
      [lessonId, instructorId]
    );
    return result.rows[0];
  }

  // ==== LESSON ASSET (VIDEO) MANAGEMENT ====
  
  async getAssetsByLessonIdForInstructor(lessonId, instructorId) {
    const result = await pool.query(
      `SELECT la.id, la.lesson_id, la.asset_kind, la.url, la.meta, la.position
       FROM lesson_assets la
       JOIN lessons l ON la.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE la.lesson_id = $1 AND c.instructor_id = $2
       ORDER BY la.position`,
      [lessonId, instructorId]
    );
    return result.rows;
  }

  async createAsset(lessonId, instructorId, assetData) {
    const { asset_kind, url, meta, position } = assetData;
    // Verify lesson belongs to instructor's course
    const lesson = await pool.query(
      `SELECT l.id FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE l.id = $1 AND c.instructor_id = $2`,
      [lessonId, instructorId]
    );
    if (lesson.rows.length === 0) {
      throw new Error('Lesson not found or access denied');
    }
    
    const result = await pool.query(
      `INSERT INTO lesson_assets (lesson_id, asset_kind, url, meta, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lessonId, asset_kind, url, meta ? JSON.stringify(meta) : null, position || 1]
    );
    return result.rows[0];
  }

  async updateAsset(assetId, instructorId, assetData) {
    const { url, meta, position } = assetData;
    const result = await pool.query(
      `UPDATE lesson_assets la
       SET 
         url = COALESCE($1, la.url),
         meta = COALESCE($2, la.meta),
         position = COALESCE($3, la.position)
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE la.id = $4 AND la.lesson_id = l.id AND c.instructor_id = $5
       RETURNING la.*`,
      [url, meta ? JSON.stringify(meta) : null, position, assetId, instructorId]
    );
    return result.rows[0];
  }

  async deleteAsset(assetId, instructorId) {
    const result = await pool.query(
      `DELETE FROM lesson_assets la
       USING lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE la.id = $1 AND la.lesson_id = l.id AND c.instructor_id = $2
       RETURNING la.id`,
      [assetId, instructorId]
    );
    return result.rows[0];
  }

  // ==== QUIZ MANAGEMENT ====
  
  async getQuizzesByCourseIdForInstructor(courseId, instructorId) {
    const result = await pool.query(
      `SELECT q.id, q.lesson_id, q.title, q.time_limit_s, q.attempts_allowed, q.pass_score
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE c.id = $1 AND c.instructor_id = $2`,
      [courseId, instructorId]
    );
    return result.rows;
  }

  async getQuizByIdForInstructor(quizId, instructorId) {
    const result = await pool.query(
      `SELECT q.id, q.lesson_id, q.title, q.time_limit_s, q.attempts_allowed, q.pass_score
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [quizId, instructorId]
    );
    return result.rows[0];
  }

  async createQuiz(lessonId, instructorId, quizData) {
    const { title, time_limit_s, attempts_allowed, pass_score, questions = [] } = quizData;
    // Verify lesson belongs to instructor's course and get course_id
    const lesson = await pool.query(
      `SELECT l.id, m.course_id FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE l.id = $1 AND c.instructor_id = $2`,
      [lessonId, instructorId]
    );
    if (lesson.rows.length === 0) {
      throw new Error('Lesson not found or access denied');
    }
    
    const courseId = lesson.rows[0].course_id;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create quiz
      const quizResult = await client.query(
        `INSERT INTO quizzes (course_id, lesson_id, title, time_limit_s, attempts_allowed, pass_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [courseId, lessonId, title, time_limit_s || null, attempts_allowed || null, pass_score || 60]
      );
      const quiz = quizResult.rows[0];
      const quizId = quiz.id;
      
      // Create questions and options
      for (const questionData of questions) {
        const { question, qtype, position, points, options = [] } = questionData;
        
        // Create question
        const questionResult = await client.query(
          `INSERT INTO quiz_questions (quiz_id, question, qtype, position, points)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [quizId, question, qtype, position, points || 1]
        );
        const questionRecord = questionResult.rows[0];
        const questionId = questionRecord.id;
        
        // Handle TRUE_FALSE type - auto-create options
        if (qtype === 'TRUE_FALSE') {
          await client.query(
            `INSERT INTO quiz_options (question_id, option_text, is_correct, position)
             VALUES ($1, $2, $3, 1), ($4, $5, $6, 2)`,
            [questionId, 'Đúng', false, questionId, 'Sai', false]
          );
        } else if (qtype !== 'SHORT_TEXT' && options.length > 0) {
          // Create options for SINGLE_CHOICE and MULTI_CHOICE
          for (const optionData of options) {
            const { option_text, is_correct, position: optPosition } = optionData;
            await client.query(
              `INSERT INTO quiz_options (question_id, option_text, is_correct, position)
               VALUES ($1, $2, $3, $4)`,
              [questionId, option_text, is_correct || false, optPosition]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      return quiz;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateQuiz(quizId, instructorId, quizData) {
    const { title, time_limit_s, attempts_allowed, pass_score } = quizData;
    const result = await pool.query(
      `UPDATE quizzes q
       SET 
         title = COALESCE($1, q.title),
         time_limit_s = COALESCE($2, q.time_limit_s),
         attempts_allowed = COALESCE($3, q.attempts_allowed),
         pass_score = COALESCE($4, q.pass_score)
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE q.id = $5 AND q.lesson_id = l.id AND c.instructor_id = $6
       RETURNING q.*`,
      [title, time_limit_s, attempts_allowed, pass_score, quizId, instructorId]
    );
    return result.rows[0];
  }

  async deleteQuiz(quizId, instructorId) {
    const result = await pool.query(
      `DELETE FROM quizzes q
       USING lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE q.id = $1 AND q.lesson_id = l.id AND c.instructor_id = $2
       RETURNING q.id`,
      [quizId, instructorId]
    );
    return result.rows[0];
  }

  // ==== STUDENT MANAGEMENT ====
  
  async getStudentsByCourseId(courseId, instructorId) {
    const result = await pool.query(
      `SELECT 
        u.id, u.full_name, u.email, u.avatar_url,
        e.id as enrollment_id, e.status, e.enrolled_at,
        COALESCE(scp.percent, 0) as progress_percent
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN student_course_progress scp ON e.student_id = scp.student_id AND e.course_id = scp.course_id
      WHERE e.course_id = $1 AND c.instructor_id = $2 AND e.status = 'ACTIVE'
      ORDER BY e.enrolled_at DESC`,
      [courseId, instructorId]
    );
    return result.rows;
  }

  async getAllStudentsByInstructor(instructorId) {
    const result = await pool.query(
      `SELECT DISTINCT
        u.id, u.full_name, u.email, u.avatar_url,
        COUNT(DISTINCT e.course_id) as enrolled_courses_count
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = $1 AND e.status = 'ACTIVE'
      GROUP BY u.id, u.full_name, u.email, u.avatar_url
      ORDER BY u.full_name`,
      [instructorId]
    );
    return result.rows;
  }
}

module.exports = new CourseRepository();
