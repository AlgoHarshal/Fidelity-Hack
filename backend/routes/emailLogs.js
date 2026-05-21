const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');

// @route   GET /email-logs
// @desc    Get all email logs (for admin/dashboard)
// @access  Public (or protected for Admin)
router.get('/', async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ sentAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /email-logs
// @desc    Create a new email log entry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const newLog = new EmailLog(req.body);
    const log = await newLog.save();
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
