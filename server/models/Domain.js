const mongoose = require('mongoose');

const domainSchema = mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'temporary_failure', 'not_started'],
    default: 'pending'
  },
  resendDomainId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  dnsRecords: [{
    recordType: String,
    name: String,
    value: String,
    ttl: String,
    status: String
  }],
  region: {
    type: String,
    default: 'us-east-1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;