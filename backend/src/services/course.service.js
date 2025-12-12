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
}

module.exports = new CourseService();
