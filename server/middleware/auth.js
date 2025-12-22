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

const protectOptional = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (token && token !== 'null' && token !== 'undefined') {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
          try {
            req.user = await User.findById(decoded.id).select('-password');
          } catch (dbError) {
            req.user = { _id: decoded.id, name: 'Mock User', email: 'mock@owoo.com', role: 'user' };
          }
      }
    } catch (error) {
      console.log('Optional Auth Failed (Continuing as Guest):', error.message);
      // Do not error out, just continue without req.user
    }
  }
  next();
};

module.exports = { protect, protectOptional };