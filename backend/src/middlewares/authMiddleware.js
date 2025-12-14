const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('Missing or invalid auth header for:', req.path);
    return res.status(401).json({ error: 'Missing or invalid token' });
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
    console.error('JWT verification failed:', err.message);
    console.error('Token:', token.substring(0, 20) + '...');
    return res.status(401).json({ error: 'Invalid or expired token' });
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