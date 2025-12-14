const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { authRequired } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');
const { uploadVideo } = require('../middlewares/upload.middleware');
const {
  getCourseContent,
  getCourseProgress,
  getCourseDetail,
  getRelatedCourses,
  getAllCourses,
  // Instructor course management
  getInstructorCourses,
  getCourseForInstructor,
  createCourse,
  updateCourse,
  deleteCourse,
  // Module management
  getModules,
  createModule,
  updateModule,
  deleteModule,
  // Lesson management
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  // Asset management
  getAssets,
  createAsset,
  uploadVideoAsset,
  updateAsset,
  deleteAsset,
  // Quiz management
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  // Student management
  getStudentsByCourse,
  getAllStudents,
  // Tags
  getTags,
} = require('../controllers/course.controller');

// Public routes
// GET /api/courses/tags - Get all tags
router.get('/tags', getTags);

// GET /api/courses - Get all published courses (for listing page)
router.get('/', getAllCourses);

// GET /api/courses/:courseId/related - Get related courses
router.get('/:courseId/related', getRelatedCourses);

// GET /api/courses/:courseId - Get course detail (for detail page) - PUBLIC
router.get('/:courseId', getCourseDetail);

// Student routes (require auth)
// GET /api/courses/:courseId/content - Get course modules, lessons, assets (REQUIRES AUTH)
router.get('/:courseId/content', authMiddleware, getCourseContent);

// GET /api/courses/:courseId/progress - Get course progress (REQUIRES AUTH)
router.get('/:courseId/progress', authMiddleware, getCourseProgress);

// Instructor routes (require auth + INSTRUCTOR role)
const instructorRoutes = express.Router();
instructorRoutes.use(authRequired);
instructorRoutes.use(checkRole('INSTRUCTOR'));

// Course management
instructorRoutes.get('/my-courses', getInstructorCourses);
instructorRoutes.get('/my-courses/:courseId', getCourseForInstructor);
instructorRoutes.post('/my-courses', createCourse);
instructorRoutes.put('/my-courses/:courseId', updateCourse);
instructorRoutes.delete('/my-courses/:courseId', deleteCourse);

// Module management
instructorRoutes.get('/my-courses/:courseId/modules', getModules);
instructorRoutes.post('/my-courses/:courseId/modules', createModule);
instructorRoutes.put('/modules/:moduleId', updateModule);
instructorRoutes.delete('/modules/:moduleId', deleteModule);

// Lesson management
instructorRoutes.get('/modules/:moduleId/lessons', getLessons);
instructorRoutes.post('/modules/:moduleId/lessons', createLesson);
instructorRoutes.put('/lessons/:lessonId', updateLesson);
instructorRoutes.delete('/lessons/:lessonId', deleteLesson);

// Asset (Video) management
instructorRoutes.get('/lessons/:lessonId/assets', getAssets);
instructorRoutes.post('/lessons/:lessonId/assets', createAsset);
instructorRoutes.post('/lessons/:lessonId/assets/upload', uploadVideo, uploadVideoAsset);
instructorRoutes.put('/assets/:assetId', updateAsset);
instructorRoutes.delete('/assets/:assetId', deleteAsset);

// Quiz management
instructorRoutes.get('/my-courses/:courseId/quizzes', getQuizzes);
instructorRoutes.get('/quizzes/:quizId', getQuiz);
instructorRoutes.post('/lessons/:lessonId/quizzes', createQuiz);
instructorRoutes.put('/quizzes/:quizId', updateQuiz);
instructorRoutes.delete('/quizzes/:quizId', deleteQuiz);

// Student management
instructorRoutes.get('/my-courses/:courseId/students', getStudentsByCourse);
instructorRoutes.get('/students', getAllStudents);

// Mount instructor routes
router.use('/instructor', instructorRoutes);

module.exports = router;