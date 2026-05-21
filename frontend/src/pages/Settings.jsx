import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Bell, Shield, Key, CreditCard } from "lucide-react"

const Settings = () => {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-10 text-[#006044]">Account Settings</h1>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006044]/10 text-[#006044] rounded-lg"><Bell size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Push Notifications</h3>
                <p className="text-sm text-gray-600">Receive alerts, nudges, and market updates.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006044]"></div>
            </label>
          </div>

          {/* Privacy */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006044]/10 text-[#006044] rounded-lg"><Shield size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Privacy & Security</h3>
                <p className="text-sm text-gray-600">Manage data sharing and 2FA.</p>
              </div>
            </div>
            <span className="text-gray-500 font-semibold">Manage &rarr;</span>
          </div>

          {/* Password */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006044]/10 text-[#006044] rounded-lg"><Key size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password.</p>
              </div>
            </div>
            <span className="text-gray-500 font-semibold">Update &rarr;</span>
          </div>

          {/* Billing */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006044]/10 text-[#006044] rounded-lg"><CreditCard size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Payment Methods</h3>
                <p className="text-sm text-gray-600">Manage linked bank accounts.</p>
              </div>
            </div>
            <span className="text-gray-500 font-semibold">View &rarr;</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Settings
