const enrollmentRepository = require('../repositories/enrollment.repository');

class EnrollmentService {
  /**
   * Get all enrolled courses for a student
   * @param {number} studentId
   * @returns {Promise<Object>} Enrollments with pagination info
   */
  async getStudentEnrollments(studentId) {
    const enrollments = await enrollmentRepository.getStudentEnrollments(studentId);
    const total = await enrollmentRepository.getStudentEnrollmentCount(studentId);

    // Format the data
    const formattedEnrollments = enrollments.map(enrollment => ({
      enrollment_id: enrollment.enrollment_id,
      enrollment_status: enrollment.enrollment_status,
      enrolled_at: enrollment.enrolled_at,
      expires_at: enrollment.expires_at,
      course: {
        id: enrollment.course_id,
        title: enrollment.title,
        slug: enrollment.slug,
        description: enrollment.description,
        thumbnail_url: enrollment.thumbnail_url,
        price_cents: enrollment.price_cents,
        currency: enrollment.currency,
        instructor: {
          id: enrollment.instructor_id,
          name: enrollment.instructor_name,
          avatar_url: enrollment.instructor_avatar
        },
        avg_rating: parseFloat(enrollment.avg_rating) || 0,
        review_count: parseInt(enrollment.review_count) || 0
      },
      progress: {
        percent: parseFloat(enrollment.progress_percent) || 0
      }
    }));

    return {
      enrollments: formattedEnrollments,
      total
    };
  }

  /**
   * Enroll student in a course (for free courses)
   * @param {number} studentId
   * @param {number} courseId
   * @returns {Promise<Object>} Enrollment object
   */
  async enrollCourse(studentId, courseId) {
    return await enrollmentRepository.enrollCourse(studentId, courseId);
  }
}

module.exports = new EnrollmentService();

