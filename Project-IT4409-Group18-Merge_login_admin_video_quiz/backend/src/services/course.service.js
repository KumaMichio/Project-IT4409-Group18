const courseRepository = require('../repositories/course.repository');

class CourseService {
  async getCourseContent(courseId, studentId) {
    // Check enrollment
    const enrollment = await courseRepository.checkEnrollment(courseId, studentId);
    if (!enrollment) {
      throw {
        status: 403,
        message: 'Not enrolled in this course'
      };
    }

    // Get course details
    const course = await courseRepository.getCourseById(courseId);
    if (!course) {
      throw {
        status: 404,
        message: 'Course not found'
      };
    }

    // Get all data in parallel
    const [modules, lessons, assets, quizzes] = await Promise.all([
      courseRepository.getModulesByCourseId(courseId),
      courseRepository.getLessonsByCourseId(courseId, studentId),
      courseRepository.getAssetsByCourseId(courseId),
      courseRepository.getQuizzesByCourseId(courseId)
    ]);

    // Organize data structure
    const modulesWithLessons = modules.map(module => {
      const moduleLessons = lessons
        .filter(l => l.module_id === module.id)
        .map(lesson => ({
          ...lesson,
          assets: assets.filter(a => a.lesson_id === lesson.id),
          quiz: quizzes.find(q => q.lesson_id === lesson.id) || null
        }));

      return {
        ...module,
        lessons: moduleLessons
      };
    });

    return {
      course,
      modules: modulesWithLessons
    };
  }

  async getCourseProgress(courseId, studentId) {
    const progress = await courseRepository.getCourseProgress(studentId, courseId);
    return progress || {
      percent: 0
    };
  }

  async updateCourseProgressByLesson(studentId, lessonId) {
    const courseId = await courseRepository.getCourseIdByLessonId(lessonId);
    if (!courseId) return;

    const {
      total_lessons,
      completed_lessons
    } = await courseRepository.calculateCourseProgress(studentId, courseId);

    const percent = total_lessons > 0 ?
      Math.round((completed_lessons / total_lessons) * 100) : 0;

    await courseRepository.upsertCourseProgress(studentId, courseId, percent);
  }

  async getCourseDetail(courseId, studentId = null) {
    // Get course details
    const course = await courseRepository.getCourseDetailById(courseId);
    if (!course) {
      throw {
        status: 404,
        message: 'Course not found'
      };
    }

    // Get course stats, modules, and rating in parallel
    const [stats, modules, rating, reviews] = await Promise.all([
      courseRepository.getCourseStats(courseId),
      courseRepository.getModulesByCourseId(courseId),
      courseRepository.getCourseRating(courseId),
      courseRepository.getCourseReviews(courseId, 3)
    ]);

    // Check enrollment status if student is logged in
    let enrollment = null;
    if (studentId) {
      enrollment = await courseRepository.checkStudentEnrollment(courseId, studentId);
    }

    return {
      course: {
        ...course,
        total_students: parseInt(stats.total_students) || 0,
        total_lessons: parseInt(stats.total_lessons) || 0,
        total_duration_s: parseInt(stats.total_duration_s) || 0,
        total_modules: parseInt(stats.total_modules) || 0
      },
      modules,
      rating: {
        average: parseFloat(rating.average_rating).toFixed(1),
        total_reviews: parseInt(rating.total_reviews) || 0,
        rating_distribution: {
          5: parseInt(rating.rating_5) || 0,
          4: parseInt(rating.rating_4) || 0,
          3: parseInt(rating.rating_3) || 0,
          2: parseInt(rating.rating_2) || 0,
          1: parseInt(rating.rating_1) || 0
        }
      },
      reviews,
      enrollment: enrollment ? {
        enrolled: true,
        status: enrollment.status,
        enrolled_at: enrollment.enrolled_at
      } : {
        enrolled: false
      }
    };
  }

  async getRelatedCourses(courseId) {
    const courses = await courseRepository.getRelatedCourses(courseId, 8);
    return courses;
  }

  async createCourse(instructorId, courseData) {
    // Generate slug if not provided
    let slug = courseData.slug;
    if (!slug && courseData.title) {
      slug = courseData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      // Add timestamp to ensure uniqueness
      slug = `${slug}-${Date.now()}`;
    }

    // Map frontend fields to database fields
    const dbData = {
      title: courseData.title,
      slug: slug,
      description: courseData.description,
      price_cents: Math.round(Number(courseData.price) || 0), // Ensure integer
      thumbnail_url: courseData.thumbnail,
      is_published: false // Default to draft
    };

    const newCourse = await courseRepository.createCourse(instructorId, dbData);
    return this._mapCourseToResponse(newCourse);
  }

  async updateCourse(courseId, instructorId, courseData) {
    // Verify ownership
    // const course = await courseRepository.getCourseById(courseId);
    // Note: In a real app, check if course belongs to instructorId
    
    let slug = courseData.slug;
    if (courseData.title && !slug) {
       slug = courseData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Map frontend fields to database fields
    const dbData = {
      title: courseData.title,
      slug: slug,
      description: courseData.description,
      price_cents: courseData.price !== undefined ? Math.round(Number(courseData.price)) : undefined,
      thumbnail_url: courseData.thumbnail,
      is_published: courseData.status === 'published' ? true : (courseData.status === 'draft' ? false : undefined)
    };

    const updatedCourse = await courseRepository.updateCourse(courseId, dbData);
    return this._mapCourseToResponse(updatedCourse);
  }

  async deleteCourse(courseId, instructorId) {
    // Verify ownership logic should be here
    return courseRepository.deleteCourse(courseId);
  }

  async getInstructorCourses(instructorId) {
    const courses = await courseRepository.getCoursesByInstructorId(instructorId);
    return courses.map(this._mapCourseToResponse);
  }

  async getInstructorCourse(courseId, instructorId) {
    const course = await courseRepository.getInstructorCourseById(courseId, instructorId);
    if (!course) {
      throw {
        status: 404,
        message: 'Course not found or you do not have permission to view it'
      };
    }
    return this._mapCourseToResponse(course);
  }

  async getInstructorCourseContent(courseId, instructorId) {
    // Verify ownership
    const course = await courseRepository.getInstructorCourseById(courseId, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized' };
    }

    const [modules, lessons] = await Promise.all([
      courseRepository.getModulesByCourseId(courseId),
      courseRepository.getLessonsByCourseIdForInstructor(courseId)
    ]);

    // Organize data
    const modulesWithLessons = modules.map(module => ({
      ...module,
      lessons: lessons.filter(l => l.module_id === module.id)
    }));

    return modulesWithLessons;
  }

  async getCourseStudents(courseId, instructorId) {
    // Verify ownership logic should be here
    return courseRepository.getStudentsByCourseId(courseId);
  }

  _mapCourseToResponse(course) {
    if (!course) return null;
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price_cents,
      level: 'Beginner', // Default as DB doesn't have level
      language: course.lang,
      thumbnail: course.thumbnail_url,
      instructor_id: course.instructor_id,
      created_at: course.created_at,
      updated_at: course.updated_at,
      status: course.is_published ? 'published' : 'draft',
      student_count: parseInt(course.total_students) || 0,
      average_rating: parseFloat(course.avg_rating) || 0
    };
  }
}

module.exports = new CourseService();
