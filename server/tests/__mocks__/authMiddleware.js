// Mock cho ../src/middleware/authMiddleware
function authMiddleware(req, res, next) {
  // giả sử user đã login, là STUDENT
  req.user = { id: 123, role: 'STUDENT' };
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    // trong test, luôn cho qua
    next();
  };
}

module.exports = { authMiddleware, requireRole };
