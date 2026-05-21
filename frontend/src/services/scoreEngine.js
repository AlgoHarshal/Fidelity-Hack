/**
 * Score Engine — Pure JS (no React)
 * Portable to backend: backend/services/scoreService.js
 */

export const SCORE_RULES = {
  VISITED_PLANS: 10,
  CLICKED_COMPARE: 20,
  STAYED_3_MINS: 25,
  SIGNUP_STARTED: 30,
  SIGNUP_CLOSED: -20,
  REPEATED_EXITS: -25,
  INVEST_CLICKED: 15,
  FORM_COMPLETED: 20,
  FORM_ABANDONED: -10,
}

export const getScoreLabel = (score) => {
  if (score >= 80) return { label: "High Intent", color: "green", emoji: "🔥", tailwind: "text-green-400" }
  if (score >= 50) return { label: "Hesitant", color: "yellow", emoji: "🟡", tailwind: "text-yellow-400" }
  if (score >= 20) return { label: "Exploring", color: "blue", emoji: "🔍", tailwind: "text-blue-400" }
  return { label: "Cold Lead", color: "gray", emoji: "❄️", tailwind: "text-gray-400" }
}

export const getConversionProbability = (score) => {
  if (score >= 90) return 92
  if (score >= 70) return 75
  if (score >= 50) return 55
  if (score >= 30) return 35
  if (score >= 10) return 18
  return 5
}

export const getDropoffRisk = (score, exitCount, formAbandoned) => {
  let risk = 100 - getConversionProbability(score)
  if (exitCount >= 3) risk = Math.min(100, risk + 20)
  if (formAbandoned) risk = Math.min(100, risk + 15)
  return Math.round(risk)
}
