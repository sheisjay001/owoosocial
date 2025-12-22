const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'processing', 'completed', 'paused', 'failed'],
    default: 'draft'
  },
  scheduledTime: {
    type: Date,
    default: Date.now
  },
  totalRecipients: {
    type: Number,
    default: 0
  },
  processedCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failCount: {
    type: Number,
    default: 0
  },
  recipients: [{
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppContact' },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: Date,
    error: String
  }],
  batchSize: {
    type: Number,
    default: 5
  },
  batchIntervalMinutes: {
    type: Number,
    default: 8
  },
  nextBatchTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Broadcast', BroadcastSchema);
