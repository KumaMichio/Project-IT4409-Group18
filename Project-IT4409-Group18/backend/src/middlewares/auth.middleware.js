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
    // Support both 'id' and 'userId' for backward compatibility
    const userId = payload.id || payload.userId;
    
    if (!userId) {
      return next(new AppError(401, 'Token không hợp lệ: thiếu user ID', 'INVALID_TOKEN'));
    }
    
    req.user = {
      id: userId,
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