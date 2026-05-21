import React, { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { usePageTracking } from "../hooks/usePageTracking"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { products } from "../data/products"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Briefcase, TrendingUp, ShieldCheck, Download, AlertCircle, Filter, Activity, PieChart as PieChartIcon } from "lucide-react"
import { Link } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Color scheme for categories
const CATEGORY_COLORS = {
  "SIP": "#006044",           // Fidelity Green
  "Mutual Funds": "#0ea5e9",  // Sky Blue
  "Insurance": "#8b5cf6",     // Violet
  "Retirement": "#f59e0b",    // Amber
}

const extractNumericRate = (rateStr) => {
  if (!rateStr) return 10
  const match = rateStr.match(/(\d+(\.\d+)?)/)
  return match ? parseFloat(match[1]) : 10
}

const calculateProjection = (amount, product) => {
  const isInsurance = product?.category === "Insurance"
  if (isInsurance) {
    if (product?.tag?.includes("Capital Protection") || product?.returnRate?.includes("Guaranteed")) {
      return Math.round(amount * 5 * 1.35)
    } else if (product?.tag?.includes("Wealth + Protection")) {
      return Math.round(amount * 25)
    } else {
      return Math.round(amount * 50)
    }
  } else {
    const rate = extractNumericRate(product?.returnRate)
    return Math.round(amount * Math.pow(1 + (rate / 100), 5))
  }
}

const Portfolio = () => {
  usePageTracking("Portfolio")
  const { user } = useAuth()
  
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user?.email) return
      try {
        const res = await fetch(`${API_URL}/investments/user/${user.email}`)
        if (res.ok) {
          const data = await res.json()
          setInvestments(data)
        }
      } catch (error) {
        console.error("Error fetching investments:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvestments()
  }, [user])

  // Enhance investments with product data
  const enrichedInvestments = useMemo(() => {
    return investments.map(inv => {
      const product = products.find(p => p.name === inv.planName)
      const projectedValue = calculateProjection(inv.amount, product)
      return {
        ...inv,
        product,
        category: product?.category || "Other",
        projectedValue,
        isInsurance: product?.category === "Insurance"
      }
    })
  }, [investments])

  // Aggregated Summary Data
  const summary = useMemo(() => {
    const totalInvested = enrichedInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const totalProjected = enrichedInvestments.reduce((sum, inv) => sum + (inv.projectedValue || 0), 0)
    
    // Distribution for Pie Chart
    const distMap = {}
    enrichedInvestments.forEach(inv => {
      const cat = inv.category
      distMap[cat] = (distMap[cat] || 0) + inv.amount
    })
    
    const distribution = Object.keys(distMap).map(key => ({
      name: key,
      value: distMap[key]
    }))

    return { totalInvested, totalProjected, distribution, activeCount: enrichedInvestments.length }
  }, [enrichedInvestments])

  // Intelligent Insights Generator
  const insights = useMemo(() => {
    if (enrichedInvestments.length === 0) return []
    const messages = []
    
    const hasSIP = enrichedInvestments.some(i => i.category === "SIP")
    const hasIns = enrichedInvestments.some(i => i.isInsurance)
    const hasRet = enrichedInvestments.some(i => i.category === "Retirement")
    const hasMF = enrichedInvestments.some(i => i.category === "Mutual Funds")

    if (hasSIP && hasMF) messages.push("Your portfolio is heavily weighted toward high-growth equities.")
    if (hasIns) messages.push("Your insurance plans provide strong capital protection and family security.")
    if (!hasRet) messages.push("You may benefit from diversifying into long-term retirement products.")
    if (hasSIP && hasIns && hasRet) messages.push("Excellent diversification across growth, protection, and long-term planning.")
    
    // Fallback if not many conditions met
    if (messages.length < 2) {
      messages.push(`You currently have ${enrichedInvestments.length} active plans compounding your wealth.`)
    }
    return messages
  }, [enrichedInvestments])

  // Health & Smart Badges
  const { healthStatus, badges, diversificationScore } = useMemo(() => {
    if (enrichedInvestments.length === 0) return { healthStatus: "No Data", badges: [], diversificationScore: 0 }
    
    const categoriesPresent = new Set(enrichedInvestments.map(i => i.category)).size
    let healthStatus = "Moderate"
    let score = categoriesPresent * 25
    
    if (categoriesPresent >= 3) {
      healthStatus = "Excellent"
    } else if (categoriesPresent === 2) {
      healthStatus = "Healthy"
    } else {
      healthStatus = "Needs Diversification"
    }

    const b = []
    if (categoriesPresent >= 3) b.push("Diversified Portfolio")
    if (enrichedInvestments.some(i => i.category === "SIP" || i.category === "Mutual Funds")) b.push("High Growth Focus")
    if (enrichedInvestments.some(i => i.category === "Retirement")) b.push("Long-Term Planner")
    if (enrichedInvestments.some(i => i.isInsurance)) b.push("Protected Investor")

    return { healthStatus, badges: b, diversificationScore: score }
  }, [enrichedInvestments])

  const filteredInvestments = useMemo(() => {
    if (filter === "All") return enrichedInvestments
    return enrichedInvestments.filter(inv => inv.category === filter)
  }, [enrichedInvestments, filter])

  const downloadCSV = () => {
    if (enrichedInvestments.length === 0) return
    const headers = "Plan Name,Category,Amount Invested,Projected Value,Date\n"
    const rows = enrichedInvestments.map(inv => 
      `"${inv.planName}","${inv.category}",${inv.amount},${inv.projectedValue},"${new Date(inv.timestamp).toLocaleDateString()}"`
    ).join("\n")
    
    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "intentedge_portfolio_summary.csv"
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006044]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-[#006044]/20">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-4xl font-extrabold text-[#006044] mb-2 tracking-tight">Investment Portfolio</h1>
            <p className="text-gray-600 text-lg">Manage, track, and optimize your wealth creation journey.</p>
          </div>
          {enrichedInvestments.length > 0 && (
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-[#006044] hover:border-[#006044] transition px-4 py-2 rounded shadow-sm font-semibold text-sm animate-in fade-in duration-700"
            >
              <Download size={16} /> Export CSV
            </button>
          )}
        </div>

        {enrichedInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Briefcase size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Investments Yet</h2>
            <p className="text-gray-500 mb-8 max-w-md">Your portfolio is currently empty. Start building your wealth by exploring our curated investment plans.</p>
            <Link 
              to="/investments" 
              className="bg-[#006044] hover:bg-[#004e36] text-white px-8 py-3 rounded font-bold transition shadow-md"
            >
              Explore Investments
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Briefcase size={14} className="text-blue-500"/> Total Invested</p>
                <p className="text-3xl font-extrabold text-gray-900">₹{summary.totalInvested.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#006044]/5 rounded-bl-full"></div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={14} className="text-[#006044]"/> Projected Value (5Y)</p>
                <p className="text-3xl font-extrabold text-[#006044]">₹{summary.totalProjected.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity size={14} className="text-green-500"/> Est. Growth</p>
                <p className="text-3xl font-extrabold text-gray-900">+₹{(summary.totalProjected - summary.totalInvested).toLocaleString()}</p>
                <p className="text-xs text-green-600 font-bold mt-1">+{((summary.totalProjected / summary.totalInvested - 1) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Plans</p>
                <p className="text-3xl font-extrabold text-gray-900">{summary.activeCount}</p>
              </div>
            </div>

            {/* Smart Analytics Section */}
            <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {/* Distribution Chart */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm lg:col-span-1 flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide w-full mb-2">Asset Allocation</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={summary.distribution} 
                        cx="50%" cy="50%" 
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {summary.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#CBD5E1"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Portfolio Insights & Health */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Portfolio Insights</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${healthStatus === 'Excellent' ? 'bg-green-50 text-green-700 border-green-200' : healthStatus === 'Healthy' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      Health: {healthStatus}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5"><CheckCircle size={16} className="text-[#006044]" /></div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {badges.map((badge, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-600">Diversification Score</span>
                      <span className="text-[#006044]">{diversificationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#006044] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${diversificationScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & List */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-900">Your Investments</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                  {["All", "SIP", "Mutual Funds", "Retirement", "Insurance"].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm border ${filter === cat ? 'bg-[#006044] text-white border-[#006044]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInvestments.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <Filter size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No plans found for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredInvestments.map((inv, idx) => {
                    const isIns = inv.isInsurance
                    return (
                      <div key={inv._id || idx} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="inline-block px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider uppercase mb-2 text-white shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[inv.category] || "#64748b" }}>
                                {inv.category}
                              </span>
                              <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#006044] transition-colors">{inv.planName}</h4>
                              <p className="text-xs text-gray-500 mt-1">Purchased on {new Date(inv.timestamp).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200 flex items-center gap-1">
                              {isIns ? <ShieldCheck size={12}/> : <TrendingUp size={12}/>} 
                              {isIns ? "Protected" : "Active"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Invested</p>
                              <p className="text-base font-bold text-gray-900">₹{inv.amount.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Risk Level</p>
                              <p className="text-sm font-bold text-gray-700">{inv.product?.risk || inv.riskPreference}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              {isIns ? (inv.product?.tag?.includes("Wealth") ? "Est. Coverage" : "Maturity Projection") : "Projected 5Y Value"}
                            </p>
                            <p className="text-xl font-extrabold text-[#006044]">
                              ₹{inv.projectedValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target</p>
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {inv.product?.tag || "Growth"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

// Temporary internal component replacement for CheckCircle to avoid missing imports if lucide-react doesn't have it explicitly bound
const CheckCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

export default Portfolio
