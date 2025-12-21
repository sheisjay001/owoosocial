const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String, // For WhatsApp Group ID or Telegram Chat ID
    required: false,
  },
  hashtags: [String],
  imagePrompt: String,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft',
  },
  scheduledTime: {
    type: Date,
  },
  analytics: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
