const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  addConnection,
  getConnections,
  removeConnection,
  updateApiKeys,
  getApiKeys
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/me', protect, getMe);
router.post('/connections', protect, addConnection);
router.get('/connections', protect, getConnections);
router.delete('/connections', protect, removeConnection);
router.put('/api-keys', protect, updateApiKeys);
router.get('/api-keys', protect, getApiKeys);

module.exports = router;
