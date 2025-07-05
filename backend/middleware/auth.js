// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'none');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token or invalid token format');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token found after Bearer prefix');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', decoded.id);
    
    // Add user from payload to request
    req.userId = decoded.id;
    req.user = { id: decoded.id, email: decoded.email };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
