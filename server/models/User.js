const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  apiKeys: {
    resend: { type: String, select: false },
    sendgrid: { type: String, select: false },
    openai: { type: String, select: false }
  },
  connections: [
    {
      platform: String, // 'facebook', 'instagram', 'twitter', 'linkedin'
      platformId: String, // The user's ID on that platform (e.g., Facebook Page ID)
      name: String, // 'My Facebook Page'
      accessToken: String, // OAuth Access Token
      refreshToken: String, // OAuth Refresh Token (if applicable)
      tokenExpiry: Date, // When the token expires
      identifier: String, // Legacy: Group ID, Chat ID (keep for backward compatibility)
      apiKey: String, // Legacy: Manual API Key (keep for backward compatibility)
      connectedAt: { type: Date, default: Date.now }
    }
  ]
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);