const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

module.exports = {
  errorHandler,
};