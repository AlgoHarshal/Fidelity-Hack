import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useTracking } from "../context/TrackingContext"
import { useAuth } from "../context/AuthContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { Zap, Mail, MessageSquare, Bell, ChevronRight, Lightbulb, Info } from "lucide-react"
import { NUDGE_TYPES } from "../services/nudgeEngine"

const TYPE_META = {
  [NUDGE_TYPES.EMAIL]:        { icon: Mail,          label: "Email",         color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"   },
  [NUDGE_TYPES.WHATSAPP]:     { icon: MessageSquare, label: "WhatsApp",      color: "text-green-600",  bg: "bg-green-50 border-green-200"  },
  [NUDGE_TYPES.NOTIFICATION]: { icon: Bell,          label: "Notification",  color: "text-purple-600", bg: "bg-purple-50 border-purple-200"},
}

const NudgeCard = ({ nudge }) => {
  const meta = TYPE_META[nudge.nudgeType] ?? TYPE_META[NUDGE_TYPES.EMAIL]
  const Icon = meta.icon

  if (nudge.nudgeType === NUDGE_TYPES.WHATSAPP) {
    return (
      <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4 max-w-sm ml-auto relative shadow-sm">
        {/* Tail */}
        <div className="absolute -right-2 top-4 w-4 h-4 bg-[#E8F5E9] border-t border-r border-[#C8E6C9] transform rotate-45"></div>
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#C8E6C9]">
          <div className="flex items-center gap-2">
            <Icon className="text-[#00a884]" size={16} />
            <span className="text-xs font-bold text-[#00a884] uppercase tracking-wider">WhatsApp</span>
          </div>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed mb-2 bg-white p-3 rounded-lg rounded-tr-none shadow-sm">{nudge.message}</p>
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-blue-500 font-bold">✓✓</span>
        </div>
        <button className="w-full mt-3 bg-[#00a884] hover:bg-[#008f6f] text-white py-2 rounded text-sm font-semibold transition shadow-sm">
          {nudge.cta}
        </button>
      </div>
    )
  }

  return (
    <div className={`border rounded-xl p-6 shadow-sm ${meta.bg}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={meta.color} size={18} />
        <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
        {nudge.subject && (
          <span className="ml-auto text-gray-500 text-xs truncate max-w-[180px] font-medium">{nudge.subject}</span>
        )}
      </div>
      <p className="text-gray-800 leading-relaxed mb-4">{nudge.message}</p>
      <button className="flex items-center gap-1 text-sm font-bold text-[#006044] hover:text-[#004e36] transition">
        {nudge.cta} <ChevronRight size={14} />
      </button>
    </div>
  )
}

const Recommendations = () => {
  usePageTracking("Recommendations")
  const { user } = useAuth()
  const {
    persona, triggerReasons, nudgeLogs,
    generatePersonalizedNudges, score, scoreLabel,
  } = useTracking()

  const [generated, setGenerated] = useState(false)
  const [currentNudges, setCurrentNudges] = useState([])

  const handleGenerate = () => {
    const logs = generatePersonalizedNudges(user)
    setCurrentNudges(logs)
    setGenerated(true)
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />

      <section className="px-8 py-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#006044]/10 border border-[#006044]/20 text-[#006044] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
            <Zap size={16} /> AI-Powered Recommendations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#006044]">Personalized Nudges</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Intelligent, explainable insights generated from your behavioral patterns.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Persona + Trigger reasons ── */}
          <div className="space-y-6">
            {/* Persona */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-wider">Your Profile</h3>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded border text-base font-bold mb-3 ${persona.badgeColor.replace('text-blue-400', 'text-[#006044]').replace('border-blue-500/30', 'border-[#006044]/20').replace('bg-blue-600/10', 'bg-[#006044]/5')}`}>
                {persona.icon} {persona.label}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{persona.description}</p>
              <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100">
                <span className="text-gray-600 text-sm font-medium">Behavior Score:</span>
                <span className={`font-bold ${scoreLabel.tailwind.replace('text-blue-400', 'text-[#006044]')}`}>{score} {scoreLabel.emoji}</span>
              </div>
            </div>

            {/* Explainable trigger reasons */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <h3 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb size={14} className="text-[#006044]" /> Why This Was Triggered
              </h3>
              {triggerReasons.length === 0 ? (
                <p className="text-gray-500 text-sm">Browse plans to generate trigger signals.</p>
              ) : (
                <div className="space-y-3">
                  {triggerReasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-[#006044] mt-0.5 flex-shrink-0 font-bold">✓</span>
                      <span className="text-gray-700 leading-relaxed font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              className="w-full bg-[#006044] hover:bg-[#004e36] text-white py-4 rounded font-bold text-lg transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap size={20} />
              {generated ? "Re-Generate Nudges" : "Generate My Nudges"}
            </button>
          </div>

          {/* ── Right: Nudge cards ── */}
          <div className="lg:col-span-2 space-y-5">
            {!generated ? (
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-12 text-center h-full flex flex-col justify-center">
                <Info className="text-gray-300 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No nudges yet</h3>
                <p className="text-gray-500 text-sm">
                  Click "Generate My Nudges" to see personalized recovery messages based on your behavior.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Your Personalized Nudges
                  </h3>
                  <span className="text-gray-500 text-sm font-medium">{currentNudges.length} nudge(s) generated</span>
                </div>
                {currentNudges.map((nudge) => (
                  <NudgeCard key={nudge.id} nudge={nudge} />
                ))}

                {/* Email log preview */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 mt-6">
                  <h3 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Email Log Preview
                  </h3>
                  {nudgeLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="border-b border-gray-100 py-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{log.subject}</span>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-600 font-medium">To: {log.email}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${persona.badgeColor.replace('text-blue-400', 'text-[#006044]').replace('border-blue-500/30', 'border-[#006044]/20').replace('bg-blue-600/10', 'bg-[#006044]/5')}`}>{log.persona}</span>
                        <span className="text-xs font-bold text-green-700">✓ {log.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">Reason: {log.triggerReason}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Recommendations
