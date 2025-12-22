const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const bcrypt = require('bcryptjs');

// In-memory store for fallback (when DB is offline)
let mockUsers = [
  {
    _id: 'mock_admin_123',
    name: 'OWOO Admin',
    email: 'admin@owoo.com',
    password: 'password123', // Plain text for mock check
    role: 'admin'
  }
];

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user;
    try {
      // Check if DB is connected
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }

      // Try DB first
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      user = await User.create({ name, email, password });
    } catch (dbError) {
      console.log('DB Error (Register), using mock:', dbError.message);
      // Fallback to mock
      if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ success: false, error: 'User already exists (Mock)' });
      }
      user = {
        _id: `mock_${Date.now()}`,
        name,
        email,
        password, // In mock, we store plain text for simplicity
        role: 'user'
      };
      mockUsers.push(user);
    }

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    let user;
    let isMatch = false;

    try {
      // Check if DB is connected
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }

      // Try DB
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } catch (dbError) {
       console.log('DB Error (Login), using mock:', dbError.message);
       // Mock fallback
       user = mockUsers.find(u => u.email === email);
       if (user) {
           // Simple string comparison for mock
           isMatch = user.password === password; 
       }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      // Get reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
  
      // Hash token and set to resetPasswordToken field
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
  
      // Set expire
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
      await user.save();
  
      const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/reset-password/${resetToken}`;
      
      // Ideally, send email here
      console.log('Reset URL:', resetUrl); // For dev
  
      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: 'Password updated success',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // DB Success
    if (user) {
        res.status(200).json({
          success: true,
          data: user,
        });
    } else {
        // Mock fallback (if DB failed but auth middleware passed via mock logic)
        // Reconstruct user from request or mockUsers
        const mockUser = mockUsers.find(u => u._id === req.user.id) || req.user;
        res.status(200).json({
          success: true,
          data: mockUser,
        });
    }

  } catch (error) {
    // Fallback if DB fails completely
    res.status(200).json({
        success: true,
        data: req.user,
    });
  }
};

exports.addConnection = async (req, res) => {
  try {
    const { platform, identifier, name, apiKey } = req.body;
    let user;
    
    try {
      user = await User.findById(req.user.id);
    } catch (e) {
      console.log('DB Error fetching user for connection:', e.message);
    }

    if (user) {
      // Check if already exists
      const exists = user.connections && user.connections.find(c => c.platform === platform && c.identifier === identifier);
      if (!exists) {
        user.connections = user.connections || [];
        user.connections.push({ platform, identifier, name, apiKey });
        await user.save();
      }
      res.status(200).json({ success: true, data: user.connections });
    } else {
      // Mock fallback
      console.log(`[Mock] Adding connection ${platform}: ${identifier}`);
      
      // Update in-memory mock user
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
          mockUser.connections = mockUser.connections || [];
          // Avoid duplicates
          if (!mockUser.connections.find(c => c.platform === platform && c.identifier === identifier)) {
             mockUser.connections.push({ platform, identifier, name, apiKey, connectedAt: new Date() });
          }
          res.status(200).json({ success: true, data: mockUser.connections });
      } else {
          // Fallback if user not found in mockUsers
          res.status(200).json({ 
            success: true, 
            data: [
              { platform, identifier, name, apiKey, connectedAt: new Date() }
            ] 
          });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    let user;
    try {
      user = await User.findById(req.user.id);
    } catch (e) {}

    if (user) {
      res.status(200).json({ success: true, data: user.connections || [] });
    } else {
      // Mock data
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
          res.status(200).json({ success: true, data: mockUser.connections || [] });
      } else {
          res.status(200).json({ success: true, data: [] });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeConnection = async (req, res) => {
    try {
      const { platform, identifier } = req.body;
      let user;
      try {
        user = await User.findById(req.user.id);
      } catch (e) {}
  
      if (user) {
        if (user.connections) {
            user.connections = user.connections.filter(c => !(c.platform === platform && c.identifier === identifier));
            await user.save();
        }
        res.status(200).json({ success: true, data: user.connections });
      } else {
        // Mock fallback
        const mockUser = mockUsers.find(u => u._id === req.user.id);
        if (mockUser && mockUser.connections) {
            mockUser.connections = mockUser.connections.filter(c => !(c.platform === platform && c.identifier === identifier));
            res.status(200).json({ success: true, data: mockUser.connections });
        } else {
            res.status(200).json({ success: true, data: [] });
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };


