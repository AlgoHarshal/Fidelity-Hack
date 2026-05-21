const Event = require('../models/Event');
const Score = require('../models/Score');
const scoreService = require('../services/scoreService');

exports.computeScore = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Fetch all events for the user
    const events = await Event.find({ userId });
    
    // Calculate total score from events
    let totalScore = 0;
    events.forEach(event => {
       totalScore += event.points || 0;
    });

    // Update or create score record
    let scoreRecord = await Score.findOne({ userId });
    if (scoreRecord) {
      scoreRecord.score = totalScore;
      scoreRecord.lastUpdated = Date.now();
      await scoreRecord.save();
    } else {
      scoreRecord = new Score({ userId, score: totalScore });
      await scoreRecord.save();
    }
    
    const labelData = scoreService.getScoreLabel(totalScore);

    res.json({ score: totalScore, ...labelData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const scoreRecord = await Score.findOne({ userId });
    if (!scoreRecord) {
      return res.status(404).json({ msg: 'Score not found' });
    }
    res.json(scoreRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
