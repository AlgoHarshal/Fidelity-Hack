const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Score', ScoreSchema);
