const systemModel = require('../models/systemModel');
const logModel = require('../models/logModel');

async function getOverview() {
  return systemModel.getSystemOverview();
}

async function listLogs(limit, actionFilter) {
  const lim = Number(limit) || 50;
  return logModel.getLogs(lim, actionFilter);
}

module.exports = {
  getOverview,
  listLogs,
};
