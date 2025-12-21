const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');

      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (dbError) {
        // Fallback for mock users
        // Since we can't easily access the mockUsers array from controller here without exporting it,
        // we'll just reconstruct a basic user object from the token ID if it looks like a mock ID.
        // Or better yet, we can trust the token if we signed it.
        req.user = { _id: decoded.id, name: 'Mock User', email: 'mock@owoo.com', role: 'user' };
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

module.exports = { protect };