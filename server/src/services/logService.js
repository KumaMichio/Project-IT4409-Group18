const logModel = require('../models/logModel');

async function logAction(userId, action, detail) {
  try {
    await logModel.createLog(userId, action, detail);
  } catch (e) {
    console.error('Failed to write activity log:', e);
  }
}

module.exports = {
  logAction,
};
