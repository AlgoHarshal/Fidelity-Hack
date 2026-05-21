import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { detectPersona } from "../services/personaEngine"
import { generateTriggerReasons } from "../services/triggerEngine"
import { generateNudge, generateEmailLog } from "../services/nudgeEngine"
import { useAuth } from "./AuthContext"
import {
  getConversionProbability,
  getDropoffRisk,
  getScoreLabel,
  SCORE_RULES,
} from "../services/scoreEngine"

const TrackingContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const TrackingProvider = ({ children }) => {
  const { user } = useAuth()
  const userId = user?.email || "anonymous_session"
  // ── Core state ────────────────────────────────────────────────
  const [events, setEvents] = useState([])
  const [score, setScore] = useState(0)
  const [hesitation, setHesitation] = useState(false)
  const [exitCount, setExitCount] = useState(0)

  // Persist session time across reloads
  const [totalTimeSpent, setTotalTimeSpent] = useState(() => {
    const saved = localStorage.getItem('intentedge_session_time')
    return saved ? parseInt(saved, 10) : 0
  })

  const [nudgeLogs, setNudgeLogs] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }, [])

  // ── Global Session Timer ──────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setTotalTimeSpent(0)
      localStorage.removeItem('intentedge_session_time')
      return
    }

    const interval = setInterval(() => {
      setTotalTimeSpent((prev) => {
        const next = prev + 1
        localStorage.setItem('intentedge_session_time', next.toString())

        // Gradually increase behavior score for long active sessions
        if (next > 0 && next % 60 === 0) {
          setScore((s) => s + 2) // +2 points every minute
        }

        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [user])

  // ── EXISTING function — signature preserved exactly ───────────
  const getNudgeMessage = () => {
    if (score > 90) return "High-value investor detected. Offer premium consultation."
    if (score > 70) return "Investor shows strong interest. Trigger personalized SIP recovery nudge."
    if (score > 50) return "Investor is comparing plans. Provide educational recommendations."
    return "Low engagement investor."
  }

  // ── EXISTING trackEvent — preserved exactly ───────────────────
  const trackEvent = (action, plan) => {
    let points = 0
    if (action === "Compare Clicked") points = SCORE_RULES.CLICKED_COMPARE
    if (action === "Invest Clicked") points = SCORE_RULES.INVEST_CLICKED

    const newEvent = {
      action,
      plan,
      page: plan,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points,
    }

    setEvents((prev) => [newEvent, ...prev])
    setScore((prev) => prev + points)
    if (events.length >= 3) setHesitation(true)
    console.log("Tracked Event:", newEvent)

    // Log to backend
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })

    fetch(`${API_URL}/score/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    }).catch(() => { })
  }

  // ── NEW: Page tracking ────────────────────────────────────────
  const trackPageVisit = useCallback((page) => {
    const points = SCORE_RULES.VISITED_PLANS
    const newEvent = {
      action: "Page Visit",
      page,
      plan: page,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points,
    }
    setEvents((prev) => [newEvent, ...prev])
    setScore((prev) => prev + points)
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })
  }, [userId])

  const trackTimeSpent = useCallback((page, seconds) => {
    // Note: totalTimeSpent is now tracked globally via setInterval.
    // We only use this function to track specific unmount events (like staying 3+ mins).
    if (seconds >= 180) {
      const points = SCORE_RULES.STAYED_3_MINS
      const newEvent = {
        action: "Stayed 3+ Mins",
        page,
        plan: page,
        timeSpent: seconds,
        timestamp: new Date().toLocaleString(),
        points,
      }
      setEvents((prev) => [newEvent, ...prev])
      setScore((prev) => prev + points)
      fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...newEvent })
      }).catch(() => { })
    }
  }, [userId])

  const trackExit = useCallback(() => {
    setExitCount((prev) => {
      const next = prev + 1
      if (next >= 3) {
        const newEvent = {
          action: "Repeated Exit",
          page: "Exit",
          plan: "-",
          timeSpent: 0,
          timestamp: new Date().toLocaleString(),
          points: SCORE_RULES.REPEATED_EXITS,
        }
        setEvents((e) => [newEvent, ...e])
        setScore((s) => s + SCORE_RULES.REPEATED_EXITS)
        setHesitation(true)
        fetch(`${API_URL}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...newEvent })
        }).catch(() => { })
      }
      return next
    })
  }, [userId])

  const trackBounce = useCallback((page) => {
    const newEvent = {
      action: "Bounce",
      page,
      plan: page,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points: 0,
    }
    setEvents((prev) => [newEvent, ...prev])
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })
  }, [userId])

  // ── NEW: Form tracking ────────────────────────────────────────
  const trackFormStarted = useCallback((formName) => {
    const points = SCORE_RULES.SIGNUP_STARTED
    const newEvent = {
      action: "Form Started",
      page: formName,
      plan: formName,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points,
    }
    setEvents((prev) => [newEvent, ...prev])
    setScore((prev) => prev + points)
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })
  }, [userId])

  const trackFormCompleted = useCallback((formName) => {
    const points = SCORE_RULES.FORM_COMPLETED
    const newEvent = {
      action: "Form Completed",
      page: formName,
      plan: formName,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points,
    }
    setEvents((prev) => [newEvent, ...prev])
    setScore((prev) => prev + points)
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })
  }, [userId])

  const trackFormAbandoned = useCallback((formName) => {
    const points = SCORE_RULES.FORM_ABANDONED
    const newEvent = {
      action: "Form Abandoned",
      page: formName,
      plan: formName,
      timeSpent: 0,
      timestamp: new Date().toLocaleString(),
      points,
    }
    setEvents((prev) => [newEvent, ...prev])
    setScore((prev) => prev + points)
    setHesitation(true)
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newEvent })
    }).catch(() => { })
  }, [userId])

  // ── NEW: Derived / computed values (memoised) ─────────────────
  const persona = useMemo(
    () => detectPersona(events, score, totalTimeSpent, exitCount),
    [events, score, totalTimeSpent, exitCount]
  )

  const triggerReasons = useMemo(
    () => generateTriggerReasons(events, score, totalTimeSpent, exitCount),
    [events, score, totalTimeSpent, exitCount]
  )

  const conversionProbability = useMemo(() => getConversionProbability(score), [score])

  const dropoffRisk = useMemo(
    () =>
      getDropoffRisk(
        score,
        exitCount,
        events.some((e) => e.action === "Form Abandoned")
      ),
    [score, exitCount, events]
  )

  const scoreLabel = useMemo(() => getScoreLabel(score), [score])

  // ── NEW: Generate personalised nudges + log them ──────────────
  const generatePersonalizedNudges = useCallback(
    (userParam) => {
      const activeUser = userParam || user
      // Also hit the backend to evaluate nudges and get any backend-driven reasons
      fetch(`${API_URL}/nudges/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }).catch(() => { })

      const nudges = generateNudge(persona.id)
      const logs = nudges.map((nudge) => {
        const log = generateEmailLog(activeUser, persona, nudge, triggerReasons)
        // Log to backend
        fetch(`${API_URL}/email-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: log.message,
            triggerReason: log.triggerReason,
            persona: persona.label || "Unknown",
            nudgeType: log.nudgeType
          })
        }).catch((e) => console.error("Failed to log email:", e))
        return log
      })
      setNudgeLogs((prev) => [...logs, ...prev])
      showToast(`⚡ Generated ${logs.length} personalized nudges!`)
      return logs
    },
    [persona, triggerReasons, userId, user]
  )

  return (
    <TrackingContext.Provider
      value={{
        // ── Existing API (unchanged) ──
        events,
        trackEvent,
        score,
        hesitation,
        getNudgeMessage,
        // ── New tracking functions ──
        trackPageVisit,
        trackTimeSpent,
        trackExit,
        trackBounce,
        trackFormStarted,
        trackFormCompleted,
        trackFormAbandoned,
        // ── New computed values ──
        persona,
        triggerReasons,
        conversionProbability,
        dropoffRisk,
        scoreLabel,
        exitCount,
        totalTimeSpent,
        nudgeLogs,
        generatePersonalizedNudges,
      }}
    >
      {children}
      {/* Global Toast UI */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[200] animate-bounce">
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </TrackingContext.Provider>
  )
}

export const useTracking = () => useContext(TrackingContext)