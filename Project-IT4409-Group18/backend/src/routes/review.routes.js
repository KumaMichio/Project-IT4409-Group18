const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authRequired } = require('../middlewares/auth.middleware');

// All review routes require authentication
router.use(authRequired);

// Submit a review for a course
router.post('/courses/:courseId', reviewController.submitCourseReview);

// Get my review for a course
router.get('/courses/:courseId/my-review', reviewController.getMyReview);

// Update a review
router.put('/:reviewId', reviewController.updateCourseReview);

// Delete a review
router.delete('/:reviewId', reviewController.deleteCourseReview);

module.exports = router;

