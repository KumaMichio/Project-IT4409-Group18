const reviewRepository = require('../repositories/review.repository');

class ReviewService {
  async submitCourseReview(courseId, studentId, rating, comment) {
    // Check if student is enrolled
    const isEnrolled = await reviewRepository.checkEnrollment(courseId, studentId);
    if (!isEnrolled) {
      throw { status: 403, message: 'Bạn phải đăng ký khóa học để có thể đánh giá' };
    }

    // Check if already reviewed
    const existingReview = await reviewRepository.getStudentReview(courseId, studentId);
    if (existingReview) {
      throw { status: 400, message: 'Bạn đã đánh giá khóa học này rồi. Vui lòng cập nhật đánh giá thay vì tạo mới.' };
    }

    // Create review
    return await reviewRepository.createReview(courseId, studentId, rating, comment);
  }

  async updateCourseReview(reviewId, studentId, rating, comment) {
    // Check ownership
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw { status: 404, message: 'Không tìm thấy đánh giá' };
    }

    if (review.student_id !== studentId) {
      throw { status: 403, message: 'Bạn không có quyền sửa đánh giá này' };
    }

    // Update review
    return await reviewRepository.updateReview(reviewId, rating, comment);
  }

  async deleteCourseReview(reviewId, studentId) {
    // Check ownership
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw { status: 404, message: 'Không tìm thấy đánh giá' };
    }

    if (review.student_id !== studentId) {
      throw { status: 403, message: 'Bạn không có quyền xóa đánh giá này' };
    }

    // Delete review
    await reviewRepository.deleteReview(reviewId);
  }

  async getStudentReview(courseId, studentId) {
    return await reviewRepository.getStudentReview(courseId, studentId);
  }
}

module.exports = new ReviewService();
