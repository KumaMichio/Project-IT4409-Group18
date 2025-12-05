// Mock middleware ALWAYS allowing request to pass

function authMiddleware(req, res, next) {
  req.user = { id: 123, role: 'STUDENT' };
  next();
}

function requireRole() {
  return (req, res, next) => next();
}

module.exports = { authMiddleware, requireRole };
