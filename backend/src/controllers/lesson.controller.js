const lessonService = require('../services/lesson.service');

// Update lesson progress (watched time)
const updateLessonProgress = async (req, res) => {
  const { lessonId } = req.params;
  const { watchedSeconds } = req.body;
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

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
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await lessonService.markLessonComplete(lessonId, studentId);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  updateLessonProgress,
  markLessonComplete
};