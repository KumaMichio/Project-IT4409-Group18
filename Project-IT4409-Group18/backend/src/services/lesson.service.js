const lessonRepository = require('../repositories/lesson.repository');
const courseService = require('./course.service');

class LessonService {
  async updateLessonProgress(lessonId, studentId, watchedSeconds) {
    // Get lesson info
    const lesson = await lessonRepository.getLessonById(lessonId);
    if (!lesson) {
      throw {
        status: 404,
        message: 'Lesson not found'
      };
    }

    // Calculate completion
    const lessonDuration = lesson.duration_s;
    const isCompleted = lessonDuration ? watchedSeconds >= lessonDuration * 0.9 : false;

    // Check if progress exists
    const existingProgress = await lessonRepository.getLessonProgress(studentId, lessonId);

    if (!existingProgress) {
      await lessonRepository.createLessonProgress(studentId, lessonId, watchedSeconds, isCompleted);
    } else {
      await lessonRepository.updateLessonProgress(studentId, lessonId, watchedSeconds, isCompleted);
    }

    // Update course progress
    await courseService.updateCourseProgressByLesson(studentId, lessonId);

    return {
      success: true,
      watchedSeconds,
      isCompleted
    };
  }

  async markLessonComplete(lessonId, studentId) {
    await lessonRepository.markLessonComplete(studentId, lessonId);
    await courseService.updateCourseProgressByLesson(studentId, lessonId);

    return {
      success: true
    };
  }
}

module.exports = new LessonService();
