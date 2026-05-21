const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Success', 'Warning', 'Insight', 'Alert', 'Recommendation', 'Update', 'GENERAL',
      'CHECKOUT_ABANDONED', 'COMPARE_ABANDONED', 'PORTFOLIO_ALERT', 'INSURANCE_RECOMMENDATION',
      'HIGH_RISK_WARNING', 'DIVERSIFICATION_ALERT', 'ASSISTANT_RECOVERY', 'INVESTMENT_COMPLETED',
      'CHECKOUT_COMPLETED'
    ],
    default: 'Update'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionLabel: {
    type: String
  },
  actionLink: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
