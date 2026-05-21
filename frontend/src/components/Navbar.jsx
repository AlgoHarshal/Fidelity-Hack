import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTracking } from "../context/TrackingContext"
import {
  Menu, X, ChevronDown, LogOut, TrendingUp,
  LayoutDashboard, Users, MessageSquare, BarChart2, Cpu, Shield
} from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"

// ─── Admin navigation links ───────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { to: "/records",         label: "Records",          icon: Users           },
  { to: "/communications",  label: "Communications",   icon: MessageSquare   },
  { to: "/market-insights", label: "Market Insights",  icon: BarChart2       },
  { to: "/system-activity", label: "System Activity",  icon: Cpu             },
]

// ─── Investor navigation links ────────────────────────────────────────────────
const INVESTOR_NAV = [
  { to: "/",            label: "Home"        },
  { to: "/investments", label: "Investments" },
  { to: "/compare",     label: "Compare"     },
  { to: "/profile",     label: "Profile"     },
  { to: "/portfolio",   label: "Portfolio"   },
]

const Navbar = () => {
  const { user, logout }   = useAuth()
  const navigate           = useNavigate()
  const location           = useLocation()
  const isAdmin            = user?.role === "admin"

  const [menuOpen,       setMenuOpen]       = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [dropdownOpen,   setDropdownOpen]   = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowLogoutModal(false)
    setMenuOpen(false)
    navigate("/")
  }

  const navLinks = isAdmin ? ADMIN_NAV : (user ? INVESTOR_NAV : INVESTOR_NAV.slice(0, 3))
  const headerBg = isAdmin ? "bg-[#002d1e]" : "bg-[#006044]"
  const activeLinkCls = (to) =>
    location.pathname === to ? "text-[#006044] font-bold" : "text-gray-600 hover:text-[#006044]"

  return (
    <div className="sticky top-0 z-50 shadow-sm flex flex-col">

      {/* ── Top Tier ── */}
      <div className={`${headerBg} text-white px-6 md:px-12 py-4 flex justify-between items-center transition-colors duration-300`}>

        {/* Logo */}
        <Link to={isAdmin ? "/dashboard" : "/"} className="flex items-center gap-2">
          <TrendingUp className="text-white" size={32} />
          <span className="text-xl font-bold tracking-tight">IntentEdge</span>
          {isAdmin && (
            <span className="ml-2 bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">
              ADMIN
            </span>
          )}
        </Link>

        {/* Desktop right-side controls */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white hover:text-gray-200 font-medium text-sm transition">Log In</Link>
              <Link to="/signup" className="bg-white text-[#006044] hover:bg-gray-100 px-5 py-2 rounded font-semibold text-sm transition shadow-sm">
                Open an Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Only investors get notification bell */}
              {!isAdmin && <NotificationDropdown />}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-gray-200 transition"
                >
                  {isAdmin ? (
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Shield size={16} />
                      Admin Control Center
                    </span>
                  ) : (
                    <span className="font-medium text-sm">
                      Welcome, {user.name?.split(" ")[0] || "Investor"}
                    </span>
                  )}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <p className="font-bold text-gray-900 truncate">{user.name || (isAdmin ? "Administrator" : "Investor")}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${isAdmin ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-[#006044]/10 border border-[#006044]/20 text-[#006044]"}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => { setDropdownOpen(false); setShowLogoutModal(true) }}
                        className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2 transition font-medium mt-1"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-4">
          {user && !isAdmin && <NotificationDropdown />}
          <button
            className="text-white hover:text-gray-200 transition"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Bottom Tier: Navigation Links ── */}
      <div className={`hidden md:flex px-6 md:px-12 py-3 border-b border-gray-200 justify-center ${isAdmin ? "bg-gray-900" : "bg-white"}`}>
        <ul className="flex gap-8">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              {isAdmin ? (
                <Link
                  to={to}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition pb-0.5 border-b-2 ${
                    location.pathname === to
                      ? "text-emerald-400 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-300 border-transparent"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  {label}
                </Link>
              ) : (
                <Link
                  to={to}
                  className={`text-base font-medium transition pb-0.5 border-b-2 ${
                    location.pathname === to
                      ? "text-[#006044] border-[#006044]"
                      : "text-gray-600 hover:text-[#006044] border-transparent"
                  }`}
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div className={`absolute top-[69px] left-0 right-0 border-b border-gray-200 px-6 py-4 space-y-1 md:hidden z-50 shadow-lg ${isAdmin ? "bg-gray-900" : "bg-white"}`}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 font-medium py-2.5 border-b last:border-0 transition ${isAdmin ? "text-gray-300 hover:text-emerald-400 border-gray-700" : "text-gray-700 hover:text-[#006044] border-gray-100"}`}
            >
              {Icon && <Icon size={16} />}
              {label}
            </Link>
          ))}
          <div className="pt-3">
            {user ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Log Out
              </button>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-white border border-[#006044] text-[#006044] py-3 rounded font-semibold transition">Log In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-[#006044] hover:bg-[#004e36] text-white py-3 rounded font-semibold transition">Open an Account</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-6 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to securely log out of your session?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded font-semibold transition">Cancel</button>
              <button onClick={handleLogout} className="flex-1 bg-[#006044] hover:bg-[#004e36] text-white py-2.5 rounded font-semibold transition">Log Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Navbar