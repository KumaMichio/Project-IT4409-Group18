const lessonRepository = require('../repositories/lesson.repository');
const moduleRepository = require('../repositories/module.repository');
const courseRepository = require('../repositories/course.repository');
const courseService = require('./course.service');

class LessonService {
  async createLesson(moduleId, instructorId, data) {
    const module = await moduleRepository.getModuleById(moduleId);
    if (!module) {
      throw { status: 404, message: 'Module not found' };
    }

    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(module.course_id, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    // Get max position
    let position = data.position;
    if (!position) {
      const lessons = await lessonRepository.getLessonsByModuleId(moduleId);
      position = lessons.length + 1;
    }

    const newLesson = await lessonRepository.createLesson(
      moduleId, 
      data.title, 
      position, 
      data.duration_s || 0, 
      data.requires_quiz_pass || false
    );

    if (data.video_url) {
      await lessonRepository.upsertLessonVideo(newLesson.id, data.video_url);
      newLesson.video_url = data.video_url;
    }

    return newLesson;
  }

  async updateLesson(lessonId, instructorId, data) {
    const lesson = await lessonRepository.getLessonById(lessonId);
    if (!lesson) {
      throw { status: 404, message: 'Lesson not found' };
    }

    const module = await moduleRepository.getModuleById(lesson.module_id);
    
    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(module.course_id, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    const updatedLesson = await lessonRepository.updateLesson(
      lessonId, 
      data.title, 
      data.position || lesson.position,
      data.duration_s !== undefined ? data.duration_s : lesson.duration_s,
      data.requires_quiz_pass !== undefined ? data.requires_quiz_pass : lesson.requires_quiz_pass
    );

    if (data.video_url !== undefined) {
      await lessonRepository.upsertLessonVideo(lessonId, data.video_url);
      updatedLesson.video_url = data.video_url;
    }

    return updatedLesson;
  }

  async deleteLesson(lessonId, instructorId) {
    const lesson = await lessonRepository.getLessonById(lessonId);
    if (!lesson) {
      throw { status: 404, message: 'Lesson not found' };
    }

    const module = await moduleRepository.getModuleById(lesson.module_id);

    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(module.course_id, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    await lessonRepository.deleteLesson(lessonId);
  }

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
