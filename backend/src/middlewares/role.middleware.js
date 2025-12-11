const AppError = require('../utils/AppError');

/**
 * Middleware to check if user has required role(s)
 * @param {...string} roles - Roles allowed to access (ADMIN, INSTRUCTOR, STUDENT)
 */
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized', 'UNAUTHORIZED'));
    }

    // Map frontend role to database enum
    let userRole = req.user.role;
    if (userRole === 'student') userRole = 'STUDENT';
    if (userRole === 'teacher') userRole = 'INSTRUCTOR';
    if (userRole === 'admin') userRole = 'ADMIN';

    if (!roles.includes(userRole)) {
      return next(
        new AppError(403, 'Forbidden: Insufficient permissions', 'FORBIDDEN')
      );
    }

    next();
  };
}

module.exports = {
  checkRole,
};

