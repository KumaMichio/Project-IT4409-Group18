const moduleRepository = require('../repositories/module.repository');
const courseRepository = require('../repositories/course.repository');

class ModuleService {
  async createModule(courseId, instructorId, data) {
    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(courseId, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    // Get max position if not provided
    let position = data.position;
    if (!position) {
      const modules = await moduleRepository.getModulesByCourseId(courseId);
      position = modules.length + 1;
    }

    return await moduleRepository.createModule(courseId, data.title, position);
  }

  async updateModule(moduleId, instructorId, data) {
    const module = await moduleRepository.getModuleById(moduleId);
    if (!module) {
      throw { status: 404, message: 'Module not found' };
    }

    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(module.course_id, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    return await moduleRepository.updateModule(moduleId, data.title, data.position || module.position);
  }

  async deleteModule(moduleId, instructorId) {
    const module = await moduleRepository.getModuleById(moduleId);
    if (!module) {
      throw { status: 404, message: 'Module not found' };
    }

    // Verify course ownership
    const course = await courseRepository.getInstructorCourseById(module.course_id, instructorId);
    if (!course) {
      throw { status: 403, message: 'Not authorized to modify this course' };
    }

    await moduleRepository.deleteModule(moduleId);
  }
}

module.exports = new ModuleService();
