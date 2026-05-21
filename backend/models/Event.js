const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  userId: {
    type: String, // String for now, could be ObjectId referencing User
    required: true
  },
  action: {
    type: String,
    required: true
  },
  page: {
    type: String,
    default: 'Behavioral Trigger'
  },
  plan: {
    type: String
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);
