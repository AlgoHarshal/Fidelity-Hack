import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, TrendingUp, ShieldCheck, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"

// No demo credentials needed anymore

const Login = () => {
  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError,    setAuthError]    = useState("")
  const [isLoading,    setIsLoading]    = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleLogin = async (emailVal, passwordVal) => {
    setAuthError("")
    const e = emailVal    ?? email
    const p = passwordVal ?? password

    if (!e || !p) {
      setAuthError("Email and password are required.")
      return
    }

    setIsLoading(true)
    try {
      const user = await login(e, p)
      navigate(user.role === "admin" ? "/dashboard" : "/investments")
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo Mark & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <TrendingUp className="text-[#006044]" size={32} />
            <span className="text-3xl font-extrabold text-[#006044] tracking-tight">IntentEdge</span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-8">Institutional Wealth Intelligence Platform</p>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Log In</h1>
          <p className="text-sm text-gray-500">Access your secure investment dashboard.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-8 py-10">

          {/* Error */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="mt-0.5">⚠</span>
              <span>{authError}</span>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#006044] focus:ring-2 focus:ring-[#006044]/10 outline-none transition text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-300 focus:border-[#006044] focus:ring-2 focus:ring-[#006044]/10 outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={() => handleLogin()}
            disabled={isLoading}
            className="w-full bg-[#006044] hover:bg-[#004e36] text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Authenticating…
              </span>
            ) : "Log In"}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-600 mt-7 pt-6 border-t border-gray-100">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#006044] hover:underline font-semibold transition">
              Open an Account
            </Link>
          </p>

        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 IntentEdge · SEBI Registered · Secured by 256-bit Encryption
        </p>
      </div>
    </div>
  )
}

export default Login