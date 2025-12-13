const systemService = require('../services/system.service');

async function getOverview(req, res, next) {
  try {
    const overview = await systemService.getOverview();
    res.json(overview);
  } catch (err) {
    next(err);
  }
}

async function getLogs(req, res, next) {
  try {
    const { limit, action } = req.query;
    const logs = await systemService.listLogs(limit, action);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function getMaintenanceMode(req, res, next) {
  try {
    const mode = await systemService.getMaintenanceMode();
    res.json(mode);
  } catch (err) {
    next(err);
  }
}

async function setMaintenanceMode(req, res, next) {
  try {
    const { enabled } = req.body;
    const userId = req.user?.id;
    const mode = await systemService.setMaintenanceMode(enabled, userId);
    res.json(mode);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getLogs,
  getMaintenanceMode,
  setMaintenanceMode,
};