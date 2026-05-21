import { BrowserRouter, Routes, Route } from "react-router-dom"

// Core pages
import Home          from "./pages/Home"
import Login         from "./pages/Login"
import Investments   from "./pages/Investments"
import DashboardPage from "./pages/DashboardPage"
import ProtectedRoute from "./components/ProtectedRoute"

// Investor pages
import Signup        from "./pages/Signup"
import Compare       from "./pages/Compare"
import Profile       from "./pages/Profile"
import Portfolio     from "./pages/Portfolio"
import Settings      from "./pages/Settings"
import Unauthorized  from "./pages/Unauthorized"

// Admin pages
import Records         from "./pages/Records"
import RecordDetail    from "./pages/RecordDetail"
import Communications  from "./pages/Communications"
import MarketInsights  from "./pages/MarketInsights"
import SystemActivity  from "./pages/SystemActivity"

import AIAssistant   from "./components/AIAssistant"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"            element={<Home />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/compare"     element={<Compare />} />
        <Route path="/settings"    element={<Settings />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Investor-protected routes ── */}
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />

        {/* ── Admin-only routes ── */}
        <Route path="/dashboard"       element={<ProtectedRoute adminOnly={true}><DashboardPage /></ProtectedRoute>} />
        <Route path="/records"         element={<ProtectedRoute adminOnly={true}><Records /></ProtectedRoute>} />
        <Route path="/records/:userId" element={<ProtectedRoute adminOnly={true}><RecordDetail /></ProtectedRoute>} />
        <Route path="/communications"  element={<ProtectedRoute adminOnly={true}><Communications /></ProtectedRoute>} />
        <Route path="/market-insights" element={<ProtectedRoute adminOnly={true}><MarketInsights /></ProtectedRoute>} />
        <Route path="/system-activity" element={<ProtectedRoute adminOnly={true}><SystemActivity /></ProtectedRoute>} />
      </Routes>
      <AIAssistant />
    </BrowserRouter>
  )
}

export default App