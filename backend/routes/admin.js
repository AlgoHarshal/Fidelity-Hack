const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Score = require('../models/Score');
const EmailLog = require('../models/EmailLog');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');
const { analyzeBehavior } = require('../utils/analyticsEngine');
const { isInternalUser, INTERNAL_SYSTEM_EMAILS } = require('../utils/internalAccounts');

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const query = { role: { $ne: 'admin' } };
    if (req.query.includeInternal !== 'true') {
      query.email = { $nin: INTERNAL_SYSTEM_EMAILS };
    }
    const users         = await User.find(query).select('-password').lean();
    
    // We still want to see investments/events/notifs for internal users IF they are included in the user list.
    const invQuery = req.query.includeInternal === 'true' ? {} : { userId: { $nin: INTERNAL_SYSTEM_EMAILS } };
    const allInvestments = await Investment.find(invQuery).lean();
    const allEvents     = await Event.find(invQuery).lean();
    const allNotifs     = await Notification.find(invQuery).lean();

    const enriched = users.map(u => {
      const inv    = allInvestments.filter(i => i.userId === u.email);
      const events = allEvents.filter(e => e.userId === u.email);
      const notifs = allNotifs.filter(n => n.userId === u.email);
      const totalValue = inv.reduce((sum, i) => sum + (i.amount || 0), 0);

      // Dynamic persona from real behavioral data — never undefined
      const inferred = analyzeBehavior({ events, investments: inv, user: u });

      return {
        ...u,
        persona:               inferred.persona,
        personaTooltip:        inferred.personaTooltip,
        score:                 inferred.score,
        scoreReasons:          inferred.scoreReasons,
        dropoffRisk:           inferred.dropoffRisk,
        riskReasons:           inferred.riskReasons,
        conversionProbability: inferred.conversionProbability,
        convReasons:           inferred.convReasons,
        engagementLevel:       inferred.engagementLevel,
        trend:                 inferred.trend,
        totalInvestments:      inv.length,
        portfolioValue:        totalValue,
        notificationsSent:     notifs.length,
        lastActive:            u.updatedAt || u.createdAt
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET /admin/users/:userId ─────────────────────────────────────────────────
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (isInternalUser(userId)) {
      return res.status(403).json({ error: 'Cannot view internal account records.' });
    }

    const user        = await User.findOne({ email: userId }).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const events      = await Event.find({ userId }).sort({ timestamp: -1 }).limit(100).lean();
    const investments = await Investment.find({ userId }).lean();
    const notifications = await Notification.find({ userId }).sort({ timestamp: -1 }).lean();
    const emailLogs   = await EmailLog.find({ userId }).sort({ timestamp: -1 }).lean();

    const totalValue  = investments.reduce((sum, i) => sum + (i.amount || 0), 0);

    // Dynamic persona — always accurate, never undefined
    const inferred = analyzeBehavior({ events, investments, user });

    // Most viewed products from events
    const viewCounts = {};
    events.filter(e => e.plan).forEach(e => {
      viewCounts[e.plan] = (viewCounts[e.plan] || 0) + 1;
    });
    const mostViewed = Object.entries(viewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([plan, count]) => ({ plan, count }));

    const compareCount  = events.filter(e => e.action === 'Compare Clicked').length;
    const abandonCount  = Math.max(0,
      events.filter(e => e.action === 'Checkout Started').length -
      events.filter(e => e.action === 'Checkout Completed').length
    );

    res.json({
      user,
      // Serve inferred analytics as top-level score object for backward compat
      score: inferred,
      events,
      investments,
      notifications,
      emailLogs,
      analytics: { totalValue, mostViewed, compareCount, abandonCount }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET /admin/analytics ─────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers   = await User.countDocuments({ role: { $ne: 'admin' }, email: { $nin: INTERNAL_SYSTEM_EMAILS } });
    const totalEvents  = await Event.countDocuments({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } });
    const nudgesSent   = await EmailLog.countDocuments({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }) + await Notification.countDocuments({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } });

    // Correct conversion rate: unique users who made at least one investment
    const allInvestments = await Investment.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).select('userId').lean();
    const uniqueInvestedUserIds = new Set(allInvestments.map(i => i.userId));
    const convertedUsers = uniqueInvestedUserIds.size;
    // Clamp to [0, 100] — never exceed 100%
    const conversionRate = totalUsers > 0
      ? Math.min(100, parseFloat(((convertedUsers / totalUsers) * 100).toFixed(1)))
      : 0;

    const recentInvestments = await Investment.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).sort({ timestamp: -1 }).limit(15).lean();
    const users  = await User.find({ role: { $ne: 'admin' }, email: { $nin: INTERNAL_SYSTEM_EMAILS } }).select('-password').lean();

    // Fetch all events + investments once for efficiency
    const allEvents   = await Event.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).lean();
    const allInvFull  = await Investment.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).lean();
    const allNotifs   = await Notification.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).lean();

    // ── Use analyzeBehavior — same engine as /admin/users ──────────────────
    // This guarantees Dashboard and Records always show IDENTICAL analytics.
    const enrichedUsers = users.map(u => {
      const inv    = allInvFull.filter(i => i.userId === u.email);
      const events = allEvents.filter(e => e.userId === u.email);
      const notifs = allNotifs.filter(n => n.userId === u.email);
      const inferred = analyzeBehavior({ events, investments: inv, user: u });

      return {
        ...u,
        persona:               inferred.persona,
        personaTooltip:        inferred.personaTooltip,
        score:                 inferred.score,
        scoreReasons:          inferred.scoreReasons,
        dropoffRisk:           inferred.dropoffRisk,
        riskReasons:           inferred.riskReasons,
        conversionProbability: inferred.conversionProbability,
        convReasons:           inferred.convReasons,
        engagementLevel:       inferred.engagementLevel,
        trend:                 inferred.trend,
        totalInvestments:      inv.length,
        portfolioValue:        inv.reduce((s, i) => s + (i.amount || 0), 0),
        notificationsSent:     notifs.length,
      };
    });

    res.json({
      totalUsers,
      totalEvents,
      nudgesSent,
      totalInvestments: allInvestments.length,
      convertedUsers,
      conversionRate,   // CORRECT: unique invested users / total users, ≤ 100%
      recentInvestments,
      users: enrichedUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET /admin/events ────────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).sort({ timestamp: -1 }).limit(200).lean();
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET /admin/notifications ─────────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).sort({ timestamp: -1 }).limit(200).lean();
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── GET /admin/market-insights ───────────────────────────────────────────────
router.get('/market-insights', async (req, res) => {
  try {
    const events      = await Event.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).lean();
    const investments = await Investment.find({ userId: { $nin: INTERNAL_SYSTEM_EMAILS } }).lean();
    const users       = await User.countDocuments({ role: { $ne: 'admin' }, email: { $nin: INTERNAL_SYSTEM_EMAILS } });

    // Most compared products
    const compareCounts = {};
    events.filter(e => e.action === 'Compare Clicked' && e.plan).forEach(e => {
      compareCounts[e.plan] = (compareCounts[e.plan] || 0) + 1;
    });
    const mostCompared = Object.entries(compareCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([plan, count]) => ({ plan, count }));

    // Most viewed products
    const viewCounts = {};
    events.filter(e => e.action === 'Product Viewed' && e.plan).forEach(e => {
      viewCounts[e.plan] = (viewCounts[e.plan] || 0) + 1;
    });
    const mostViewed = Object.entries(viewCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([plan, count]) => ({ plan, count }));

    // Investment category distribution
    const catCounts = {};
    investments.forEach(i => {
      const cat = i.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catCounts)
      .map(([category, count]) => ({ category, count }));

    // Insurance gap
    const usersWithInsurance = new Set(
      investments
        .filter(i => i.planName?.toLowerCase().includes('shield') || i.planName?.toLowerCase().includes('life') || i.category === 'Insurance')
        .map(i => i.userId)
    ).size;
    const insuranceGapPct = users > 0
      ? (((users - usersWithInsurance) / users) * 100).toFixed(0) : 0;

    // Conversion rate
    const convertedUsers = new Set(investments.map(i => i.userId)).size;
    const conversionRate = users > 0 ? ((convertedUsers / users) * 100).toFixed(1) : 0;

    res.json({ mostCompared, mostViewed, categoryDistribution, insuranceGapPct, conversionRate, totalInvestments: investments.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
