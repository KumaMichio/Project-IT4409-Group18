const courseService = require('../services/course.service');

// Get course details with modules and lessons
const getCourseContent = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.query.studentId; // TODO: Get from JWT token in production

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
  const studentId = req.query.studentId; // TODO: Get from JWT token

  try {
    const progress = await courseService.getCourseProgress(courseId, studentId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get course detail (for course detail page)
const getCourseDetail = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.query.studentId; // TODO: Get from JWT token (optional)

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

module.exports = {
  getCourseContent,
  getCourseProgress,
  getCourseDetail,
  getRelatedCourses
};