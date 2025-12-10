const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return next(new AppError(401, 'Yêu cầu đăng nhập', 'UNAUTHORIZED'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
    };
    return next();
  } catch (err) {
    return next(new AppError(401, 'Token không hợp lệ hoặc đã hết hạn', 'INVALID_TOKEN'));
  }
}

module.exports = {
  authRequired,
};
