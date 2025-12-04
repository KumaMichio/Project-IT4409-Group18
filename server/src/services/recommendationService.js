const recommendationModel = require('../models/recommendationFeedbackModel');

const VALID_ACTIONS = ['NOT_INTERESTED', 'PRIORITY', 'HIDE'];

async function submitFeedback(userId, courseId, action) {
  if (!VALID_ACTIONS.includes(action)) {
    const error = new Error('Invalid action');
    error.status = 400;
    throw error;
  }
  const feedback = await recommendationModel.upsertFeedback(
    userId,
    courseId,
    action
  );
  return feedback;
}

async function listUserFeedback(userId) {
  return recommendationModel.getFeedbackByUser(userId);
}

module.exports = {
  submitFeedback,
  listUserFeedback,
};
