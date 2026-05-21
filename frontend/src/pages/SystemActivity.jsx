import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Cpu, RefreshCw, Activity, ShoppingCart, CreditCard, Eye, Bell, TrendingUp } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const EVENT_META = {
  "Compare Clicked":      { icon: Eye,          color: "bg-blue-50 text-blue-700 border-blue-100" },
  "Checkout Started":     { icon: ShoppingCart, color: "bg-amber-50 text-amber-700 border-amber-100" },
  "Checkout Completed":   { icon: CreditCard,   color: "bg-green-50 text-green-700 border-green-100" },
  "Investment Completed": { icon: TrendingUp,   color: "bg-green-50 text-green-700 border-green-100" },
  "Assistant Auto-Opened":{ icon: Bell,         color: "bg-purple-50 text-purple-700 border-purple-100" },
  "Page Visit":           { icon: Activity,     color: "bg-gray-50 text-gray-500 border-gray-100" },
}

const SystemActivity = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("All")
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`${API_URL}/admin/events`)
      if (res.ok) setEvents(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/unauthorized"); return }
    fetchEvents()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchEvents(true), 30000)
    return () => clearInterval(interval)
  }, [user, navigate, fetchEvents])

  const uniqueActions = ["All", ...new Set(events.map(e => e.action))]
  const filtered = filter === "All" ? events : events.filter(e => e.action === filter)

  // Stats
  const todayEvents = events.filter(e => {
    const today = new Date(); const d = new Date(e.timestamp)
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006044]" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Cpu size={28} className="text-[#006044]" /> System Activity
            </h1>
            <p className="text-gray-500 mt-1">Live behavioral event feed across all platform users.</p>
          </div>
          <button
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-[#006044] hover:border-[#006044] transition px-4 py-2 rounded shadow-sm font-semibold text-sm disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh Feed"}
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events",        value: events.length },
            { label: "Today's Events",      value: todayEvents.length },
            { label: "Unique Users",        value: new Set(events.map(e => e.userId)).size },
            { label: "Abandon Events",      value: events.filter(e => e.action === "Checkout Started").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
          {uniqueActions.map(action => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filter === action ? "bg-[#006044] text-white border-[#006044]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Event Feed */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-16 text-gray-400">No events found.</td></tr>
                ) : filtered.map((e, i) => {
                  const meta = EVENT_META[e.action] || { icon: Activity, color: "bg-gray-50 text-gray-500 border-gray-100" }
                  const Icon = meta.icon
                  return (
                    <tr key={e._id || i} className="hover:bg-gray-50 transition animate-in fade-in" style={{ animationDelay: `${(i % 20) * 20}ms`, animationFillMode: "both" }}>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border w-fit ${meta.color}`}>
                          <Icon size={12} /> {e.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/records/${encodeURIComponent(e.userId)}`)}
                          className="text-xs text-[#006044] hover:underline font-medium"
                        >
                          {e.userId}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{e.page || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{e.plan || "—"}</td>
                      <td className="px-4 py-3 text-xs font-bold text-[#006044]">+{e.points || 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}

export default SystemActivity
