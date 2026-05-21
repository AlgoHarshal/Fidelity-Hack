import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { BarChart2, TrendingUp, ShieldAlert, Users, Percent } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const COLORS = ["#006044", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"]

const MarketInsights = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/unauthorized"); return }
    fetch(`${API_URL}/admin/market-insights`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006044]" />
      </div>
    </div>
  )

  const kpis = [
    { label: "Conversion Rate",     value: `${data?.conversionRate || 0}%`,    icon: TrendingUp,  color: "text-green-700" },
    { label: "Insurance Gap",       value: `${data?.insuranceGapPct || 0}%`,   icon: ShieldAlert, color: "text-red-600" },
    { label: "Total Investments",   value: data?.totalInvestments || 0,         icon: Users,       color: "text-[#006044]" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart2 size={28} className="text-[#006044]" /> Market Insights
          </h1>
          <p className="text-gray-500 mt-1">Aggregated platform-wide product performance and investor behavior analytics.</p>
        </div>

        {/* KPI Strip */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#006044]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-[#006044]" />
              </div>
              <div>
                <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Most Compared Products */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-5 text-sm uppercase tracking-wide">Most Compared Products</h3>
            {data?.mostCompared?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.mostCompared} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="plan" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {data.mostCompared.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No comparison data yet.</p>}
          </div>

          {/* Category Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-5 text-sm uppercase tracking-wide">Investment Category Distribution</h3>
            {data?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.categoryDistribution} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {data.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No investment data yet.</p>}
          </div>
        </div>

        {/* Insurance Gap Alert */}
        {parseInt(data?.insuranceGapPct) > 50 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <ShieldAlert size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Insurance Coverage Gap Detected</p>
              <p className="text-sm text-red-600 mt-1">
                {data.insuranceGapPct}% of your investors currently have no insurance coverage in their portfolio.
                Consider triggering targeted "Missing Protection" notification campaigns.
              </p>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}

export default MarketInsights
