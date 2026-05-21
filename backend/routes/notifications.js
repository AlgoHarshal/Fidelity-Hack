const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isInternalUser } = require('../utils/internalAccounts');
const { sendBehavioralEmail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const User = require('../models/User');

// @route   POST /api/notifications/create
// @desc    Create a new notification and optionally trigger an email
// @access  Public
router.post('/create', async (req, res) => {
  try {
    const { userId, type, title, message, actionLabel, actionLink, triggerEmail, emailTemplate, emailData } = req.body;

    const validTypes = [
      'Success', 'Warning', 'Insight', 'Alert', 'Recommendation', 'Update', 'GENERAL',
      'CHECKOUT_ABANDONED', 'COMPARE_ABANDONED', 'PORTFOLIO_ALERT', 'INSURANCE_RECOMMENDATION',
      'HIGH_RISK_WARNING', 'DIVERSIFICATION_ALERT', 'ASSISTANT_RECOVERY', 'INVESTMENT_COMPLETED',
      'CHECKOUT_COMPLETED'
    ];
    const safeType = validTypes.includes(type) ? type : 'GENERAL';

    if (isInternalUser(userId)) {
      return res.status(200).json({ msg: 'Internal account ignored for notifications' });
    }

    // Create DB notification
    const notification = new Notification({
      userId,
      type: safeType,
      title,
      message,
      actionLabel,
      actionLink
    });
    const savedNotification = await notification.save();
    
    console.log(`[Notifications] Notification created successfully`);
    console.log(`[Notifications] Notification persisted to MongoDB`);

    if (type === 'CHECKOUT_ABANDONED') {
      console.log(`[Notifications] Checkout abandonment detected for user: ${userId}`);
    }

    // Trigger Email if requested
    if (triggerEmail && emailTemplate) {
      const user = await User.findOne({ email: userId });
      const userName = user ? user.name.split(' ')[0] : 'Investor';

      let html = '';
      let subject = '';

      if (emailTemplate === 'compareAbandonment') {
        html = templates.compareAbandonment(userName);
        subject = 'Still Exploring Your Options?';
      } else if (emailTemplate === 'checkoutReminder') {
        html = templates.checkoutReminder(userName, emailData?.productName || 'your selected plan');
        subject = 'Your Investment Setup is Almost Complete';
      } else if (emailTemplate === 'insuranceRecommendation') {
        html = templates.insuranceRecommendation(userName);
        subject = 'Protecting Wealth is as Important as Growing It';
      } else if (emailTemplate === 'highRiskWarning') {
        html = templates.highRiskWarning(userName);
        subject = 'Portfolio Risk Diversification Alert';
      }

      if (html) {
        // Send email asynchronously without blocking the response
        if (type === 'CHECKOUT_ABANDONED') {
          console.log(`[Notifications] Checkout recovery email triggered: [${subject}] to [${userId}]`);
        } else {
          console.log(`[Notifications] Recovery email triggered: [${subject}] to [${userId}]`);
        }
        console.log(`[Notifications] Recovery email dispatched`);
        sendBehavioralEmail(userId, subject, html);
      }
    }

    res.status(201).json(savedNotification);
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET /api/notifications/user/:id
// @desc    Get all notifications for a specific user
// @access  Public
router.get('/user/:id', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/notifications/read/:id
// @desc    Mark notification as read
// @access  Public
router.patch('/read/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notifications/clear/:id
// @desc    Clear all notifications for user
// @access  Public
router.delete('/clear/:id', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.id });
    res.json({ msg: 'Notifications cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
