const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  riskPreference: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  conversionProbability: {
    type: Number,
    default: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Investment', InvestmentSchema);
