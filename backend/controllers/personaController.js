const Event = require('../models/Event');
const Score = require('../models/Score');
const personaService = require('../services/personaService');

exports.getPersona = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all events
    const events = await Event.find({ userId });
    
    // Calculate metrics
    let totalTimeSpent = 0;
    let exitCount = 0;
    events.forEach(e => {
       totalTimeSpent += e.timeSpent || 0;
       if (e.action === "Session Exit") exitCount++;
    });

    // Get score
    const scoreRecord = await Score.findOne({ userId });
    const score = scoreRecord ? scoreRecord.score : 0;

    // Detect Persona using service
    const persona = personaService.detectPersona(events, score, totalTimeSpent, exitCount);

    res.json(persona);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
