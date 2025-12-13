const enrollmentService = require('../services/enrollment.service');

/**
 * Get all enrolled courses for the authenticated student
 * GET /api/enrollments/my-courses
 */
const getMyCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const result = await enrollmentService.getStudentEnrollments(studentId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    next(error);
  }
};

/**
 * Enroll student in a course (for free courses)
 * POST /api/enrollments/enroll
 * Body: { courseId: number }
 */
const enrollCourse = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const enrollment = await enrollmentService.enrollCourse(studentId, courseId);

    res.json({
      success: true,
      message: 'Đã đăng ký khóa học thành công',
      enrollment
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error enrolling course:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyCourses,
  enrollCourse
};

