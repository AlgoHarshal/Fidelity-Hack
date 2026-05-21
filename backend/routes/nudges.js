const express = require('express');
const router = express.Router();
const nudgeController = require('../controllers/nudgeController');

// @route   POST /nudges/generate
// @desc    Generate nudges based on user behavior
// @access  Public
router.post('/generate', nudgeController.generateNudges);

// @route   GET /nudges/:userId
// @desc    Get generated nudges/logs for user
// @access  Public
router.get('/:userId', nudgeController.getNudges);

module.exports = router;
