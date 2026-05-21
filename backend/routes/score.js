const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// @route   POST /score/compute
// @desc    Compute score based on events
// @access  Public
router.post('/compute', scoreController.computeScore);

// @route   GET /score/:userId
// @desc    Get score for user
// @access  Public
router.get('/:userId', scoreController.getScore);

module.exports = router;
