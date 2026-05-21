import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTracking } from "../context/TrackingContext"
import { X, CheckCircle, ShieldCheck, CreditCard, Sparkles, AlertCircle, Loader2 } from "lucide-react"

const CheckoutModal = ({ product, isOpen, onClose }) => {
  const { user } = useAuth()
  const { trackEvent, conversionProbability } = useTracking()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    amount: "5000",
    riskPreference: "Moderate",
    paymentMethod: "UPI",
    termsAccepted: false
  })

  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || ""
      }))
      setStatus("idle")
      setErrorMessage("")
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.termsAccepted) {
      setErrorMessage("Please accept the terms and conditions.")
      return
    }

    setStatus("loading")
    trackEvent("Checkout Started", product?.name)

    try {
      const payload = {
        userId: user?.email || "anonymous_session",
        planName: product?.name,
        amount: Number(formData.amount),
        riskPreference: formData.riskPreference,
        paymentMethod: formData.paymentMethod,
        conversionProbability
      }

      const res = await fetch(`${API_URL}/investments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Payment gateway simulation failed")

      // Success
      trackEvent("Checkout Completed", product?.name)
      // Track a massive point boost to permanently change their persona to highly converted
      trackEvent("Investment Completed", product?.name)
      setStatus("success")
      
    } catch (err) {
      console.error(err)
      setErrorMessage("Failed to process investment. Please try again.")
      setStatus("error")
      trackEvent("Checkout Abandoned", product?.name)
    }
  }

  // --- UI RENDERS ---

  if (status === "success") {
    const isInsurance = product?.category === "Insurance";
    const amountNum = Number(formData.amount);
    
    let projectionLabel = "Projected 5-Year Value";
    let projectionValueText = "";
    let summaryText = "";

    if (isInsurance) {
      if (product?.tag?.includes("Capital Protection") || product?.returnRate?.includes("Guaranteed")) {
        projectionLabel = "Guaranteed Maturity Projection";
        const val = Math.round(amountNum * 5 * 1.35); // 5-year premium sum + 35% growth
        projectionValueText = `₹${val.toLocaleString()}`;
        summaryText = `Based on your selected premium, this ₹${amountNum.toLocaleString()} commitment secures a comprehensive safety net under the ${product?.name} plan. It guarantees capital protection and a secure payout of ${projectionValueText} upon maturity.`;
      } else if (product?.tag?.includes("Wealth + Protection")) {
        projectionLabel = "Estimated Coverage Benefit";
        const val = Math.round(amountNum * 25); // 25x annual coverage multiplier
        projectionValueText = `₹${val.toLocaleString()}`;
        summaryText = `Based on your risk profile, this ₹${amountNum.toLocaleString()} allocation into ${product?.name} balances market-linked wealth creation and a robust ${projectionValueText} active coverage safety net for your family.`;
      } else {
        projectionLabel = "Family Protection Value";
        const val = Math.round(amountNum * 50); // 50x high protection coverage
        projectionValueText = `₹${val.toLocaleString()}`;
        summaryText = `This ₹${amountNum.toLocaleString()} premium commitment into ${product?.name} provides a maximum-leverage family safety shield, securing a ${projectionValueText} tax-free cover under Section 80C guidelines.`;
      }
    } else {
      // Investments
      projectionLabel = "Projected 5-Year Value";
      // Extract numeric return rate safely
      const rateStr = product?.returnRate || "10";
      const match = rateStr.match(/(\d+(\.\d+)?)/);
      const rate = match ? parseFloat(match[1]) : 10.0;
      
      const val = Math.round(amountNum * Math.pow(1 + (rate / 100), 5));
      projectionValueText = `₹${val.toLocaleString()}`;
      summaryText = `Based on your previous browsing behavior and a ${formData.riskPreference.toLowerCase()} risk appetite, this ₹${amountNum.toLocaleString()} allocation into ${product?.name} compounds dynamically over 5 years to achieve an estimated value of ${projectionValueText}.`;
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-md text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#006044] via-[#76A923] to-[#006044] animate-pulse"></div>
          <CheckCircle size={64} className="text-[#006044] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Successful</h2>
          <p className="text-gray-600 mb-6">You've successfully secured your {product?.name}.</p>
          
          <div className="bg-[#006044]/5 border border-[#006044]/20 rounded-lg p-5 mb-8 text-left">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#006044] mb-3">
              <Sparkles size={16} /> IntentEdge Summary
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {summaryText}
            </p>
            <div className="bg-white rounded p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{projectionLabel}</p>
              <p className="text-xl font-bold text-green-700">{projectionValueText}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-[#006044] hover:bg-[#004e36] text-white font-semibold py-3 rounded transition shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-[#006044]" /> Secure Checkout
            </h2>
            <p className="text-sm text-gray-600 mt-1">Completing investment for {product?.name}</p>
          </div>
          <button onClick={() => { 
            if (status !== "success") trackEvent("Checkout Abandoned", product?.name); 
            onClose(); 
          }} className="text-gray-500 hover:text-gray-700 transition bg-white hover:bg-gray-100 border border-gray-200 p-2 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          {status === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:outline-none focus:border-[#006044] transition shadow-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:outline-none focus:border-[#006044] transition shadow-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Investment Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                <input 
                  type="number" 
                  required
                  min={product?.minInvest || 500}
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded pl-8 pr-4 py-3 text-gray-900 focus:outline-none focus:border-[#006044] transition font-mono text-lg shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Risk Preference</label>
                <select 
                  value={formData.riskPreference}
                  onChange={e => setFormData({...formData, riskPreference: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 focus:outline-none focus:border-[#006044] transition appearance-none cursor-pointer shadow-sm"
                >
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="relative">
                  <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-[#006044] transition appearance-none cursor-pointer shadow-sm"
                  >
                    <option>UPI / NetBanking</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                  </select>
                  <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.termsAccepted}
                onChange={e => setFormData({...formData, termsAccepted: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-[#006044] focus:ring-[#006044] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                I agree to the <span className="text-[#006044] font-semibold hover:underline">Terms of Service</span> and <span className="text-[#006044] font-semibold hover:underline">Risk Disclosures</span>.
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={() => { 
              if (status !== "success") trackEvent("Checkout Abandoned", product?.name); 
              onClose(); 
            }}
            className="px-6 py-2.5 rounded font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm"
            disabled={status === "loading"}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="flex items-center justify-center min-w-[140px] px-6 py-2.5 bg-[#006044] hover:bg-[#004e36] disabled:bg-[#006044]/50 rounded font-semibold text-white transition shadow-sm relative overflow-hidden group"
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="relative z-10">Confirm Payment</span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  )
}

export default CheckoutModal
