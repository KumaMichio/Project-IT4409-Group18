const systemService = require('../services/systemService');

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

module.exports = {
  getOverview,
  getLogs,
};
