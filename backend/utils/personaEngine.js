/**
 * personaEngine.js
 *
 * Pure function — takes user signals and returns a persona label + tooltip.
 * No DB calls; caller passes pre-fetched data.
 *
 * @param {object} signals
 * @param {Array}  signals.events       - behavioral events for this user
 * @param {Array}  signals.investments  - purchased investments
 * @param {object} signals.user         - user document (riskAppetite, investmentGoal)
 * @returns {{ persona: string, tooltip: string, score: number, dropoffRisk: number, conversionProbability: number }}
 */
const inferPersona = ({ events = [], investments = [], user = {} }) => {
  // ── Signal extraction ────────────────────────────────────────────────────
  const compareClicks       = events.filter(e => e.action === 'Compare Clicked').length;
  const checkoutStarted     = events.filter(e => e.action === 'Checkout Started').length;
  const checkoutCompleted   = events.filter(e => e.action === 'Checkout Completed').length;
  const pageVisits          = events.filter(e => e.action === 'Page Visit').length;
  const assistantOpened     = events.filter(e => e.action === 'Assistant Auto-Opened').length;
  const investmentCount     = investments.length;
  const abandonedCheckouts  = Math.max(0, checkoutStarted - checkoutCompleted);

  const planNames = investments.map(i => (i.planName || '').toLowerCase());
  const categories = investments.map(i => (i.category || '').toLowerCase());

  const hasSIP        = planNames.some(p => p.includes('sip')) || categories.includes('sip');
  const hasMutualFund = categories.includes('mutual funds') || planNames.some(p => p.includes('equity') || p.includes('fund'));
  const hasInsurance  = categories.includes('insurance') || planNames.some(p => p.includes('life') || p.includes('shield') || p.includes('protect'));
  const hasRetirement = categories.includes('retirement') || planNames.some(p => p.includes('retire') || p.includes('pension'));

  const riskAppetite  = (user.riskAppetite || '').toLowerCase();
  const goal          = (user.investmentGoal || '').toLowerCase();

  // ── Behavior Score (0–100) ───────────────────────────────────────────────
  let behaviorScore = 0;
  behaviorScore += Math.min(30, compareClicks * 5);       // up to 30 pts
  behaviorScore += Math.min(20, investmentCount * 10);    // up to 20 pts
  behaviorScore += Math.min(15, checkoutCompleted * 10);  // up to 15 pts
  behaviorScore += Math.min(10, pageVisits * 1);          // up to 10 pts
  behaviorScore += Math.min(10, assistantOpened * 3);     // up to 10 pts
  behaviorScore -= abandonedCheckouts * 5;                // penalty
  behaviorScore = Math.max(0, Math.min(100, Math.round(behaviorScore)));

  // ── Drop-off Risk (0–100, lower is better) ───────────────────────────────
  let dropoffRisk = 50;
  if (investmentCount > 0)     dropoffRisk -= 30;
  if (abandonedCheckouts >= 2) dropoffRisk += 25;
  if (compareClicks >= 5 && investmentCount === 0) dropoffRisk += 20;
  if (riskAppetite.includes('conservative')) dropoffRisk += 10;
  if (checkoutCompleted > 0)   dropoffRisk -= 20;
  dropoffRisk = Math.max(0, Math.min(100, Math.round(dropoffRisk)));

  // ── Conversion Probability (0–100) ───────────────────────────────────────
  let conversionProb = 30;
  if (investmentCount > 0)      conversionProb += 40;
  if (checkoutStarted > 0)      conversionProb += 15;
  if (compareClicks >= 3)       conversionProb += 10;
  if (abandonedCheckouts >= 2)  conversionProb -= 20;
  if (riskAppetite.includes('aggressive')) conversionProb += 10;
  conversionProb = Math.max(0, Math.min(100, Math.round(conversionProb)));

  // ── Persona Rules (priority order) ──────────────────────────────────────
  let persona = '';
  let tooltip = '';

  // Rule 1: Active investor with multiple purchases
  if (investmentCount >= 3 && behaviorScore >= 60) {
    persona = 'High Intent Investor';
    tooltip = `Completed ${investmentCount} investments with a high behavior score of ${behaviorScore}.`;
  }
  // Rule 2: Retirement-focused
  else if (hasRetirement && (investmentCount === 1 ? true : categories.filter(c => c === 'retirement').length > investmentCount / 2)) {
    persona = 'Retirement Planner';
    tooltip = `Primarily holds retirement-focused products.${goal.includes('retire') ? ' Goal aligns with retirement planning.' : ''}`;
  }
  // Rule 3: Insurance-dominant
  else if (hasInsurance && !hasSIP && !hasMutualFund && !hasRetirement) {
    persona = 'Insurance Focused';
    tooltip = `Portfolio is primarily composed of insurance and protection products.`;
  }
  // Rule 4: Aggressive / high-risk (mutual funds + equity heavy)
  else if (hasMutualFund && !hasInsurance && !hasRetirement && (riskAppetite.includes('aggressive') || investmentCount >= 2)) {
    persona = 'Aggressive Growth Investor';
    tooltip = `High-risk equity and mutual fund focus${riskAppetite.includes('aggressive') ? ' with aggressive risk appetite.' : '.'}`;
  }
  // Rule 5: SIP passive investor
  else if (hasSIP && !hasMutualFund && investmentCount >= 1) {
    persona = 'Passive Wealth Builder';
    tooltip = `Prefers systematic SIP investments for disciplined long-term wealth creation.`;
  }
  // Rule 6: Diversified (has multiple categories)
  else if (investmentCount >= 2 && new Set(categories).size >= 2) {
    persona = 'Diversified Investor';
    tooltip = `Holds investments across ${new Set(categories).size} different asset categories.`;
  }
  // Rule 7: Has one investment but conservative
  else if (investmentCount === 1 && riskAppetite.includes('conservative')) {
    persona = 'Cautious Investor';
    tooltip = `Made a single conservative investment. Prefers low-risk, stable products.`;
  }
  // Rule 8: Hesitant — many compares, no purchase, checkout abandoned
  else if (compareClicks >= 3 && investmentCount === 0 && abandonedCheckouts >= 1) {
    persona = 'Hesitant Investor';
    tooltip = `Compared ${compareClicks} products and started checkout ${checkoutStarted} times but did not complete any investment.`;
  }
  // Rule 9: Researcher — many compares but no action
  else if (compareClicks >= 2 && investmentCount === 0) {
    persona = 'Researcher';
    tooltip = `Actively comparing ${compareClicks} products but has not invested yet.`;
  }
  // Rule 10: Active but no investment
  else if (pageVisits >= 5 && investmentCount === 0) {
    persona = 'Explorer';
    tooltip = `Browsing actively (${pageVisits} page visits) but has not started investing.`;
  }
  // Rule 11: Has one investment, mixed signals
  else if (investmentCount >= 1) {
    persona = 'Beginner Investor';
    tooltip = `Getting started with ${investmentCount} investment. Early-stage investor.`;
  }
  // Rule 12: Fallback — new / no signals
  else {
    persona = 'New Investor';
    tooltip = 'No behavioral signals yet. User has recently joined the platform.';
  }

  return { persona, tooltip, score: behaviorScore, dropoffRisk, conversionProbability: conversionProb };
};

module.exports = { inferPersona };
