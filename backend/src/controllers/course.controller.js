const courseService = require('../services/course.service');

// Get course details with modules and lessons
const getCourseContent = async (req, res) => {
  const { courseId } = req.params;
  // Get studentId from authenticated user (from authMiddleware)
  const studentId = req.user?.id;
  
  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const data = await courseService.getCourseContent(courseId, studentId);
    res.json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error fetching course content:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get course progress
const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  // Get studentId from authenticated user (from authMiddleware)
  const studentId = req.user?.id;
  
  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const progress = await courseService.getCourseProgress(courseId, studentId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get course detail (for course detail page)
// This is PUBLIC - anyone can view course details to decide if they want to enroll
const getCourseDetail = async (req, res) => {
  const { courseId } = req.params;
  // studentId is optional - if user is logged in, we'll show enrollment status
  // Try to get from auth token if available, otherwise null
  let studentId = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      studentId = decoded.id || decoded.userId;
    } catch (err) {
      // Token invalid or expired - ignore, treat as guest
      studentId = null;
    }
  }

  try {
    const data = await courseService.getCourseDetail(courseId, studentId);
    res.json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error fetching course detail:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get related courses
const getRelatedCourses = async (req, res) => {
  const { courseId } = req.params;

  try {
    const courses = await courseService.getRelatedCourses(courseId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching related courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all courses (for courses listing page)
const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const keyword = req.query.q || req.query.keyword || '';
    
    // If keyword is provided, search instead of getting all
    if (keyword && keyword.trim() !== '') {
      const result = await courseService.searchCourses(keyword.trim(), page, limit);
      return res.json(result);
    }
    
    // No keyword, return all courses
    const result = await courseService.getAllCourses(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== INSTRUCTOR COURSE MANAGEMENT ====

const getInstructorCourses = async (req, res) => {
  const instructorId = req.user.id;
  
  try {
    const courses = await courseService.getInstructorCourses(instructorId);
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCourseForInstructor = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const course = await courseService.getCourseForInstructor(courseId, instructorId);
    res.json(course);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error fetching course for instructor:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  const instructorId = req.user?.id;
  const courseData = req.body;
  
  try {
    if (!instructorId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }
    
    if (!courseData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const course = await courseService.createCourse(instructorId, courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    console.error('Request user:', req.user);
    const errorMessage = error.message || 'Server error';
    res.status(500).json({ error: errorMessage });
  }
};

const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  const courseData = req.body;
  
  try {
    const course = await courseService.updateCourse(courseId, instructorId, courseData);
    res.json(course);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  
  try {
    await courseService.deleteCourse(courseId, instructorId);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== MODULE MANAGEMENT ====

const getModules = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const modules = await courseService.getModulesForInstructor(courseId, instructorId);
    res.json({ modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createModule = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  const moduleData = req.body;
  
  try {
    if (!moduleData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const module = await courseService.createModule(courseId, instructorId, moduleData);
    res.status(201).json(module);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const updateModule = async (req, res) => {
  const { moduleId } = req.params;
  const instructorId = req.user.id;
  const moduleData = req.body;
  
  try {
    const module = await courseService.updateModule(moduleId, instructorId, moduleData);
    res.json(module);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteModule = async (req, res) => {
  const { moduleId } = req.params;
  const instructorId = req.user.id;
  
  try {
    await courseService.deleteModule(moduleId, instructorId);
    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== LESSON MANAGEMENT ====

const getLessons = async (req, res) => {
  const { moduleId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const lessons = await courseService.getLessonsForInstructor(moduleId, instructorId);
    res.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createLesson = async (req, res) => {
  const { moduleId } = req.params;
  const instructorId = req.user.id;
  const lessonData = req.body;
  
  try {
    if (!lessonData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const lesson = await courseService.createLesson(moduleId, instructorId, lessonData);
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  const lessonData = req.body;
  
  try {
    const lesson = await courseService.updateLesson(lessonId, instructorId, lessonData);
    res.json(lesson);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  
  try {
    await courseService.deleteLesson(lessonId, instructorId);
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== ASSET (VIDEO) MANAGEMENT ====

const getAssets = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const assets = await courseService.getAssetsForInstructor(lessonId, instructorId);
    res.json({ assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createAsset = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  const assetData = req.body;
  
  try {
    if (!assetData.asset_kind || !assetData.url) {
      return res.status(400).json({ error: 'asset_kind and url are required' });
    }
    
    const asset = await courseService.createAsset(lessonId, instructorId, assetData);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const uploadVideoAsset = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    // Tạo URL để truy cập video từ frontend
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    const assetData = {
      asset_kind: 'VIDEO',
      url: videoUrl,
      position: parseInt(req.body.position) || 1,
    };
    
    const asset = await courseService.createAsset(lessonId, instructorId, assetData);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Error uploading video asset:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const updateAsset = async (req, res) => {
  const { assetId } = req.params;
  const instructorId = req.user.id;
  const assetData = req.body;
  
  try {
    const asset = await courseService.updateAsset(assetId, instructorId, assetData);
    res.json(asset);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAsset = async (req, res) => {
  const { assetId } = req.params;
  const instructorId = req.user.id;
  
  try {
    await courseService.deleteAsset(assetId, instructorId);
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== QUIZ MANAGEMENT ====

const getQuizzes = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const quizzes = await courseService.getQuizzesForInstructor(courseId, instructorId);
    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getQuiz = async (req, res) => {
  const { quizId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const quiz = await courseService.getQuizForInstructor(quizId, instructorId);
    res.json(quiz);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createQuiz = async (req, res) => {
  const { lessonId } = req.params;
  const instructorId = req.user.id;
  const quizData = req.body;
  
  try {
    if (!quizData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const quiz = await courseService.createQuiz(lessonId, instructorId, quizData);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const updateQuiz = async (req, res) => {
  const { quizId } = req.params;
  const instructorId = req.user.id;
  const quizData = req.body;
  
  try {
    const quiz = await courseService.updateQuiz(quizId, instructorId, quizData);
    res.json(quiz);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteQuiz = async (req, res) => {
  const { quizId } = req.params;
  const instructorId = req.user.id;
  
  try {
    await courseService.deleteQuiz(quizId, instructorId);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==== STUDENT MANAGEMENT ====

const getStudentsByCourse = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;
  
  try {
    const students = await courseService.getStudentsByCourse(courseId, instructorId);
    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllStudents = async (req, res) => {
  const instructorId = req.user.id;
  
  try {
    const students = await courseService.getAllStudentsByInstructor(instructorId);
    res.json({ students });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
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
};