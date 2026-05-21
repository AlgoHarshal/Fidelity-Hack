import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./AuthContext"
import { useTracking } from "./TrackingContext"
import { evaluatePortfolioRules } from "../assistantDecisionEngine"

const NotificationContext = createContext()
export const useNotifications = () => useContext(NotificationContext)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// ─── Timeouts: 15 seconds for both demo & production
const COMPARE_ABANDON_MS  = 15000
const CHECKOUT_ABANDON_MS = 15000

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const { events } = useTracking()
  const [notifications, setNotifications] = useState([])
  const [investments, setInvestments]     = useState([])

  // Persistent timer refs — survive re-renders
  const compareTimerRef  = useRef(null)
  const checkoutTimerRef = useRef(null)

  // Snapshot refs so timer callbacks always see CURRENT values without re-triggering effects
  const notificationsRef = useRef(notifications)
  const userRef          = useRef(user)
  const eventsRef        = useRef(events)
  const addNotifRef      = useRef(null)   // will be set after addNotification is defined

  useEffect(() => { notificationsRef.current = notifications }, [notifications])
  useEffect(() => { userRef.current = user }, [user])
  useEffect(() => { eventsRef.current = events }, [events])

  // ── 1. Load / reset notifications from localStorage
  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`intentedge_notifications_${user.email}`)
      if (saved) {
        try { setNotifications(JSON.parse(saved)) } catch { setNotifications([]) }
      } else {
        // Welcome notification — direct setState to avoid circular dep on addNotification
        const welcome = {
          id: Date.now().toString(),
          read: false,
          timestamp: new Date().toISOString(),
          type: "Update",
          title: "Welcome to IntentEdge",
          message: "Your premium financial journey begins here."
        }
        setNotifications([welcome])
      }
    } else {
      setNotifications([])
      clearTimeout(compareTimerRef.current)
      clearTimeout(checkoutTimerRef.current)
      compareTimerRef.current  = null
      checkoutTimerRef.current = null
    }
  }, [user])

  // ── 2. Fetch investments once after login
  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user?.email) return
      try {
        const res = await fetch(`${API_URL}/investments/user/${user.email}`)
        if (res.ok) setInvestments(await res.json())
      } catch (err) {
        console.error("[Notifications] Failed to fetch investments", err)
      }
    }
    fetchInvestments()
  }, [user])

  // ── 3. Persist to localStorage
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`intentedge_notifications_${user.email}`, JSON.stringify(notifications))
    }
  }, [notifications, user])

  // ── Helper: call backend to persist + email
  const triggerBackendNotification = useCallback(async (notif) => {
    if (!userRef.current?.email) return
    try {
      const res = await fetch(`${API_URL}/notifications/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:        userRef.current.email,
          type:          notif.type,
          title:         notif.title,
          message:       notif.message,
          actionLabel:   notif.actionLabel,
          actionLink:    notif.actionLink,
          triggerEmail:  notif.triggerEmail,
          emailTemplate: notif.emailTemplate,
          emailData:     notif.emailData || {}
        })
      })
      if (res.ok) {
        console.log("[Notifications] ✅ Notification persisted to backend")
        if (notif.triggerEmail) console.log("[Notifications] 📧 Email dispatch requested:", notif.emailTemplate)
      } else {
        const err = await res.json()
        console.error("[Notifications] ❌ Backend rejected notification:", err)
      }
    } catch (err) {
      console.error("[Notifications] Failed to sync to backend", err)
    }
  }, [])

  // ── Core addNotification — stable reference via ref forwarding
  const addNotification = useCallback((notif) => {
    console.log("[Notifications] Notification dispatching:", notif.title)
    setNotifications(prev => {
      // Duplicate guard — by title
      if (prev.some(n => n.title === notif.title)) {
        console.log("[Notifications] Duplicate skipped:", notif.title)
        return prev
      }
      const newNotif = {
        id: Date.now().toString(),
        read: false,
        timestamp: new Date().toISOString(),
        ...notif
      }
      if (newNotif.triggerEmail) triggerBackendNotification(newNotif)
      return [newNotif, ...prev]
    })
  }, [triggerBackendNotification])

  // Keep addNotifRef in sync so timer callbacks can call it without being in deps
  useEffect(() => { addNotifRef.current = addNotification }, [addNotification])

  // ── 4. Compare-Abandonment Timer Engine
  useEffect(() => {
    if (!user || !events?.length) return

    const compareEvents   = events.filter(e => e.action === "Compare Clicked")
    const completedEvents = events.filter(e => e.action === "Checkout Completed")

    if (compareEvents.length >= 2) {
      console.log(`[DecisionEngine] Compare detected — ${compareEvents.length} compares recorded`)

      // Don't start a new timer if one is already running
      if (compareTimerRef.current) return

      console.log(`[DecisionEngine] ⏱ Compare abandonment timer started (${COMPARE_ABANDON_MS / 1000}s)`)

      // Snapshot the events data so timer closure doesn't stale
      const firstCompareTimestamp = compareEvents[0].timestamp

      compareTimerRef.current = setTimeout(() => {
        console.log("[DecisionEngine] ⏱ Compare abandonment timer completed")

        const currentNotifs     = notificationsRef.current
        const currentCompleted  = eventsRef.current.filter(e => e.action === "Checkout Completed")
        const alreadyFired      = currentNotifs.some(n => n.title === "Still Comparing Plans?")

        if (alreadyFired) {
          console.log("[DecisionEngine] Compare abandonment already notified — skipping")
          compareTimerRef.current = null
          return
        }

        const firstCompareTime      = new Date(firstCompareTimestamp).getTime()
        const completedAfterCompare = currentCompleted.some(
          e => new Date(e.timestamp).getTime() > firstCompareTime
        )

        if (completedAfterCompare) {
          console.log("[DecisionEngine] Checkout completed after compare — abandonment cancelled")
          compareTimerRef.current = null
          return
        }

        console.log("[DecisionEngine] 🚨 COMPARE_ABANDONED triggered — dispatching notification")
        addNotifRef.current?.({
          type:          "Recommendation",
          title:         "Still Comparing Plans?",
          message:       "Still comparing plans? Here's a simplified breakdown to help you decide.",
          actionLabel:   "Resume Comparison",
          actionLink:    "/compare",
          triggerEmail:  true,
          emailTemplate: "compareAbandonment",
          emailData:     {}
        })

        compareTimerRef.current = null
      }, COMPARE_ABANDON_MS)
    }

    return () => {
      // Do NOT clear compare timer here — only on logout or fire
    }
  }, [events, user])

  // ── 5. Checkout-Abandonment Timer Engine
  useEffect(() => {
    if (!user || !events?.length) return

    const abandonedEvents = events.filter(e => e.action === "Checkout Abandoned")

    if (abandonedEvents.length === 0) return

    // Don't start a new timer if one is already running
    if (checkoutTimerRef.current) return

    const lastAbandoned = abandonedEvents[0] // Events are newest-first
    const planName      = lastAbandoned.plan || "your selected plan"

    console.log("[DecisionEngine] Checkout abandonment detected for:", planName)
    console.log(`[DecisionEngine] ⏱ Checkout abandonment timer started (${CHECKOUT_ABANDON_MS / 1000}s)`)

    // Snapshot timestamp for stable use in closure
    const abandonedTimestamp = lastAbandoned.timestamp

    checkoutTimerRef.current = setTimeout(() => {
      console.log("[DecisionEngine] ⏱ Checkout recovery timer completed")

      const currentNotifs    = notificationsRef.current
      const currentCompleted = eventsRef.current.filter(e => e.action === "Checkout Completed")

      // Cooldown: max 1 email per product per session
      if (currentNotifs.some(n => n.type === "CHECKOUT_ABANDONED" && n.emailData?.productName === planName)) {
        console.log(`[DecisionEngine] Checkout abandonment already sent for "${planName}" — skipping`)
        checkoutTimerRef.current = null
        return
      }

      // Verify no checkout completed AFTER this abandonment
      const abandonedTime  = new Date(abandonedTimestamp).getTime()
      const completedAfter = currentCompleted.some(
        e => new Date(e.timestamp).getTime() > abandonedTime
      )

      if (completedAfter) {
        console.log("[DecisionEngine] Checkout completed after abandonment — timer cancelled")
        checkoutTimerRef.current = null
        return
      }

      console.log("[DecisionEngine] 🚨 CHECKOUT_ABANDONED triggered — dispatching checkout recovery notification")
      addNotifRef.current?.({
        type:          "CHECKOUT_ABANDONED",
        title:         "Your investment is waiting",
        message:       `Your selected investment in "${planName}" is waiting. Complete setup in less than 2 minutes.`,
        actionLabel:   "Resume Checkout",
        actionLink:    "/investments",
        triggerEmail:  true,
        emailTemplate: "checkoutReminder",
        emailData:     { productName: planName }
      })

      checkoutTimerRef.current = null
    }, CHECKOUT_ABANDON_MS)

    return () => {
      // Do NOT clear checkout timer here — only on logout or fire
    }
  }, [events, user])

  // ── 6. Portfolio Rules (synchronous, fires after investments load)
  useEffect(() => {
    if (!user || investments.length === 0) return
    const newAlerts = evaluatePortfolioRules(user, investments, notifications)
    newAlerts.forEach(alert => addNotifRef.current?.(alert))
  }, [investments, user]) // deliberately NOT watching notifications

  const markAsRead         = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead      = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const clearNotifications = () => setNotifications([])

  const value = {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
