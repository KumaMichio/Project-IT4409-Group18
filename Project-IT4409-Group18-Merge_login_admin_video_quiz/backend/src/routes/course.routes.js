const express = require('express');
const router = express.Router();
const {
  getCourseContent,
  getCourseProgress,
  getCourseDetail,
  getRelatedCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getCourseStudents
} = require('../controllers/course.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// INSTRUCTOR ROUTES
// GET /api/courses/instructor/my-courses - Get courses created by the instructor
router.get('/instructor/my-courses', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), getMyCourses);

// POST /api/courses - Create a new course
router.post('/', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), createCourse);

// PUT /api/courses/:courseId - Update a course
router.put('/:courseId', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), updateCourse);

// DELETE /api/courses/:courseId - Delete a course
router.delete('/:courseId', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), deleteCourse);

// GET /api/courses/:courseId/students - Get students enrolled in a course
router.get('/:courseId/students', authRequired, checkRole('INSTRUCTOR', 'ADMIN'), getCourseStudents);


// PUBLIC / STUDENT ROUTES
// GET /api/courses/:courseId/content - Get course modules, lessons, assets
router.get('/:courseId/content', getCourseContent);

// GET /api/courses/:courseId/progress - Get course progress
router.get('/:courseId/progress', getCourseProgress);

// GET /api/courses/:courseId/related - Get related courses
router.get('/:courseId/related', getRelatedCourses);

// GET /api/courses/:courseId - Get course detail (for detail page)
// Must be last to avoid catching /content and /progress
router.get('/:courseId', getCourseDetail);

module.exports = router;