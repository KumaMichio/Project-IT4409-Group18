const lessonService = require('../services/lesson.service');

const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const instructorId = req.user.id;
    const lesson = await lessonService.createLesson(moduleId, instructorId, req.body);
    res.status(201).json(lesson);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const instructorId = req.user.id;
    const lesson = await lessonService.updateLesson(lessonId, instructorId, req.body);
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
  try {
    const { lessonId } = req.params;
    const instructorId = req.user.id;
    await lessonService.deleteLesson(lessonId, instructorId);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update lesson progress (watched time)
const updateLessonProgress = async (req, res) => {
  const { lessonId } = req.params;
  const { studentId, watchedSeconds } = req.body; // TODO: Get studentId from JWT token

  try {
    const result = await lessonService.updateLessonProgress(lessonId, studentId, watchedSeconds);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark lesson as completed
const markLessonComplete = async (req, res) => {
  const { lessonId } = req.params;
  const { studentId } = req.body; // TODO: Get from JWT token

  try {
    const result = await lessonService.markLessonComplete(lessonId, studentId);
    res.json(result);
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  updateLessonProgress,
  markLessonComplete,
  createLesson,
  updateLesson,
  deleteLesson
};