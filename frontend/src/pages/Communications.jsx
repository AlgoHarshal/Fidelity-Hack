import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Bell, Mail, Filter, CheckCircle, AlertTriangle, Lightbulb, Activity, RefreshCw } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const TYPE_META = {
  Success:        { icon: <CheckCircle size={15} className="text-green-600" />,  bg: "bg-green-50 border-green-100",  text: "text-green-700" },
  Alert:          { icon: <AlertTriangle size={15} className="text-red-500" />,  bg: "bg-red-50 border-red-100",      text: "text-red-700" },
  Insight:        { icon: <Lightbulb size={15} className="text-blue-500" />,     bg: "bg-blue-50 border-blue-100",    text: "text-blue-700" },
  Recommendation: { icon: <Activity size={15} className="text-purple-500" />,    bg: "bg-purple-50 border-purple-100",text: "text-purple-700" },
  Update:         { icon: <Bell size={15} className="text-[#006044]" />,         bg: "bg-[#006044]/5 border-[#006044]/10", text: "text-[#006044]" },
  Warning:        { icon: <AlertTriangle size={15} className="text-amber-500" />,bg: "bg-amber-50 border-amber-100",  text: "text-amber-700" },
}

const Communications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/unauthorized"); return }
    fetch(`${API_URL}/admin/notifications`)
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, navigate])

  const filtered = useMemo(() => {
    return notifications
      .filter(n => filter === "All" || n.type === filter)
      .filter(n => !search || n.userId?.toLowerCase().includes(search.toLowerCase()) || n.title?.toLowerCase().includes(search.toLowerCase()))
  }, [notifications, filter, search])

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const typeCount = useMemo(() => {
    const counts = {}
    notifications.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1 })
    return counts
  }, [notifications])

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
              <Bell size={28} className="text-[#006044]" /> Communications
            </h1>
            <p className="text-gray-500 mt-1">{notifications.length} total notifications dispatched across the platform.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by user or title…"
              className="pl-4 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:border-[#006044] w-56 transition"
            />
          </div>
        </div>

        {/* KPI Strip */}
        <div className="flex gap-3 flex-wrap mb-6">
          {["All", ...Object.keys(typeCount)].map(type => (
            <button
              key={type}
              onClick={() => { setFilter(type); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition shadow-sm ${filter === type ? "bg-[#006044] text-white border-[#006044]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              {type} {type !== "All" && <span className="ml-1 opacity-60">({typeCount[type]})</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-16 text-gray-400">No communications found.</td></tr>
                ) : paged.map(n => {
                  const meta = TYPE_META[n.type] || TYPE_META.Update
                  return (
                    <tr key={n._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border w-fit ${meta.bg} ${meta.text}`}>
                          {meta.icon} {n.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{n.title}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/records/${encodeURIComponent(n.userId)}`)}
                          className="text-xs text-[#006044] hover:underline font-medium"
                        >
                          {n.userId}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{n.message}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.isRead ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700 border border-green-200"}`}>
                          {n.isRead ? "Read" : "Delivered"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(n.timestamp).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-2">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition font-medium">Prev</button>
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 transition font-medium">Next</button>
              </div>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  )
}

export default Communications
