const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Map role từ frontend format về database enum
    let role = decoded.role;
    if (role === 'student') role = 'STUDENT';
    if (role === 'teacher') role = 'INSTRUCTOR';
    if (role === 'admin') role = 'ADMIN';
    
    req.user = {
      id: decoded.id || decoded.userId, // Support both formats
      role: role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    // Map role từ frontend format về database enum để so sánh
    let userRole = req.user.role;
    if (userRole === 'student') userRole = 'STUDENT';
    if (userRole === 'teacher') userRole = 'INSTRUCTOR';
    if (userRole === 'admin') userRole = 'ADMIN';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
