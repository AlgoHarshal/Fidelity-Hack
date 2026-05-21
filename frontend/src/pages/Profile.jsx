import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useTracking } from "../context/TrackingContext"
import { useAuth } from "../context/AuthContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { User, Activity, Clock, Edit2, Check, Camera, CheckCircle } from "lucide-react"
import { useState } from "react"

const FINANCIAL_ACTIONS = [
  'Investment Completed', 
  'Checkout Completed', 
  'Product Purchased', 
  'Policy Activated', 
  'SIP Started', 
  'Retirement Plan Purchased', 
  'Insurance Purchased'
]

const Profile = () => {
  usePageTracking("Profile")
  const { user } = useAuth()
  const { events, totalTimeSpent } = useTracking()

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "Guest Investor",
    email: user?.email || "—"
  })

  const handleSave = () => {
    setIsEditing(false)
  }

  // Filter out noisy behavioral events
  const timelineEvents = events.filter(ev => FINANCIAL_ACTIONS.includes(ev.action))

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />

      <section className="px-8 py-16 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-bold mb-2 text-[#006044]">Investor Profile</h1>
        <p className="text-gray-600 mb-12">Manage your account and view your financial activity history.</p>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ── Left: Identity & Session ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Avatar + identity */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 text-center relative group">
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition bg-gray-50 p-1.5 rounded-full"
              >
                {isEditing ? <Check size={18} className="text-[#006044]" /> : <Edit2 size={16} />}
              </button>
              
              <div className="w-28 h-28 bg-gray-50 border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 relative cursor-pointer group-hover:border-[#006044] transition shadow-sm">
                <User className="text-gray-400 group-hover:text-[#006044] transition" size={48} />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-3 mt-4">
                  <input 
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-center focus:border-[#006044] shadow-sm outline-none text-gray-900" 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                  />
                  <input 
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-center text-sm focus:border-[#006044] shadow-sm outline-none text-gray-900" 
                    value={profileData.email}
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{profileData.email}</p>
                </>
              )}
              
              <span className="inline-block mt-5 bg-[#006044]/5 border border-[#006044]/20 text-[#006044] font-semibold text-xs px-4 py-1.5 rounded-full capitalize">
                {user?.role || "user"}
              </span>
            </div>

            {/* Quick stats */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Account Overview</h3>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2 font-medium"><Clock size={16} className="text-[#006044]"/> Active Time</span>
                <span className="font-bold text-gray-900">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2 font-medium"><Activity size={16} className="text-[#006044]"/> Total Actions</span>
                <span className="font-bold text-gray-900">{events.length}</span>
              </div>
            </div>
          </div>

          {/* ── Right: Journey timeline ── */}
          <div className="lg:col-span-8 bg-white border border-gray-200 shadow-sm rounded-xl p-8 flex flex-col h-full min-h-[500px]">
            <h3 className="text-gray-500 text-xs font-bold mb-8 uppercase tracking-wider">
              Transaction History
            </h3>
            
            {timelineEvents.length === 0 ? (
              <div className="text-center text-gray-400 py-16 flex-1 flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Activity size={32} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-600">No financial transactions recorded yet.</p>
                <p className="text-sm mt-1 max-w-sm">Completed investments and purchases will appear here as a timeline.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200"></div>
                
                {timelineEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-4 relative animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                    <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <CheckCircle size={16} className="text-[#006044]" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-base font-bold text-gray-900">{ev.action}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {ev.plan !== "-" ? <span className="font-medium text-[#006044]">{ev.plan}</span> : ""} 
                        {ev.plan !== "-" && " · "} 
                        {ev.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Profile
