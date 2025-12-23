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
  updateDetails,
  sendVerificationEmail,
  verifyEmail
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/verifyemail', protect, sendVerificationEmail);
router.put('/verifyemail/:token', verifyEmail);
router.post('/connections', protect, addConnection);
router.get('/connections', protect, getConnections);
router.delete('/connections', protect, removeConnection);

module.exports = router;
