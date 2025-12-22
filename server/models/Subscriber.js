const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'bounced'],
    default: 'subscribed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate emails for the same user
SubscriberSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
