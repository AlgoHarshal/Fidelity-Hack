const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { isInternalUser } = require('../utils/internalAccounts');
const auth = require('../middleware/auth');
// @route   POST /events
// @desc    Log a new tracking event
// @access  Public (or protected depending on implementation)
router.post('/', async (req, res) => {
  try {
    const { userId, action, page, plan, timeSpent, points } = req.body;

    // Defensive Validation
    if (!userId || !action) {
      return res.status(400).json({ error: 'Missing required fields: userId and action are required.' });
    }

    if (isInternalUser(userId)) {
      return res.status(200).json({ msg: 'Internal account ignored' });
    }

    const newEvent = new Event({
      userId,
      action,
      page: page || 'Behavioral Trigger',
      plan,
      timeSpent,
      points
    });

    const event = await newEvent.save();
    console.log(`Behavioral event stored: [${event.action}] on page [${event.page}] for user [${event.userId}]`);
    res.json(event);
  } catch (err) {
    console.error('Event validation/save error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET /events/:userId
// @desc    Get all events for a user
// @access  Public (or protected)
router.get('/:userId', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
