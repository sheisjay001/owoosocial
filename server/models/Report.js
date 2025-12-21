const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'custom'],
    default: 'monthly',
  },
  dateRange: {
    start: Date,
    end: Date,
  },
  metrics: {
    social: {
      totalPosts: Number,
      totalLikes: Number,
      totalImpressions: Number,
      engagementRate: Number,
    },
    newsletter: {
      totalSent: Number,
      avgOpenRate: Number,
      totalSubscribers: Number,
    },
    podcast: {
      totalEpisodes: Number,
      totalDownloads: Number,
      avgListenTime: Number,
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
