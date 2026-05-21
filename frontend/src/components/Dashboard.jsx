import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { useTracking } from "../context/TrackingContext"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts"
import {
  Users, Activity, Target, Mail, AlertTriangle, TrendingUp,
  Download, Zap, CheckCircle, ShoppingCart, Eye, Bell, RefreshCw
} from "lucide-react"

const COLORS = ['#006044', '#76A923', '#3B82F6', '#F59E0B', '#EF4444']

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// ── Relative time formatter (no external deps) ─────────────────────────────
const timeAgo = (dateString) => {
  const s = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (s < 60)  return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(dateString).toLocaleDateString()
}

// ── Event colour dots ──────────────────────────────────────────────────────
const EVENT_COLOR = {
  "Checkout Completed":   "#006044",
  "Investment Completed": "#006044",
  "Compare Clicked":      "#3B82F6",
  "Checkout Started":     "#F59E0B",
  "Assistant Auto-Opened":"#8B5CF6",
  "Page Visit":           "#9CA3AF",
}

const Dashboard = () => {
  const { user }   = useAuth()
  const { generatePersonalizedNudges } = useTracking()

  // ── State ─────────────────────────────────────────────────────────────────
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, totalEvents: 0, nudgesSent: 0,
    conversionRate: 0, convertedUsers: 0,
    users: [], recentInvestments: []
  })
  const [liveEvents,   setLiveEvents]   = useState([])   // real events feed
  const [commsLog,     setCommsLog]     = useState([])   // real notifications
  const [isLoading,    setIsLoading]    = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)

  // Table UI state
  const [searchTerm,  setSearchTerm]  = useState("")
  const [sortBy,      setSortBy]      = useState("score")

  // ── Data fetcher ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setRefreshing(true)
    try {
      const [statsRes, eventsRes, notifsRes] = await Promise.all([
        fetch(`${API_URL}/admin/analytics`),
        fetch(`${API_URL}/admin/events`),
        fetch(`${API_URL}/admin/notifications`)
      ])

      if (statsRes.ok)  setAdminStats(await statsRes.json())
      if (eventsRes.ok) setLiveEvents(await eventsRes.json())
      if (notifsRes.ok) setCommsLog(await notifsRes.json())
    } catch (e) {
      console.warn("Backend admin API unreachable:", e.message)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(true), 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  // ── Derived: Conversion Funnel from REAL events ───────────────────────────
  const funnelData = useMemo(() => [
    { name: "Visits",   value: liveEvents.filter(e => e.action === "Page Visit").length },
    { name: "Compares", value: liveEvents.filter(e => e.action === "Compare Clicked").length },
    { name: "Checkout", value: liveEvents.filter(e => e.action === "Checkout Started").length },
    { name: "Invested", value: liveEvents.filter(e => e.action === "Checkout Completed" || e.action === "Investment Completed").length },
  ], [liveEvents])

  // ── Derived: Category popularity from REAL events ────────────────────────
  const categoryPopularity = useMemo(() => {
    const cats = {}
    liveEvents.filter(e => e.plan).forEach(e => {
      // Group by rough category based on event type
      const key = e.action === "Compare Clicked" || e.action === "Page Visit" ? e.plan : null
      if (key) cats[key] = (cats[key] || 0) + 1
    })
    // Also use recentInvestments for purchase data
    ;(adminStats.recentInvestments || []).forEach(inv => {
      const cat = inv.category || inv.planName || "Other"
      cats[cat] = (cats[cat] || 0) + 2 // purchases weight more
    })
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))
  }, [liveEvents, adminStats.recentInvestments])

  // ── Derived: Persona pie from real users ─────────────────────────────────
  const pieData = useMemo(() => {
    const counts = {}
    adminStats.users.forEach(u => { counts[u.persona] = (counts[u.persona] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [adminStats.users])

  // ── Derived: Live activity feed (real events, latest 15) ─────────────────
  const activityFeed = useMemo(() => {
    return liveEvents
      .filter(e => e.action !== "Page Visit") // skip noise
      .slice(0, 15)
  }, [liveEvents])

  // ── Filtered user table ───────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return adminStats.users
      .filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .sort((a, b) => sortBy === "risk" ? b.dropoffRisk - a.dropoffRisk : b.score - a.score)
  }, [adminStats.users, searchTerm, sortBy])

  const exportCSV = () => {
    const headers = "Name,Email,Score,Persona,Dropoff Risk,Conversion Prob\n"
    const csv = filteredUsers.map(u =>
      `"${u.name}","${u.email}",${u.score},"${u.persona}",${u.dropoffRisk}%,${u.conversionProbability}%`
    ).join("\n")
    const blob = new Blob([headers + csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = "intentedge_investors.csv"
    a.click()
  }

  return (
    <div className="bg-transparent px-4 md:px-8 py-12">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#006044]">Admin Control Center</h1>
            <p className="text-gray-500 mt-1">Real-time behavioral tracking · Live database feed</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition px-5 py-2.5 rounded font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => generatePersonalizedNudges(user)}
              className="flex items-center gap-2 bg-[#006044] hover:bg-[#004e36] text-white transition px-5 py-2.5 rounded font-semibold shadow-sm text-sm"
            >
              <Zap size={16} /> Run Engine
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition px-5 py-2.5 rounded font-semibold text-sm shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>

        {/* ── KPI Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Investors", value: adminStats.totalUsers,     icon: Users,   color: "text-gray-900",   iconCls: "text-[#006044]" },
            { label: "Total Events",    value: adminStats.totalEvents,    icon: Activity,color: "text-gray-900",   iconCls: "text-blue-600" },
            {
              label: "Global Conversion",
              value: `${adminStats.conversionRate}%`,
              sub: `${adminStats.convertedUsers} of ${adminStats.totalUsers} investors`,
              tooltip: "Percentage of registered users who successfully completed at least one investment.",
              icon: Target, color: "text-green-700", iconCls: "text-green-700"
            },
            { label: "Comms Sent",      value: adminStats.nudgesSent,     icon: Mail,    color: "text-purple-600", iconCls: "text-purple-600" },
          ].map(({ label, value, sub, tooltip, icon: Icon, color, iconCls }) => (
            <div key={label} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm" title={tooltip}>
              <div className="flex items-center gap-2 text-gray-600 mb-2 font-medium text-sm">
                <Icon size={16} className={iconCls} /> {label}
              </div>
              {isLoading
                ? <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                : <div className={`text-3xl font-bold ${color}`}>{value}</div>
              }
              {sub && !isLoading && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
          ))}
        </section>

        {/* ── Charts Row ── */}
        <section className="grid lg:grid-cols-4 gap-6">

          {/* Conversion Funnel — real events */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Target className="text-[#006044]" size={16} /> Conversion Funnel
            </h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ right: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB" }} />
                  <Bar dataKey="value" fill="#006044" radius={[0, 4, 4, 0]} barSize={14} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {funnelData.every(f => f.value === 0) && (
              <p className="text-xs text-center text-gray-400 mt-2">No events tracked yet.</p>
            )}
          </div>

          {/* Persona Spread — real user data */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Users className="text-[#006044]" size={16} /> Persona Spread
            </h2>
            <div className="h-52">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  {isLoading ? "Loading…" : "No investor data yet."}
                </div>
              )}
            </div>
          </div>

          {/* Category Popularity — real events */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-800">
              <TrendingUp className="text-[#006044]" size={16} /> Category Popularity
            </h2>
            <div className="h-52">
              {categoryPopularity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryPopularity} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB" }} />
                    <Bar dataKey="value" fill="#76A923" radius={[4, 4, 0, 0]} barSize={18} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  {isLoading ? "Loading…" : "No activity data yet."}
                </div>
              )}
            </div>
          </div>

          {/* Live Activity Feed — REAL events, no fake data */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col h-[280px]">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Activity className="text-orange-500" size={16} /> Live Activity Feed
            </h2>
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {activityFeed.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400">No recent behavioral activity.</p>
                </div>
              ) : activityFeed.map((e, i) => {
                const dotColor = EVENT_COLOR[e.action] || "#9CA3AF"
                return (
                  <div key={e._id || i} className="relative pl-5 border-l border-gray-200 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}>
                    <span
                      className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    {i === 0 && <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full animate-ping opacity-60" style={{ backgroundColor: dotColor }} />}
                    <p className="text-xs font-bold text-gray-900 leading-tight">{e.action}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {e.userId}{e.plan ? ` · ${e.plan}` : ""}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(e.timestamp)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Admin Data Tables ── */}
        <section className="grid lg:grid-cols-3 gap-6">

          {/* User Intelligence Table — real enriched users */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col h-[480px]">
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
              <h2 className="text-base font-bold text-gray-900">User Intelligence Table</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search investors…"
                  className="bg-gray-50 border border-gray-200 rounded pl-3 pr-3 py-2 text-sm focus:border-[#006044] focus:outline-none w-40 shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-2 text-sm focus:border-[#006044] focus:outline-none cursor-pointer shadow-sm"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="score">By Score</option>
                  <option value="risk">By Risk</option>
                </select>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 border-b border-gray-100 sticky top-0 bg-white">
                  <tr>
                    <th className="pb-2 font-semibold text-xs uppercase tracking-wide">Investor</th>
                    <th className="pb-2 font-semibold text-xs uppercase tracking-wide">Persona</th>
                    <th className="pb-2 font-semibold text-xs uppercase tracking-wide text-right">Score</th>
                    <th className="pb-2 font-semibold text-xs uppercase tracking-wide text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u, i) => (
                    <tr key={u._id || i} className="hover:bg-gray-50 transition">
                      <td className="py-2.5">
                        <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                      </td>
                      <td className="py-2.5 text-xs text-gray-600 font-medium cursor-help" title={u.personaTooltip || u.persona}>{u.persona}</td>
                      <td className="py-2.5 text-right font-bold text-[#006044] cursor-help" title={u.scoreReasons?.join('\n') || ''}>{u.score}</td>
                      <td className={`py-2.5 text-right font-bold cursor-help ${u.dropoffRisk > 50 ? "text-red-600" : "text-green-700"}`} title={u.riskReasons?.join('\n') || ''}>{u.dropoffRisk}%</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !isLoading && (
                    <tr><td colSpan="4" className="py-10 text-center text-gray-400 text-sm">No investors found.</td></tr>
                  )}
                  {isLoading && (
                    <tr><td colSpan="4" className="py-10 text-center text-gray-300 text-sm">Loading…</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Market Activity — real investments */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col h-[480px]">
            <div className="flex justify-between mb-5 items-center">
              <h2 className="text-base font-bold text-gray-900">Recent Market Activity</h2>
              <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 font-semibold border border-green-200">
                <TrendingUp size={12} /> Live
              </span>
            </div>
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {adminStats.recentInvestments?.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <TrendingUp size={32} className="mb-2 text-gray-200" />
                  <p className="text-sm">No investments recorded yet.</p>
                </div>
              )}
              {adminStats.recentInvestments?.map((inv, i) => (
                <div key={inv._id || i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm flex justify-between items-center shadow-sm hover:border-gray-300 transition">
                  <div className="min-w-0 mr-3">
                    <p className="font-bold text-gray-900 truncate">{inv.planName}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{inv.userId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#006044]">₹{(inv.amount || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400">{timeAgo(inv.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Communications Log — REAL notifications, no fake data */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col h-[480px]">
            <div className="flex justify-between mb-5 items-center">
              <h2 className="text-base font-bold text-gray-900">Live Communications Log</h2>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1 font-semibold border border-blue-200">
                <Mail size={12} /> {commsLog.length} total
              </span>
            </div>
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {commsLog.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bell size={32} className="mb-2 text-gray-200" />
                  <p className="text-sm">No notifications sent yet.</p>
                  <p className="text-xs mt-1 text-center max-w-48">Compare products or trigger the behavioral engine to generate comms.</p>
                </div>
              )}
              {commsLog.slice(0, 15).map((notif, i) => {
                const typeColors = {
                  Success: "bg-green-100 text-green-800",
                  Alert: "bg-red-100 text-red-800",
                  Recommendation: "bg-purple-100 text-purple-800",
                  Warning: "bg-amber-100 text-amber-800",
                  Update: "bg-gray-100 text-gray-700",
                  Insight: "bg-blue-100 text-blue-800"
                }
                return (
                  <div key={notif._id || i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm shadow-sm hover:border-gray-300 transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${typeColors[notif.type] || "bg-gray-100 text-gray-700"}`}>
                        {notif.type || "notification"}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-2">{timeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2 truncate border-t border-gray-100 pt-1.5">
                      → {notif.userId}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Dashboard