const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const { isInternalUser } = require('../utils/internalAccounts');

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { userId, planName, amount, riskPreference, paymentMethod, conversionProbability } = req.body;

    if (isInternalUser(userId)) {
      return res.status(200).json({ msg: 'Internal account ignored for investments' });
    }

    const newInvestment = new Investment({
      userId,
      planName,
      amount,
      riskPreference,
      paymentMethod,
      conversionProbability
    });

    const savedInvestment = await newInvestment.save();
    res.status(201).json(savedInvestment);
  } catch (err) {
    console.error('Error saving investment:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET /api/investments/user/:userId
// @desc    Get all investments for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   GET /api/investments
// @desc    Get all investments (Admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find().sort({ timestamp: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
