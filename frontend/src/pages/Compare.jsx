import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CheckoutModal from "../components/CheckoutModal"
import { products } from "../data/products"
import { useTracking } from "../context/TrackingContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { GitCompare, Check, Plus, Trash2, ArrowRight } from "lucide-react"

const CATEGORIES = [
  { id: "SIP", label: "SIP Investments" },
  { id: "Mutual Funds", label: "Mutual Funds" },
  { id: "Retirement", label: "Retirement Plans" },
  { id: "Insurance", label: "Insurance Plans" }
]

const ROWS = [
  { label: "Avg Returns",       key: "returnRate" },
  { label: "Risk Level",        key: "risk" },
  { label: "Minimum Investment",key: "minInvest" },
  { label: "Lock-in Period",    key: "lockIn" },
  { label: "Tax Benefits",      key: "taxBenefits" },
  { label: "Recommended For",   key: "recommendedFor" },
  { label: "Category",          key: "category" },
  { label: "Description",       key: "description" }
]

const RISK_COLOR = { 
  "Zero": "text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded",
  "Zero Risk": "text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded",
  "Low": "text-[#006044] font-semibold bg-green-50/50 border border-[#006044]/20 px-2 py-0.5 rounded",
  "Low Risk": "text-[#006044] font-semibold bg-green-50/50 border border-[#006044]/20 px-2 py-0.5 rounded",
  "Very Low": "text-[#006044] font-semibold bg-green-50/30 border border-[#006044]/10 px-2 py-0.5 rounded",
  "Moderate": "text-orange-600 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded",
  "High": "text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded",
  "Very High": "text-red-700 font-bold bg-red-50 border border-red-300 px-2 py-0.5 rounded"
}

const getTaxBenefit = (product) => {
  if (product.category === "SIP") return "Section 80C deductions eligible"
  if (product.category === "Mutual Funds") return "LTCG tax standard rules"
  if (product.category === "Retirement") return "Section 80CCD pension benefits"
  if (product.category === "Insurance") return "Section 80C premium tax exemption"
  return "Tax-efficient wealth creation"
}

const Compare = () => {
  usePageTracking("Compare Plans")
  const { trackEvent } = useTracking()

  const [activeCategory, setActiveCategory] = useState("SIP")
  const [selectedIds, setSelectedIds] = useState(["sip_1", "mf_1"])
  const [checkoutProduct, setCheckoutProduct] = useState(null)

  // Toggle selection
  const toggleProduct = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id))
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare a maximum of 4 products at the same time.")
        return
      }
      setSelectedIds(prev => [...prev, id])
      const prod = products.find(p => p.id === id)
      if (prod) {
        trackEvent("Compare Clicked", prod.name)
      }
    }
  }

  const removeProduct = (id) => {
    setSelectedIds(prev => prev.filter(item => item !== id))
  }

  const clearAll = () => {
    setSelectedIds([])
  }

  const activePlans = products.filter(p => selectedIds.includes(p.id))
  const categoryProducts = products.filter(p => p.category === activeCategory)

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />

      {/* Hero Header */}
      <section className="text-center px-4 py-16 bg-white border-b border-gray-200">
        <div className="inline-flex items-center gap-2 bg-[#006044]/10 border border-[#006044]/20 text-[#006044] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
          <GitCompare size={16} /> Dynamic Comparison Center
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#006044]">Side-by-Side Analysis</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select and compare up to 4 investment products across different asset classes to make an optimal, data-backed choice.
        </p>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 space-y-10">
        
        {/* Dynamic Selector Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">1. Select Products to Analyze</h2>
              <p className="text-sm text-gray-500 mt-1">Browse categories and check products to add them to your comparison dashboard.</p>
            </div>
            {selectedIds.length > 0 && (
              <button 
                onClick={clearAll} 
                className="text-xs font-bold text-red-600 hover:text-red-800 transition px-3 py-1.5 rounded bg-red-50 hover:bg-red-100"
              >
                Clear All ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded font-bold text-sm transition border ${
                  activeCategory === cat.id
                    ? "bg-[#006044] border-[#006044] text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:text-[#006044] hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products List for active category */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryProducts.map(p => {
              const isSelected = selectedIds.includes(p.id)
              return (
                <div 
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition relative flex flex-col justify-between group shadow-sm ${
                    isSelected 
                      ? "border-[#006044] bg-[#006044]/5" 
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#006044] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">{p.category}</span>
                    <h4 className="font-bold text-gray-900 group-hover:text-[#006044] transition text-sm">{p.name}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-green-700 font-bold">{p.returnRate}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{p.risk} Risk</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Dashboard Summary */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-100/60 border border-gray-200/80 rounded-xl p-4">
          <span className="text-sm text-gray-600 font-bold">Currently Comparing:</span>
          {activePlans.length === 0 ? (
            <span className="text-sm text-gray-500 italic">No products selected. Please select at least one product above.</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activePlans.map(p => (
                <span 
                  key={`tag-${p.id}`} 
                  className="inline-flex items-center gap-1.5 bg-[#006044]/10 border border-[#006044]/20 text-[#006044] px-3 py-1.5 rounded font-bold text-xs shadow-sm"
                >
                  {p.name}
                  <button 
                    onClick={() => removeProduct(p.id)} 
                    className="text-[#006044] hover:text-red-600 transition font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rebuilt Comparison Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {activePlans.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <GitCompare className="mx-auto mb-4 opacity-30 text-gray-300" size={56} />
                <h3 className="text-xl font-bold text-gray-900 mb-1">Your Comparison Table is Empty</h3>
                <p className="text-sm max-w-sm mx-auto text-gray-500">
                  Select products from the catalog above to view dynamic side-by-side financial metrics.
                </p>
              </div>
            ) : (
              <table className="w-full table-fixed min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="text-left px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs w-48 sticky left-0 bg-gray-50/70 z-10 border-r border-gray-200">
                      Product Metrics
                    </th>
                    {activePlans.map(p => (
                      <th key={p.id} className="px-6 py-5 text-left border-r border-gray-100 last:border-r-0 relative group">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                              {p.category}
                            </span>
                            <h3 className="text-base font-bold text-[#006044] truncate">{p.name}</h3>
                          </div>
                          <button
                            onClick={() => removeProduct(p.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Remove from comparison"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ROWS.map((row, ri) => (
                    <tr key={row.key} className={`${ri % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      {/* Metric Label */}
                      <td className="px-6 py-4 text-gray-700 text-sm font-bold sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] bg-inherit">
                        {row.label}
                      </td>

                      {/* Product Data */}
                      {activePlans.map(p => {
                        let content = p[row.key]
                        
                        if (row.key === "minInvest") {
                          content = `₹${p.minInvest.toLocaleString()}`
                          if (p.category === "SIP") content += " / month"
                          if (p.category === "Insurance") content += " / year"
                        }
                        if (row.key === "taxBenefits") {
                          content = getTaxBenefit(p)
                        }
                        if (row.key === "recommendedFor") {
                          content = p.tag || "General Wealth Building"
                        }

                        return (
                          <td key={`${p.id}-${row.key}`} className="px-6 py-4 text-sm text-gray-800 border-r border-gray-100 last:border-r-0 leading-relaxed font-medium">
                            {row.key === "risk" ? (
                              <span className={RISK_COLOR[p.risk] || "text-gray-900"}>
                                {p.risk}
                              </span>
                            ) : row.key === "returnRate" ? (
                              <span className="text-green-700 font-extrabold text-base">
                                {p.returnRate}
                              </span>
                            ) : (
                              content
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  
                  {/* Action CTA Row */}
                  <tr className="bg-gray-50/50">
                    <td className="px-6 py-6 text-gray-500 text-xs font-bold uppercase tracking-wider sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] bg-inherit">
                      Investment Action
                    </td>
                    {activePlans.map(p => (
                      <td key={`cta-${p.id}`} className="px-6 py-6 border-r border-gray-100 last:border-r-0">
                        <button
                          onClick={() => {
                            trackEvent("Invest Clicked", p.name)
                            setCheckoutProduct(p)
                          }}
                          className="w-full bg-[#006044] hover:bg-[#004e36] text-white py-3 rounded font-bold text-sm shadow-sm transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          Invest Now <ArrowRight size={14} />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      <Footer />

      {/* Checkout Modal Integration */}
      <CheckoutModal 
        product={checkoutProduct} 
        isOpen={!!checkoutProduct} 
        onClose={() => setCheckoutProduct(null)} 
      />
    </div>
  )
}

export default Compare
