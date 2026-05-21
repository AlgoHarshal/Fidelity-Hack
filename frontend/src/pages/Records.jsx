import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Search, ChevronUp, ChevronDown, Users, TrendingUp, ShieldAlert, User, Star } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// ── Persona → colour mapping ─────────────────────────────────────────────────
const PERSONA_STYLE = {
  "High Intent Investor":     "bg-green-100  text-green-800  border-green-200",
  "Aggressive Growth Investor":"bg-red-100    text-red-800    border-red-200",
  "Retirement Planner":       "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Insurance Focused":        "bg-violet-100 text-violet-800 border-violet-200",
  "Passive Wealth Builder":   "bg-teal-100   text-teal-800   border-teal-200",
  "Diversified Investor":     "bg-cyan-100   text-cyan-800   border-cyan-200",
  "Cautious Investor":        "bg-sky-100    text-sky-800    border-sky-200",
  "Hesitant Investor":        "bg-amber-100  text-amber-800  border-amber-200",
  "Researcher":               "bg-blue-100   text-blue-800   border-blue-200",
  "Explorer":                 "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Beginner Investor":        "bg-purple-100 text-purple-800 border-purple-200",
  "New Investor":             "bg-gray-100   text-gray-600   border-gray-200",
}

const personaStyle = (persona) =>
  PERSONA_STYLE[persona] || "bg-gray-100 text-gray-600 border-gray-200"

const RISK_COLOR = (v) => {
  if (v >= 70) return "text-red-600 bg-red-50"
  if (v >= 40) return "text-amber-600 bg-amber-50"
  return "text-green-700 bg-green-50"
}

const Records = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [investors, setInvestors] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [sortField, setSortField] = useState("score")
  const [sortDir,   setSortDir]   = useState("desc")
  const [page,      setPage]      = useState(1)
  const [showInternal, setShowInternal] = useState(false)
  const PER_PAGE = 10

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/unauthorized"); return }
    setLoading(true)
    fetch(`${API_URL}/admin/users?includeInternal=${showInternal}`)
      .then(r => r.json())
      .then(data => setInvestors(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, navigate, showInternal])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("desc") }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={13} className="text-gray-300" />
    return sortDir === "asc"
      ? <ChevronUp size={13} className="text-[#006044]" />
      : <ChevronDown size={13} className="text-[#006044]" />
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return investors
      .filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortField] ?? 0, bv = b[sortField] ?? 0
        if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
      })
  }, [investors, search, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ── Persona analytics ────────────────────────────────────────────────────────
  const personaCounts = useMemo(() => {
    const c = {}
    investors.forEach(u => { c[u.persona] = (c[u.persona] || 0) + 1 })
    return c
  }, [investors])

  const mostCommonPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0]
  const highRiskCount     = investors.filter(u => u.dropoffRisk >= 70).length
  const beginnerCount     = investors.filter(u => u.persona === "Beginner Investor" || u.persona === "New Investor").length

  const Th = ({ label, field }) => (
    <th
      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none whitespace-nowrap"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
    </th>
  )

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

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={28} className="text-[#006044]" /> Investor Records
            </h1>
            <p className="text-gray-500 mt-1">
              Full behavioral intelligence across {investors.length} registered investors.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-500 font-medium cursor-pointer hover:text-gray-700 select-none">
              <input
                type="checkbox"
                checked={showInternal}
                onChange={e => setShowInternal(e.target.checked)}
                className="rounded border-gray-300 text-[#006044] focus:ring-[#006044] transition"
              />
              Show Internal Accounts
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name or email…"
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:border-[#006044] w-72 transition"
              />
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Investors",    value: investors.length,                                       icon: Users },
            { label: "With Investments",   value: investors.filter(u => u.totalInvestments > 0).length,   icon: TrendingUp },
            { label: "High Drop-off Risk", value: highRiskCount,                                          icon: ShieldAlert },
            { label: "Avg Behavior Score", value: investors.length
                ? Math.round(investors.reduce((s, u) => s + (u.score || 0), 0) / investors.length)
                : 0, icon: User },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#006044]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#006044]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Persona Analytics Strip */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star size={13} /> Persona Analytics
          </p>
          <div className="flex flex-wrap gap-3">
            {mostCommonPersona && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                <span className="text-xs text-gray-500">Most Common</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${personaStyle(mostCommonPersona[0])}`}>
                  {mostCommonPersona[0]}
                </span>
                <span className="text-xs text-gray-400">({mostCommonPersona[1]})</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <span className="text-xs text-gray-500">High Risk</span>
              <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                {highRiskCount} investors
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <span className="text-xs text-gray-500">Beginners</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                {beginnerCount} investors
              </span>
            </div>
            {/* Unique personas breakdown */}
            <div className="flex flex-wrap gap-2 ml-auto">
              {Object.entries(personaCounts).slice(0, 4).map(([p, count]) => (
                <span key={p} className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${personaStyle(p)}`}>
                  {p} <span className="opacity-60">({count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th label="Name"          field="name" />
                  <Th label="Persona"       field="persona" />
                  <Th label="Score"         field="score" />
                  <Th label="Drop-off Risk" field="dropoffRisk" />
                  <Th label="Conv. Prob."   field="conversionProbability" />
                  <Th label="Investments"   field="totalInvestments" />
                  <Th label="Portfolio"     field="portfolioValue" />
                  <Th label="Notifications" field="notificationsSent" />
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-400">
                      {search ? "No investors match your search." : "No investors registered yet."}
                    </td>
                  </tr>
                ) : paged.map(inv => (
                  <tr
                    key={inv._id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/records/${encodeURIComponent(inv.email)}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{inv.name}</p>
                      <p className="text-xs text-gray-500">{inv.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {/* Color-coded badge with tooltip */}
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`px-2 py-0.5 rounded border text-xs font-semibold cursor-help ${personaStyle(inv.persona)}`}
                          title={inv.personaTooltip || inv.persona}
                        >
                          {inv.persona}
                        </span>
                        {inv.engagementLevel && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {inv.engagementLevel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#006044] cursor-help" title={inv.scoreReasons?.join('\n') || ''}>
                      {inv.score}
                    </td>
                    <td className="px-4 py-3 cursor-help" title={inv.riskReasons?.join('\n') || ''}>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${RISK_COLOR(inv.dropoffRisk)}`}>
                        {inv.dropoffRisk}%
                      </span>
                    </td>
                    <td className="px-4 py-3 cursor-help" title={inv.convReasons?.join('\n') || ''}>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${RISK_COLOR(100 - inv.conversionProbability)}`}>
                        {inv.conversionProbability}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{inv.totalInvestments}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{(inv.portfolioValue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">{inv.notificationsSent}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/records/${encodeURIComponent(inv.email)}`) }}
                        className="text-xs text-[#006044] font-bold hover:underline whitespace-nowrap"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition font-medium"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  )
}

export default Records
