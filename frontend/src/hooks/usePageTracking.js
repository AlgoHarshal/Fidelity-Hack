import { useEffect, useRef } from "react"
import { useTracking } from "../context/TrackingContext"

/**
 * usePageTracking — auto-fires page visit on mount, time-spent on unmount.
 * Use at the top of every page component.
 *
 * @param {string} pageName — human-readable page label (e.g. "SIP Plans")
 */
export const usePageTracking = (pageName) => {
  const { trackPageVisit, trackTimeSpent } = useTracking()
  const startRef = useRef(null)
  const trackedRef = useRef(false) // guard against StrictMode double-fire

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    startRef.current = Date.now()
    trackPageVisit(pageName)

    return () => {
      const seconds = Math.round((Date.now() - startRef.current) / 1000)
      trackTimeSpent(pageName, seconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName])
}
