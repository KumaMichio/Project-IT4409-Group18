const recommendationService = require('../services/recommendationService');

async function postFeedback(req, res, next) {
  try {
    const userId = req.user.id;
    const { courseId, action } = req.body;

    if (!courseId || !action) {
      return res.status(400).json({ message: 'courseId and action are required' });
    }

    const feedback = await recommendationService.submitFeedback(
      userId,
      courseId,
      action
    );
    res.json({ message: 'Feedback saved', feedback });
  } catch (err) {
    next(err);
  }
}

async function getMyFeedback(req, res, next) {
  try {
    const userId = req.user.id;
    const feedbackList = await recommendationService.listUserFeedback(userId);
    res.json(feedbackList);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postFeedback,
  getMyFeedback,
};
