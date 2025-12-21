const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
  userId: {
    type: String, // Mock user ID since we don't have auth yet
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due'],
    default: 'active',
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  currentPeriodEnd: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
