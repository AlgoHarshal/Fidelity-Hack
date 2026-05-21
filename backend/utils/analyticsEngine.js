/**
 * analyticsEngine.js
 *
 * Centralized behavioral analytics engine for IntentEdge.
 * Single source of truth for Behavior Score, Persona, Drop-off Risk,
 * Conversion Probability, and Engagement Level.
 *
 * All metrics are capped at 0–100. No unbounded accumulation.
 */

const analyzeBehavior = ({ events = [], investments = [], user = {} }) => {
  // ── Signal extraction ─────────────────────────────────────────────────────
  const compareClicks     = events.filter(e => e.action === 'Compare Clicked').length;
  const checkoutStarted   = events.filter(e => e.action === 'Checkout Started').length;
  const checkoutCompleted = events.filter(e => e.action === 'Checkout Completed').length;
  const checkoutAbandoned = events.filter(e => e.action === 'Checkout Abandoned').length;
  const compareAbandoned  = events.filter(e => e.action === 'Compare Abandoned' || e.action === 'COMPARE_ABANDONED').length;
  const investCompleted   = events.filter(e => e.action === 'Investment Completed').length;
  const assistantOpened   = events.filter(e => e.action === 'Assistant Auto-Opened').length;
  const portfolioViewed   = events.filter(e => e.action === 'Portfolio Viewed' || e.action === 'Page Visit').length;
  const investmentCount   = investments.length;

  const planNames    = investments.map(i => (i.planName || '').toLowerCase());
  const categories   = investments.map(i => (i.category || '').toLowerCase());
  const uniqueCats   = new Set(categories).size;

  const hasSIP        = categories.includes('sip') || planNames.some(p => p.includes('sip'));
  const hasMutualFund = categories.includes('mutual funds') || planNames.some(p => p.includes('equity') || p.includes('fund'));
  const hasInsurance  = categories.includes('insurance') || planNames.some(p => p.includes('life') || p.includes('shield') || p.includes('protect'));
  const hasRetirement = categories.includes('retirement') || planNames.some(p => p.includes('retire') || p.includes('pension'));

  const riskAppetite = (user.riskAppetite || '').toLowerCase();

  // Returning user: events spanning > 24 hours
  let isReturning = false;
  if (events.length > 1) {
    const oldest = new Date(events[events.length - 1].timestamp).getTime();
    const newest = new Date(events[0].timestamp).getTime();
    if (!isNaN(oldest) && !isNaN(newest) && newest - oldest > 86400000) isReturning = true;
  }

  // ── Behavior Score (0–100, weighted) ─────────────────────────────────────
  let score = 0;
  const scoreReasons = [];

  // Positive signals
  const investPts = Math.min(50, investCompleted * 25);
  if (investCompleted > 0) { score += investPts; scoreReasons.push(`+ ${investCompleted} investment(s) completed (+${investPts})`); }

  const checkoutPts = Math.min(15, checkoutCompleted * 15);
  if (checkoutCompleted > 0) { score += checkoutPts; scoreReasons.push(`+ ${checkoutCompleted} checkout(s) completed (+${checkoutPts})`); }

  const comparePts = compareClicks >= 2 ? Math.min(12, compareClicks * 3) : Math.min(10, compareClicks * 3);
  if (compareClicks > 0) { score += comparePts; scoreReasons.push(`+ ${compareClicks} product comparison(s) (+${comparePts})`); }

  const checkoutStartPts = Math.min(15, checkoutStarted * 15);
  if (checkoutStarted > 0 && checkoutCompleted === 0) { score += checkoutStartPts; scoreReasons.push(`+ Checkout intent detected (+${checkoutStartPts})`); }

  if (assistantOpened > 0) { score += Math.min(5, assistantOpened * 2); scoreReasons.push(`+ Assistant engagement (+${Math.min(5, assistantOpened * 2)})`); }
  if (portfolioViewed > 0) { score += Math.min(8, Math.floor(portfolioViewed / 2)); scoreReasons.push(`+ Portfolio activity (+${Math.min(8, Math.floor(portfolioViewed / 2))})`); }
  if (isReturning)         { score += 5; scoreReasons.push(`+ Returning session (+5)`); }

  // Negative signals
  if (checkoutAbandoned > 0) { score -= checkoutAbandoned * 15; scoreReasons.push(`- ${checkoutAbandoned} checkout abandonment(s) (-${checkoutAbandoned * 15})`); }
  if (compareAbandoned > 0)  { score -= compareAbandoned * 10;  scoreReasons.push(`- ${compareAbandoned} compare abandonment(s) (-${compareAbandoned * 10})`); }
  if (compareClicks >= 4 && investmentCount === 0) { score -= 10; scoreReasons.push(`- Repeated comparisons without committing (-10)`); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (scoreReasons.length === 0) scoreReasons.push('No significant behavioral signals yet.');

  // ── Drop-off Risk (0–100%) ────────────────────────────────────────────────
  let risk = 30; // Moderate base for unknown users
  const riskReasons = [];

  if (checkoutAbandoned > 0) { risk += checkoutAbandoned * 35; riskReasons.push(`+ ${checkoutAbandoned} abandoned checkout(s) (+${checkoutAbandoned * 35})`); }
  if (compareAbandoned > 0)  { risk += compareAbandoned * 20;  riskReasons.push(`+ ${compareAbandoned} compare abandonment(s) (+${compareAbandoned * 20})`); }
  if (compareClicks >= 4 && investmentCount === 0) { risk += 10; riskReasons.push(`+ Repeated viewing without purchase (+10)`); }

  if (investmentCount > 0)   { risk -= 25; riskReasons.push(`- ${investmentCount} investment(s) completed (-25)`); }
  if (uniqueCats > 1)        { risk -= 15; riskReasons.push(`- Diversified portfolio (-15)`); }
  if (checkoutCompleted > 0) { risk -= 10; riskReasons.push(`- Completed checkout funnel (-10)`); }
  if (isReturning && investmentCount > 0) { risk -= 10; riskReasons.push(`- Stable returning investor (-10)`); }

  risk = Math.max(0, Math.min(100, Math.round(risk)));
  if (riskReasons.length === 0) riskReasons.push('Behavior currently stable.');

  // ── Conversion Probability (0–100%) ──────────────────────────────────────
  // Formula: (score * 0.6) + (investmentCount * 8) - (risk * 0.5)
  let conversionProbability = Math.round((score * 0.6) + (investmentCount * 8) - (risk * 0.5));
  const convReasons = [];

  if (score > 0)           convReasons.push(`Behavior score ${score} drives base probability`);
  if (investmentCount > 0) convReasons.push(`${investmentCount} completed investment(s) boosts confidence`);
  if (risk > 40)           convReasons.push(`Drop-off risk of ${risk}% reduces probability`);
  if (checkoutAbandoned > 0) convReasons.push(`Abandoned checkout lowers conversion signal`);

  conversionProbability = Math.max(0, Math.min(100, conversionProbability));
  if (convReasons.length === 0) convReasons.push('Insufficient behavioral data for projection.');

  // ── Engagement Level (derived from score + investments) ──────────────────
  let engagementLevel = 'New Lead';
  if      (investmentCount >= 3 || score >= 80) engagementLevel = 'Power Investor';
  else if (investmentCount >= 1 && score >= 55) engagementLevel = 'High Intent';
  else if (investmentCount >= 1)               engagementLevel = 'Investor';
  else if (checkoutStarted > 0 || compareClicks >= 2) engagementLevel = 'Interested';
  else if (portfolioViewed > 2)                engagementLevel = 'Exploring';

  // ── Trend (based on 3 most recent actions) ────────────────────────────────
  let trend = 'stable';
  const recentActions = events.slice(0, 3).map(e => e.action);
  if (recentActions.includes('Investment Completed') || recentActions.includes('Checkout Completed')) {
    trend = 'improving';
  } else if (recentActions.includes('Checkout Abandoned') || recentActions.includes('Compare Abandoned')) {
    trend = 'declining';
  }

  // ── Persona Classification (deterministic, never "Unknown") ──────────────
  let persona = 'New Investor';
  let personaTooltip = 'Just joined — no significant activity yet.';

  if (score >= 70 && investmentCount >= 2) {
    persona        = 'High Intent Investor';
    personaTooltip = `Score ${score} with ${investmentCount} investments — highly engaged.`;
  } else if (hasRetirement && investmentCount >= 1) {
    persona        = 'Retirement Planner';
    personaTooltip = `Holds retirement-focused products.`;
  } else if (hasInsurance && !hasSIP && !hasMutualFund) {
    persona        = 'Insurance Focused';
    personaTooltip = `Portfolio primarily composed of insurance and protection products.`;
  } else if (hasMutualFund && (riskAppetite.includes('aggressive') || investmentCount >= 2)) {
    persona        = 'Aggressive Growth Investor';
    personaTooltip = `High-risk equity and mutual fund focus.`;
  } else if (hasSIP && investmentCount >= 1) {
    persona        = 'Passive Wealth Builder';
    personaTooltip = `Systematic SIP investments — disciplined long-term wealth creation.`;
  } else if (uniqueCats >= 2 && investmentCount >= 2) {
    persona        = 'Diversified Investor';
    personaTooltip = `Holds investments across ${uniqueCats} categories.`;
  } else if (investmentCount >= 1 && riskAppetite.includes('conservative')) {
    persona        = 'Cautious Investor';
    personaTooltip = `Conservative single investment — low risk preference.`;
  } else if (checkoutAbandoned >= 1 && investmentCount === 0) {
    persona        = 'Hesitant Investor';
    personaTooltip = `Showed purchase intent but abandoned checkout without completing.`;
  } else if (compareClicks >= 2 && investmentCount === 0) {
    persona        = 'Researcher';
    personaTooltip = `Actively comparing products but hasn't committed yet.`;
  } else if (investmentCount === 1) {
    persona        = 'Beginner Investor';
    personaTooltip = `First investment complete — early-stage investor.`;
  } else if (portfolioViewed >= 3 && investmentCount === 0) {
    persona        = 'Explorer';
    personaTooltip = `Browsing the platform actively but hasn't invested yet.`;
  }
  // Default fallback — never 'Unknown'
  // persona remains 'New Investor' if nothing else matched

  return {
    persona,
    personaTooltip,
    score,
    scoreReasons,
    dropoffRisk:           risk,
    riskReasons,
    conversionProbability,
    convReasons,
    engagementLevel,
    trend
  };
};

module.exports = { analyzeBehavior };
