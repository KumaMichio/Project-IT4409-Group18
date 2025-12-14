const courseRepository = require('../repositories/course.repository');
const { generateUniqueSlug } = require('../utils/slug');

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

    // Get course stats and rating in parallel
    const [stats, rating, reviews] = await Promise.all([
      courseRepository.getCourseStats(courseId),
      courseRepository.getCourseRating(courseId),
      courseRepository.getCourseReviews(courseId, 3)
    ]);

    // Check enrollment status if student is logged in
    let enrollment = null;
    let modules = [];
    
    // Always get modules and lessons (for public view)
    const modulesList = await courseRepository.getModulesByCourseId(courseId);
    
    if (studentId) {
      enrollment = await courseRepository.checkStudentEnrollment(courseId, studentId);
      
      // If enrolled, get lessons with progress
      if (enrollment && enrollment.status === 'ACTIVE') {
        const lessons = await courseRepository.getLessonsByCourseId(courseId, studentId);
        
        // Organize modules with lessons
        modules = modulesList.map(module => ({
          ...module,
          lessons: lessons.filter(l => l.module_id === module.id)
        }));
      } else {
        // Not enrolled, get lessons without progress
        const lessons = await courseRepository.getLessonsByCourseIdPublic(courseId);
        
        // Organize modules with lessons
        modules = modulesList.map(module => ({
          ...module,
          lessons: lessons.filter(l => l.module_id === module.id)
        }));
      }
    } else {
      // Not logged in, get lessons without progress
      const lessons = await courseRepository.getLessonsByCourseIdPublic(courseId);
      
      // Organize modules with lessons
      modules = modulesList.map(module => ({
        ...module,
        lessons: lessons.filter(l => l.module_id === module.id)
      }));
    }

    return {
      course: {
        ...course,
        total_students: parseInt(stats.total_students) || 0,
        total_lessons: parseInt(stats.total_lessons) || 0,
        total_duration_s: parseInt(stats.total_duration_s) || 0,
        total_modules: parseInt(stats.total_modules) || 0
      },
      modules, // Always returned with lessons
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

  async getAllCourses(page = 1, limit = 12, filters = {}) {
    const offset = (page - 1) * limit;
    const courses = await courseRepository.getAllPublishedCourses(limit, offset, filters);
    const total = await courseRepository.countPublishedCourses(filters);
    
    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchCourses(keyword, page = 1, limit = 12, filters = {}) {
    // Ensure keyword is not empty
    const trimmedKeyword = keyword ? keyword.trim() : '';
    if (!trimmedKeyword || trimmedKeyword === '') {
      // If no keyword, return all courses with filters
      return this.getAllCourses(page, limit, filters);
    }

    const offset = (page - 1) * limit;
    const courses = await courseRepository.searchCourses(trimmedKeyword, limit, offset, filters);
    const total = await courseRepository.countSearchResults(trimmedKeyword, filters);
    
    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ==== INSTRUCTOR COURSE MANAGEMENT ====
  
  async getInstructorCourses(instructorId) {
    return await courseRepository.getInstructorCourses(instructorId);
  }

  async getCourseForInstructor(courseId, instructorId) {
    const course = await courseRepository.getCourseByIdForInstructor(courseId, instructorId);
    if (!course) {
      throw {
        status: 404,
        message: 'Course not found or access denied'
      };
    }
    
    // Get full course structure
    const modules = await courseRepository.getModulesByCourseIdForInstructor(courseId, instructorId);
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await courseRepository.getLessonsByModuleIdForInstructor(module.id, instructorId);
        const lessonsWithAssets = await Promise.all(
          lessons.map(async (lesson) => {
            const assets = await courseRepository.getAssetsByLessonIdForInstructor(lesson.id, instructorId);
            const quiz = await courseRepository.getQuizzesByCourseIdForInstructor(courseId, instructorId)
              .then(quizzes => quizzes.find(q => q.lesson_id === lesson.id) || null);
            return {
              ...lesson,
              assets,
              quiz
            };
          })
        );
        return {
          ...module,
          lessons: lessonsWithAssets
        };
      })
    );
    
    return {
      ...course,
      modules: modulesWithLessons
    };
  }

  async createCourse(instructorId, courseData) {
    try {
      // Generate unique slug
      const slug = await generateUniqueSlug(
        courseData.title,
        async (slug, excludeId) => {
          return await courseRepository.checkSlugExists(slug, excludeId);
        }
      );
      
      const course = await courseRepository.createCourse(instructorId, {
        ...courseData,
        slug
      });
      
      return course;
    } catch (error) {
      console.error('Error in createCourse service:', error);
      throw error;
    }
  }

  async updateCourse(courseId, instructorId, courseData) {
    // If title is being updated, regenerate slug
    if (courseData.title) {
      const slug = await generateUniqueSlug(
        courseData.title,
        (slug, excludeId) => courseRepository.checkSlugExists(slug, excludeId),
        courseId
      );
      courseData.slug = slug;
    }
    
    const course = await courseRepository.updateCourse(courseId, instructorId, courseData);
    if (!course) {
      throw {
        status: 404,
        message: 'Course not found or access denied'
      };
    }
    
    return course;
  }

  async deleteCourse(courseId, instructorId) {
    const result = await courseRepository.deleteCourse(courseId, instructorId);
    if (!result) {
      throw {
        status: 404,
        message: 'Course not found or access denied'
      };
    }
    return { success: true };
  }

  // ==== MODULE MANAGEMENT ====
  
  async getModulesForInstructor(courseId, instructorId) {
    return await courseRepository.getModulesByCourseIdForInstructor(courseId, instructorId);
  }

  async createModule(courseId, instructorId, moduleData) {
    return await courseRepository.createModule(courseId, instructorId, moduleData);
  }

  async updateModule(moduleId, instructorId, moduleData) {
    const module = await courseRepository.updateModule(moduleId, instructorId, moduleData);
    if (!module) {
      throw {
        status: 404,
        message: 'Module not found or access denied'
      };
    }
    return module;
  }

  async deleteModule(moduleId, instructorId) {
    const result = await courseRepository.deleteModule(moduleId, instructorId);
    if (!result) {
      throw {
        status: 404,
        message: 'Module not found or access denied'
      };
    }
    return { success: true };
  }

  // ==== LESSON MANAGEMENT ====
  
  async getLessonsForInstructor(moduleId, instructorId) {
    return await courseRepository.getLessonsByModuleIdForInstructor(moduleId, instructorId);
  }

  async createLesson(moduleId, instructorId, lessonData) {
    return await courseRepository.createLesson(moduleId, instructorId, lessonData);
  }

  async updateLesson(lessonId, instructorId, lessonData) {
    const lesson = await courseRepository.updateLesson(lessonId, instructorId, lessonData);
    if (!lesson) {
      throw {
        status: 404,
        message: 'Lesson not found or access denied'
      };
    }
    return lesson;
  }

  async deleteLesson(lessonId, instructorId) {
    const result = await courseRepository.deleteLesson(lessonId, instructorId);
    if (!result) {
      throw {
        status: 404,
        message: 'Lesson not found or access denied'
      };
    }
    return { success: true };
  }

  // ==== ASSET (VIDEO) MANAGEMENT ====
  
  async getAssetsForInstructor(lessonId, instructorId) {
    return await courseRepository.getAssetsByLessonIdForInstructor(lessonId, instructorId);
  }

  async createAsset(lessonId, instructorId, assetData) {
    return await courseRepository.createAsset(lessonId, instructorId, assetData);
  }

  async updateAsset(assetId, instructorId, assetData) {
    const asset = await courseRepository.updateAsset(assetId, instructorId, assetData);
    if (!asset) {
      throw {
        status: 404,
        message: 'Asset not found or access denied'
      };
    }
    return asset;
  }

  async deleteAsset(assetId, instructorId) {
    const result = await courseRepository.deleteAsset(assetId, instructorId);
    if (!result) {
      throw {
        status: 404,
        message: 'Asset not found or access denied'
      };
    }
    return { success: true };
  }

  // ==== QUIZ MANAGEMENT ====
  
  async getQuizzesForInstructor(courseId, instructorId) {
    return await courseRepository.getQuizzesByCourseIdForInstructor(courseId, instructorId);
  }

  async getQuizForInstructor(quizId, instructorId) {
    const quiz = await courseRepository.getQuizByIdForInstructor(quizId, instructorId);
    if (!quiz) {
      throw {
        status: 404,
        message: 'Quiz not found or access denied'
      };
    }
    return quiz;
  }

  async createQuiz(lessonId, instructorId, quizData) {
    return await courseRepository.createQuiz(lessonId, instructorId, quizData);
  }

  async updateQuiz(quizId, instructorId, quizData) {
    const quiz = await courseRepository.updateQuiz(quizId, instructorId, quizData);
    if (!quiz) {
      throw {
        status: 404,
        message: 'Quiz not found or access denied'
      };
    }
    return quiz;
  }

  async deleteQuiz(quizId, instructorId) {
    const result = await courseRepository.deleteQuiz(quizId, instructorId);
    if (!result) {
      throw {
        status: 404,
        message: 'Quiz not found or access denied'
      };
    }
    return { success: true };
  }

  // ==== STUDENT MANAGEMENT ====
  
  async getStudentsByCourse(courseId, instructorId) {
    return await courseRepository.getStudentsByCourseId(courseId, instructorId);
  }

  async getAllStudentsByInstructor(instructorId) {
    return await courseRepository.getAllStudentsByInstructor(instructorId);
  }
}

module.exports = new CourseService();
