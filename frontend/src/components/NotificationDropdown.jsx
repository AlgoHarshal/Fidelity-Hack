import React, { useState, useRef, useEffect } from "react"
import { Bell, CheckCircle, AlertTriangle, Lightbulb, Activity, ArrowRight, X } from "lucide-react"
import { useNotifications } from "../context/NotificationContext"
import { useNavigate } from "react-router-dom"

const NOTIFICATION_ICONS = {
  Success: <CheckCircle size={18} className="text-green-600" />,
  Alert: <AlertTriangle size={18} className="text-red-500" />,
  Insight: <Lightbulb size={18} className="text-blue-500" />,
  Recommendation: <Activity size={18} className="text-purple-500" />,
  Update: <Bell size={18} className="text-[#006044]" />
}

const NOTIFICATION_BGS = {
  Success: "bg-green-50 border-green-100",
  Alert: "bg-red-50 border-red-100",
  Insight: "bg-blue-50 border-blue-100",
  Recommendation: "bg-purple-50 border-purple-100",
  Update: "bg-[#006044]/5 border-[#006044]/10"
}

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleAction = (notif) => {
    markAsRead(notif.id)
    setIsOpen(false)
    if (notif.actionLink) {
      navigate(notif.actionLink)
    }
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition duration-200 focus:outline-none"
      >
        <Bell size={22} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#006044]"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#006044] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-3 text-xs font-semibold">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[#006044] hover:underline">Mark all read</button>
                )}
                <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-600">Clear</button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-600">You're all caught up!</p>
                <p className="text-xs mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((notif, idx) => (
                  <div 
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${notif.read ? 'bg-white border-transparent hover:bg-gray-50' : NOTIFICATION_BGS[notif.type || 'Update']}`}
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {NOTIFICATION_ICONS[notif.type || 'Update']}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm font-bold truncate ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium ml-2 whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>{notif.message}</p>
                        
                        {notif.actionLabel && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAction(notif); }}
                            className="mt-3 text-[11px] font-bold text-[#006044] flex items-center gap-1 hover:underline"
                          >
                            {notif.actionLabel} <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-[#006044] rounded-full mt-1.5 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
