import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useTracking } from "../context/TrackingContext"
import { useAuth } from "../context/AuthContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { User, Mail, Lock, Target, ShieldCheck, CheckCircle, Eye, EyeOff } from "lucide-react"

const GOALS = ["Wealth Creation", "Retirement Planning", "Child Education", "Emergency Fund", "Tax Saving"]
const RISK_LEVELS = ["Conservative (Low Risk)", "Moderate (Medium Risk)", "Aggressive (High Risk)"]

const Signup = () => {
  usePageTracking("Signup")
  const navigate   = useNavigate()
  const { trackFormStarted, trackFormCompleted, trackFormAbandoned } = useTracking()
  const { register } = useAuth()

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", goal: "", risk: "" })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const formTouched = useRef(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (!formTouched.current) {
      formTouched.current = true
      trackFormStarted("Signup Form")
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = "Name is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) e.email = "Please enter a valid email address (e.g. name@example.com)"
    if (form.password.length < 6)  e.password = "Min 6 characters"
    if (form.password !== form.confirm) e.confirm = "Passwords do not match"
    if (!form.goal)            e.goal     = "Select an investment goal"
    if (!form.risk)            e.risk     = "Select risk appetite"
    return e
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    
    try {
      setIsLoading(true)
      await register(form.name, form.email, form.password, form.goal, form.risk, "investor")
      trackFormCompleted("Signup Form")
      setSubmitted(true)
      setTimeout(() => navigate("/investments"), 2000)
    } catch (err) {
      setErrors({ api: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavAway = () => {
    if (formTouched.current && !submitted) trackFormAbandoned("Signup Form")
    navigate("/login")
  }

  if (submitted) {
    return (
      <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
          <CheckCircle className="text-[#006044] mx-auto mb-6" size={72} />
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Account Created</h2>
          <p className="text-gray-600">Redirecting you to investment plans…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />
      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#006044]/10 border border-[#006044]/20 text-[#006044] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-5">
              <ShieldCheck size={16} /> Secure Registration
            </div>
            <h1 className="text-4xl font-bold mb-3 text-gray-900">Open an Account</h1>
            <p className="text-gray-600">Start your investment journey in under 2 minutes.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
          >
            {errors.api && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {errors.api}
              </div>
            )}
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className="w-full bg-white border border-gray-300 focus:border-[#006044] rounded pl-11 pr-4 py-3 outline-none transition shadow-sm"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="rahul@example.com"
                  className="w-full bg-white border border-gray-300 focus:border-[#006044] rounded pl-11 pr-4 py-3 outline-none transition shadow-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full bg-white border border-gray-300 focus:border-[#006044] rounded pl-11 pr-12 py-3 outline-none transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="confirm" type={showConfirmPassword ? "text" : "password"} value={form.confirm} onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full bg-white border border-gray-300 focus:border-[#006044] rounded pl-11 pr-12 py-3 outline-none transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1.5">{errors.confirm}</p>}
              </div>
            </div>

            {/* Investment Goal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Target size={14} className="inline mr-1" /> Investment Goal
              </label>
              <select
                name="goal" value={form.goal} onChange={handleChange}
                className="w-full bg-white border border-gray-300 focus:border-[#006044] rounded px-4 py-3 outline-none transition shadow-sm text-gray-700"
              >
                <option value="">Select your primary goal</option>
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.goal && <p className="text-red-500 text-xs mt-1.5">{errors.goal}</p>}
            </div>

            {/* Risk Appetite */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Appetite</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RISK_LEVELS.map((r) => (
                  <button
                    key={r} type="button"
                    onClick={() => { setForm((p) => ({ ...p, risk: r })); if (!formTouched.current) { formTouched.current = true; trackFormStarted("Signup Form") } }}
                    className={`px-3 py-3 rounded text-sm font-medium border transition-all ${form.risk === r ? "border-[#006044] bg-[#006044]/5 text-[#006044]" : "border-gray-300 text-gray-600 hover:border-[#006044]/50 hover:bg-gray-50"}`}
                  >
                    {r.split(" ")[0]}
                  </button>
                ))}
              </div>
              {errors.risk && <p className="text-red-500 text-xs mt-1.5">{errors.risk}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006044] hover:bg-[#004e36] text-white py-3.5 rounded font-bold text-lg transition disabled:opacity-50 shadow-sm mt-4"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-gray-600 text-sm pt-2">
              Already have an account?{" "}
              <button type="button" onClick={handleNavAway} className="text-[#006044] hover:underline font-semibold">
                Log In
              </button>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Signup
