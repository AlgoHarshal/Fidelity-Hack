const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  triggerReason: {
    type: String,
    required: true
  },
  persona: {
    type: String,
    default: 'Unknown'
  },
  nudgeType: {
    type: String,
    default: 'email'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
