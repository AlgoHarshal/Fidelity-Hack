/**
 * Nudge Engine — Rule-based, Pure JS (no React)
 * Portable to backend: backend/services/nudgeService.js
 *
 * MODULAR DESIGN: Replace generateNudge() with an LLM call (Gemini/OpenAI)
 * later without changing any other logic.
 */

export const NUDGE_TYPES = {
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  NOTIFICATION: "notification",
}

const NUDGE_TEMPLATES = {
  confused_beginner: [
    {
      type: NUDGE_TYPES.WHATSAPP,
      subject: "Start Small, Dream Big",
      message: "Need help understanding SIPs? Start with just ₹500/month. It's simpler than you think! 🌱",
      cta: "Start Your SIP Journey",
    },
    {
      type: NUDGE_TYPES.EMAIL,
      subject: "Your First Investment Made Simple",
      message:
        "We noticed you're exploring investment options. Our SIP plans start at ₹500/month with zero hidden charges. Let us guide you step by step.",
      cta: "Explore SIP Plans",
    },
  ],
  serious_investor: [
    {
      type: NUDGE_TYPES.NOTIFICATION,
      subject: "Lock Today's NAV Rate",
      message: "You've compared 3 plans! Lock in today's NAV rate before it changes. 💼",
      cta: "Invest Now",
    },
    {
      type: NUDGE_TYPES.EMAIL,
      subject: "Your Portfolio Is Just One Click Away",
      message:
        "You've done the research. Time to act. Lock today's benefits and start your investment journey with IntentEdge.",
      cta: "Complete Your Investment",
    },
  ],
  window_shopper: [
    {
      type: NUDGE_TYPES.WHATSAPP,
      subject: "Still Comparing?",
      message:
        "Still comparing? The best time to invest was yesterday, the second best is today. 🛒",
      cta: "View Top Picks",
    },
    {
      type: NUDGE_TYPES.EMAIL,
      subject: "Here's What Other Investors Chose",
      message:
        "Our top investors picked Mutual Funds and SIPs. Based on your browsing, we've curated a plan just for you.",
      cta: "See Recommendations",
    },
  ],
  researcher: [
    {
      type: NUDGE_TYPES.EMAIL,
      subject: "You've Done The Research. Here's The Summary.",
      message:
        "We've analyzed your browsing pattern and prepared a personalized investment report based on your interests.",
      cta: "View Your Report",
    },
    {
      type: NUDGE_TYPES.WHATSAPP,
      subject: "Talk to an Advisor",
      message:
        "You've spent quality time researching. Our advisor can answer remaining questions in just 10 minutes. 🔬",
      cta: "Talk to an Advisor",
    },
  ],
  dropoff_risk: [
    {
      type: NUDGE_TYPES.NOTIFICATION,
      subject: "Don't Let Hesitation Cost You Returns",
      message: "Don't let hesitation cost you returns. Your portfolio can start TODAY. ⚡",
      cta: "Resume Where You Left Off",
    },
    {
      type: NUDGE_TYPES.WHATSAPP,
      subject: "Your Plan Is Still Available",
      message: "We noticed you left before completing signup. Your chosen plan is still available! ⚠️",
      cta: "Complete Registration",
    },
    {
      type: NUDGE_TYPES.EMAIL,
      subject: "We Saved Your Progress!",
      message:
        "You were so close to starting your investment journey. We've saved your plan selection. Complete your registration before the offer expires.",
      cta: "Complete Signup",
    },
  ],
}

/** Returns all nudge templates for a given persona ID */
export const generateNudge = (personaId) => {
  return NUDGE_TEMPLATES[personaId] ?? NUDGE_TEMPLATES.confused_beginner
}

/** Build a structured email log entry */
export const generateEmailLog = (user, persona, nudge, triggerReasons) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  user: user?.name || "Anonymous",
  email: user?.email || "unknown@email.com",
  persona: persona?.label || "Unknown",
  message: nudge.message,
  subject: nudge.subject || "Personalized Investment Update",
  triggerReason: triggerReasons[0] || "Behavioral pattern detected",
  nudgeType: nudge.type,
  timestamp: new Date().toLocaleString(),
  status: "Sent",
})
