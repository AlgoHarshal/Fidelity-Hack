import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)

  useEffect(() => {

    const storedUser =
      localStorage.getItem("intentEdgeUser")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

  }, [])

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  const login = async (email, password) => {
    // ── Health check: detect offline backend before attempting login ─────
    try {
      await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) })
    } catch {
      throw new Error("Cannot connect to IntentEdge server. Please ensure the backend is running on port 5000.")
    }

    let res, data
    try {
      res  = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password })
      })
      data = await res.json()
    } catch {
      throw new Error("Network connection failed. Please check your internet connection.")
    }

    if (!res.ok) {
      const msg = data.msg || data.message || ""
      if (msg.toLowerCase().includes("invalid") || res.status === 400) {
        throw new Error("Incorrect email or password. Please try again.")
      }
      if (res.status >= 500) {
        throw new Error("Internal server error occurred. Please try again shortly.")
      }
      throw new Error(msg || "Login failed")
    }

    localStorage.setItem("intentEdgeToken", data.token)
    setUser(data.user)
    localStorage.setItem("intentEdgeUser", JSON.stringify(data.user))
    return data.user
  }

  const register = async (name, email, password, investmentGoal, riskAppetite, role = "investor") => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, investmentGoal, riskAppetite })
    })
    
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || data.msg || "Registration failed")
    }
    
    localStorage.setItem("intentEdgeToken", data.token)
    setUser(data.user)
    localStorage.setItem("intentEdgeUser", JSON.stringify(data.user))
    return data.user
  }

  const logout = () => {

    setUser(null)
    localStorage.removeItem("intentEdgeUser")
    localStorage.removeItem("intentEdgeToken")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)