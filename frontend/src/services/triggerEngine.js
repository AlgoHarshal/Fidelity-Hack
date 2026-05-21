/**
 * Trigger Engine — Pure JS (no React)
 * Portable to backend: backend/services/triggerService.js
 * Generates human-readable WHY explanations for every nudge.
 */

/**
 * Returns an array of plain-English reasons that explain
 * why a nudge was triggered for this investor.
 */
export const generateTriggerReasons = (events, score, totalTimeSpent, exitCount) => {
  const reasons = []

  const compareClicks = events.filter((e) => e.action === "Compare Clicked").length
  const investClicks  = events.filter((e) => e.action === "Invest Clicked").length
  const pageVisits    = events.filter((e) => e.action === "Page Visit").length
  const formStarted   = events.some((e) => e.action === "Form Started")
  const formAbandoned = events.some((e) => e.action === "Form Abandoned")
  const minsSpent     = Math.round(totalTimeSpent / 60)

  if (pageVisits >= 2) {
    reasons.push(`Visited ${pageVisits} investment pages — showing active browsing interest`)
  }
  if (compareClicks >= 1) {
    reasons.push(`Clicked Compare ${compareClicks} time(s) — actively evaluating plan options`)
  }
  if (totalTimeSpent > 180) {
    reasons.push(`Spent ${minsSpent} minute(s) researching — indicates deep engagement`)
  } else if (totalTimeSpent > 60) {
    reasons.push(`Spent ${totalTimeSpent}s browsing — moderate engagement detected`)
  }
  if (formStarted && !formAbandoned) {
    reasons.push("Started signup process — high conversion intent signal")
  }
  if (formStarted && formAbandoned) {
    reasons.push("Started signup but exited — hesitation signal detected")
  }
  if (exitCount >= 3) {
    reasons.push(`Exited ${exitCount} times without converting — drop-off risk elevated`)
  }
  if (investClicks >= 1) {
    reasons.push(`Clicked "Invest Now" ${investClicks} time(s) — purchase intent confirmed`)
  }
  if (score >= 70) {
    reasons.push(`Behavior score ${score}/100 — classified as high-intent investor`)
  } else if (score >= 40) {
    reasons.push(`Behavior score ${score}/100 — mid-funnel investor showing promise`)
  }

  if (reasons.length === 0) {
    reasons.push("New session detected — initial engagement nudge triggered automatically")
  }

  return reasons
}
