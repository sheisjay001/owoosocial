const mongoose = require('mongoose');

const WhatsAppContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'invalid'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate numbers for the same user
WhatsAppContactSchema.index({ user: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('WhatsAppContact', WhatsAppContactSchema);
