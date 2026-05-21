/**
 * Persona Engine — Pure JS (no React)
 * Portable to backend: backend/services/personaService.js
 * 5 persona types matching blueprint exactly.
 */

export const PERSONAS = {
  CONFUSED_BEGINNER: {
    id: "confused_beginner",
    label: "Confused Beginner",
    description: "New investor exploring basic plans with little direction",
    icon: "🌱",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  SERIOUS_INVESTOR: {
    id: "serious_investor",
    label: "Serious Investor",
    description: "High-intent investor actively comparing and ready to invest",
    icon: "💼",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  WINDOW_SHOPPER: {
    id: "window_shopper",
    label: "Window Shopper",
    description: "Browses frequently but takes no invest action",
    icon: "🛒",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  RESEARCHER: {
    id: "researcher",
    label: "Researcher",
    description: "Spends significant time reading — low on action",
    icon: "🔬",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  DROPOFF_RISK: {
    id: "dropoff_risk",
    label: "Drop-off Risk",
    description: "Shows signs of hesitation and repeated exit patterns",
    icon: "⚠️",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

/**
 * Detect persona from event history + derived metrics.
 * Rules match blueprint specification exactly.
 */
export const detectPersona = (events, score, totalTimeSpent, exitCount) => {
  const compareClicks = events.filter((e) => e.action === "Compare Clicked").length
  const investClicks  = events.filter((e) => e.action === "Invest Clicked").length
  const sipEvents     = events.filter((e) => e.plan === "SIP Investment").length
  const pageVisits    = events.filter((e) => e.action === "Page Visit").length
  const formStarted   = events.some((e) => e.action === "Form Started")
  const formAbandoned = events.some((e) => e.action === "Form Abandoned")

  // Drop-off Risk: repeated exits OR form abandonment with exits
  if (exitCount >= 3 || (formStarted && formAbandoned && exitCount >= 2)) {
    return PERSONAS.DROPOFF_RISK
  }

  // Serious Investor: compare + invest click + decent score
  if (compareClicks >= 2 && investClicks >= 1 && score >= 40) {
    return PERSONAS.SERIOUS_INVESTOR
  }

  // Researcher: high time + many visits + no invest clicks (blueprint: High time + low action)
  if (totalTimeSpent > 180 && pageVisits >= 3 && investClicks === 0) {
    return PERSONAS.RESEARCHER
  }

  // Window Shopper: many page visits, compares but never invests
  if (pageVisits >= 4 && investClicks === 0 && compareClicks >= 1) {
    return PERSONAS.WINDOW_SHOPPER
  }

  // Confused Beginner: SIP focus, low score, no invest action (blueprint: SIP only → Beginner)
  if (sipEvents >= 1 && score < 40 && investClicks === 0) {
    return PERSONAS.CONFUSED_BEGINNER
  }

  return PERSONAS.CONFUSED_BEGINNER
}
