const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft',
  },
  scheduledTime: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  analytics: {
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    unsubscribes: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;
