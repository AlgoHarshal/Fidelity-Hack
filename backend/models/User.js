const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['investor', 'admin'],
    default: 'investor'
  },
  persona: {
    type: String,
    default: 'confused_beginner'
  },
  investmentGoal: {
    type: String,
    default: ''
  },
  riskAppetite: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
