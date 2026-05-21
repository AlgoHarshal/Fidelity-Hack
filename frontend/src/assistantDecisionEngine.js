/**
 * assistantDecisionEngine.js
 *
 * Evaluates SYNCHRONOUS / portfolio-based rules only.
 * Timer-based rules (compare abandonment, checkout abandonment)
 * are managed with useRef timers inside NotificationContext to survive re-renders.
 */

export const evaluatePortfolioRules = (user, investments, history) => {
  const notifications = [];
  if (!user || !investments || investments.length === 0) return notifications;

  const hasInsurance = investments.some(
    i => i.planName?.toLowerCase().includes('life') ||
         i.planName?.toLowerCase().includes('shield') ||
         i.planName?.toLowerCase().includes('protect') ||
         i.category === 'Insurance'
  );

  // Rule 4: No Insurance Coverage
  if (!hasInsurance) {
    if (!history.some(n => n.type === 'Alert' && n.title.includes('Protection'))) {
      console.log('[DecisionEngine] Rule 4 triggered: Missing insurance coverage');
      notifications.push({
        type: 'Alert',
        title: 'Missing Protection',
        message: 'Protecting wealth is as important as growing it. Explore insurance plans.',
        actionLabel: 'Compare Plans',
        actionLink: '/compare',
        triggerEmail: true,
        emailTemplate: 'insuranceRecommendation',
        emailData: {}
      });
    }
  }

  // Rule 5: High Risk Portfolio (all plans are equity/mutual funds)
  const highRiskInvestments = investments.filter(
    i => i.planName?.toLowerCase().includes('equity') || i.category === 'Mutual Funds'
  );
  if (highRiskInvestments.length === investments.length && investments.length >= 2) {
    if (!history.some(n => n.type === 'Warning' && n.title.includes('Risk'))) {
      console.log('[DecisionEngine] Rule 5 triggered: High-risk portfolio concentration');
      notifications.push({
        type: 'Warning',
        title: 'High Risk Exposure',
        message: 'Your portfolio is heavily growth-focused. Consider balancing risk.',
        actionLabel: 'View Portfolio',
        actionLink: '/portfolio',
        triggerEmail: true,
        emailTemplate: 'highRiskWarning',
        emailData: {}
      });
    }
  }

  return notifications;
};
