const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token or invalid token format');
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token found after Bearer prefix');
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload to request
    req.userId = decoded.id;
    req.user = { id: decoded.id, email: decoded.email };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = authenticate;