const reviewService = require('../services/review.service');

class ReviewController {
  /**
   * Submit a course review
   * POST /api/reviews/courses/:courseId
   */
  async submitCourseReview(req, res) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating phải từ 1 đến 5' });
      }

      const review = await reviewService.submitCourseReview(
        courseId,
        studentId,
        rating,
        comment || ''
      );

      res.status(201).json({ success: true, review });
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Update a course review
   * PUT /api/reviews/:reviewId
   */
  async updateCourseReview(req, res) {
    try {
      const { reviewId } = req.params;
      const studentId = req.user.id;
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating phải từ 1 đến 5' });
      }

      const review = await reviewService.updateCourseReview(
        reviewId,
        studentId,
        rating,
        comment || ''
      );

      res.json({ success: true, review });
    } catch (error) {
      console.error('Error updating review:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Delete a course review
   * DELETE /api/reviews/:reviewId
   */
  async deleteCourseReview(req, res) {
    try {
      const { reviewId } = req.params;
      const studentId = req.user.id;

      await reviewService.deleteCourseReview(reviewId, studentId);

      res.json({ success: true, message: 'Đánh giá đã được xóa' });
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Get user's review for a course
   * GET /api/reviews/courses/:courseId/my-review
   */
  async getMyReview(req, res) {
    try {
      const { courseId } = req.params;
      const studentId = req.user?.id || req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const review = await reviewService.getStudentReview(courseId, studentId);

      res.json({ success: true, review });
    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new ReviewController();
