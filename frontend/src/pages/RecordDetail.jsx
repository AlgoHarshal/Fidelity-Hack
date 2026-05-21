import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts"
import {
  ArrowLeft, User, Briefcase, Activity, Bell, Clock,
  TrendingUp, ShieldCheck, AlertTriangle, CheckCircle,
  Mail, Eye, ShoppingCart, CreditCard
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const CATEGORY_COLORS = {
  "SIP": "#006044", "Mutual Funds": "#0ea5e9", "Insurance": "#8b5cf6", "Retirement": "#f59e0b"
}

const EVENT_ICONS = {
  "Compare Clicked":      <Eye size={14} className="text-blue-500" />,
  "Checkout Started":     <ShoppingCart size={14} className="text-amber-500" />,
  "Checkout Completed":   <CreditCard size={14} className="text-green-600" />,
  "Checkout Abandoned":   <AlertTriangle size={14} className="text-red-500" />,
  "Investment Completed": <CheckCircle size={14} className="text-green-600" />,
  "Assistant Auto-Opened":<Bell size={14} className="text-purple-500" />,
  "Page Visit":           <Clock size={14} className="text-gray-400" />,
}

const Stat = ({ label, value, sub, color = "text-gray-900", tooltip = "" }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm" title={tooltip}>
    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
    <p className={`text-2xl font-extrabold ${color} ${tooltip ? 'cursor-help' : ''}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </div>
)

const RecordDetail = () => {
  const { userId } = useParams()
  const { user: admin } = useAuth()
  const navigate = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (admin?.role !== "admin") { navigate("/unauthorized"); return }
    fetch(`${API_URL}/admin/users/${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId, admin, navigate])

  const engagementData = useMemo(() => {
    if (!data?.events) return []
    const byDay = {}
    data.events.forEach(e => {
      const day = new Date(e.timestamp).toLocaleDateString()
      byDay[day] = (byDay[day] || 0) + 1
    })
    return Object.entries(byDay).slice(-10).map(([date, events]) => ({ date, events }))
  }, [data])

  const pieData = useMemo(() => {
    if (!data?.investments) return []
    const cats = {}
    data.investments.forEach(i => { cats[i.category || "Other"] = (cats[i.category || "Other"] || 0) + i.amount })
    return Object.entries(cats).map(([name, value]) => ({ name, value }))
  }, [data])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006044]" />
      </div>
    </div>
  )

  if (!data?.user) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Investor not found.</p>
      </div>
    </div>
  )

  const { user: inv, score, investments = [], notifications = [], emailLogs = [], events = [], analytics = {} } = data

  // ── Computed metrics from real event + notification data ─────────────────
  const checkoutAbandonedCount = events.filter(e => e.action === 'Checkout Abandoned').length
  const compareAbandonedCount  = events.filter(e => e.action === 'Compare Abandoned' || e.action === 'COMPARE_ABANDONED').length
  const recoveryEmailsSent     = notifications.filter(n =>
    n.triggerEmail ||
    ['CHECKOUT_ABANDONED', 'COMPARE_ABANDONED', 'ASSISTANT_RECOVERY', 'INSURANCE_RECOMMENDATION', 'HIGH_RISK_WARNING'].includes(n.type)
  ).length
  const successfulRecoveries   = (
    (notifications.some(n => n.type === 'CHECKOUT_ABANDONED' || n.type === 'COMPARE_ABANDONED')) &&
    investments.length > 0
  ) ? 1 : 0

  const TABS = ["overview", "portfolio", "behavioral", "recovery", "timeline"]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-10">

        {/* Back + Header */}
        <button onClick={() => navigate("/records")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#006044] mb-6 transition font-medium">
          <ArrowLeft size={16} /> Back to Records
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#006044]/10 flex items-center justify-center text-2xl font-bold text-[#006044]">
              {inv.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{inv.name}</h1>
              <p className="text-gray-500">{inv.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-xs font-bold">{score?.persona || "Undefined"}</span>
                {score?.engagementLevel && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-bold">
                    {score.engagementLevel}
                  </span>
                )}
                {score?.trend && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold capitalize">
                    {score.trend === 'improving' ? '↑ Improving' : score.trend === 'declining' ? '↓ Declining' : 'Stable'}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">{inv.riskAppetite || "N/A"}</span>
                <span className="bg-[#006044]/10 text-[#006044] px-2 py-0.5 rounded text-xs font-semibold">Goal: {inv.investmentGoal || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Score"      value={score?.score || 0}                color="text-[#006044]" tooltip={score?.scoreReasons?.join('\n')} />
            <Stat label="Drop-off"   value={`${score?.dropoffRisk || 0}%`}    color={score?.dropoffRisk >= 70 ? "text-red-600" : "text-amber-600"} tooltip={score?.riskReasons?.join('\n')} />
            <Stat label="Conversion" value={`${score?.conversionProbability || 0}%`} color="text-green-700" tooltip={score?.convReasons?.join('\n')} />
            <Stat label="Events"     value={events.length} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm mb-8 overflow-x-auto w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition ${activeTab === tab ? "bg-[#006044] text-white" : "text-gray-600 hover:text-[#006044]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Identity</h3>
              {[
                ["Name",           inv.name],
                ["Email",          inv.email],
                ["Joined",         new Date(inv.createdAt).toLocaleDateString()],
                ["Risk Appetite",  inv.riskAppetite || "Not Set"],
                ["Investment Goal",inv.investmentGoal || "Not Set"],
                ["Role",           inv.role],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Engagement Summary</h3>
              {[
                ["Total Events",           events.length],
                ["Compare Clicks",         analytics.compareCount || 0],
                ["Abandoned Checkouts",    checkoutAbandonedCount],
                ["Compare Abandonments",   compareAbandonedCount],
                ["Investments Made",       investments.length],
                ["Notifications Received", notifications.length],
                ["Recovery Emails Sent",   recoveryEmailsSent],
                ["Successful Recoveries",  successfulRecoveries],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-bold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Total Invested"  value={`₹${analytics.totalValue?.toLocaleString() || 0}`} color="text-gray-900" />
              <Stat label="Active Plans"    value={investments.length} />
              <Stat label="Diversification" value={`${new Set(investments.map(i => i.category)).size * 25}%`} color="text-[#006044]" />
            </div>

            {pieData.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No investments recorded.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {investments.map((inv, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded mb-1 inline-block" style={{ backgroundColor: CATEGORY_COLORS[inv.category] || "#94a3b8" }}>
                        {inv.category}
                      </span>
                      <p className="font-bold text-gray-900">{inv.planName}</p>
                    </div>
                    <p className="text-sm font-bold text-[#006044]">₹{inv.amount?.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(inv.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BEHAVIORAL TAB ── */}
        {activeTab === "behavioral" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Behavior Scores</h3>
                {[
                  ["Behavior Score",       score?.score || 0,                  "/100", score?.scoreReasons?.join('\n')],
                  ["Drop-off Risk",        score?.dropoffRisk || 0,            "%",    score?.riskReasons?.join('\n')],
                  ["Conversion Probability",score?.conversionProbability || 0, "%",    score?.convReasons?.join('\n')],
                ].map(([label, val, suffix, tooltip]) => (
                  <div key={label} className="mb-4 cursor-help" title={tooltip}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="text-[#006044]">{val}{suffix}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#006044] h-full rounded-full transition-all duration-1000" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Most Viewed Products</h3>
                {analytics.mostViewed?.length > 0 ? analytics.mostViewed.map(({ plan, count }) => (
                  <div key={plan} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{plan}</span>
                    <span className="text-xs font-bold text-[#006044] bg-[#006044]/10 px-2 py-0.5 rounded">{count}x</span>
                  </div>
                )) : <p className="text-sm text-gray-400">No product views recorded.</p>}
              </div>
            </div>

            {engagementData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Engagement Trend (Last 10 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="events" stroke="#006044" fill="#006044" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── RECOVERY TAB ── */}
        {activeTab === "recovery" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Notifications Sent"   value={notifications.length} />
              <Stat label="Recovery Emails Sent" value={recoveryEmailsSent} color={recoveryEmailsSent > 0 ? "text-[#006044]" : "text-gray-900"} />
              <Stat label="Abandoned Checkouts"  value={checkoutAbandonedCount} color={checkoutAbandonedCount > 0 ? "text-amber-600" : "text-gray-900"} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Compare Abandonments" value={compareAbandonedCount} color={compareAbandonedCount > 0 ? "text-amber-600" : "text-gray-900"} />
              <Stat label="Successful Recoveries" value={successfulRecoveries} color={successfulRecoveries > 0 ? "text-green-700" : "text-gray-900"} />
              <Stat label="Investments After Recovery" value={investments.length > 0 && recoveryEmailsSent > 0 ? investments.length : 0} color="text-[#006044]" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800">Notification History</h3>
              </div>
              {notifications.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No notifications sent to this user.</p>
              ) : notifications.slice(0, 20).map(n => (
                <div key={n._id} className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                  <Bell size={16} className="text-[#006044] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-2 flex-shrink-0 ${n.isRead ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                        {n.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {activeTab === "timeline" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6">Activity Timeline</h3>
            <div className="relative space-y-0">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
              {events.slice(0, 50).map((e, i) => (
                <div key={i} className="flex gap-4 items-start pb-5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 20}ms`, animationFillMode: "both" }}>
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 z-10">
                    {EVENT_ICONS[e.action] || <Activity size={14} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-sm font-semibold text-gray-900">{e.action}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                      {e.page && <span>on {e.page}</span>}
                      {e.plan && <span>· {e.plan}</span>}
                      <span>· {new Date(e.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-gray-400 pl-14">No events recorded.</p>}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}

export default RecordDetail
