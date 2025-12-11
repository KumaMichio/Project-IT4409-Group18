const logModel = require('../models/log.model');

async function createLog(userId, action, detail) {
  return logModel.createLog(userId, action, detail);
}

async function getLogs(limit, actionFilter) {
  return logModel.getLogs(limit, actionFilter);
}

module.exports = {
  createLog,
  getLogs,
};
