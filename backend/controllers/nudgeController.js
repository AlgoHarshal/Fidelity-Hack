const Event = require('../models/Event');
const Score = require('../models/Score');
const EmailLog = require('../models/EmailLog');
const personaService = require('../services/personaService');
const nudgeService = require('../services/nudgeService');
const triggerService = require('../services/triggerService');

exports.generateNudges = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Gather data
    const events = await Event.find({ userId });
    const scoreRecord = await Score.findOne({ userId });
    const score = scoreRecord ? scoreRecord.score : 0;
    
    let totalTimeSpent = 0;
    let exitCount = 0;
    events.forEach(e => {
       totalTimeSpent += e.timeSpent || 0;
       if (e.action === "Session Exit") exitCount++;
    });

    // Detect persona
    const persona = personaService.detectPersona(events, score, totalTimeSpent, exitCount);
    
    // Generate trigger reasons
    const triggerReasons = triggerService.generateTriggerReasons(events, score, totalTimeSpent, exitCount);
    
    // Generate nudges based on persona
    const nudges = nudgeService.generateNudge(persona.id);

    res.json({ persona, triggerReasons, nudges });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getNudges = async (req, res) => {
  try {
    const { userId } = req.params;
    // For now just generating dynamically, usually this would fetch saved nudges/logs
    // We can just query email logs as nudges history
    const logs = await EmailLog.find({ userId }).sort({ sentAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
