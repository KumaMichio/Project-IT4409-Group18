const systemModel = require('../models/system.model');
const logModel = require('../models/log.model');
const systemSettingsModel = require('../models/systemSettings.model');
const logService = require('./log.service');

async function getOverview() {
  return systemModel.getSystemOverview();
}

async function listLogs(limit, actionFilter) {
  const lim = Number(limit) || 50;
  return logModel.getLogs(lim, actionFilter);
}

async function getMaintenanceMode() {
  return systemSettingsModel.getMaintenanceMode();
}

async function setMaintenanceMode(enabled, userId) {
  return systemSettingsModel.setMaintenanceMode(enabled, userId);
}

module.exports = {
  getOverview,
  listLogs,
  getMaintenanceMode,
  setMaintenanceMode,
};