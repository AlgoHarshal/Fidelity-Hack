import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Activity, LineChart, Target, UserCheck, Shield } from "lucide-react"

const Home = () => {
  const navigate = useNavigate()

  const storySections = [
    { icon: <Activity className="text-[#006044]" size={28} />, title: "Behavioral Tracking", desc: "Silently monitors micro-interactions, page dwell times, and exit intents to understand true investor hesitation." },
    { icon: <Target className="text-[#006044]" size={28} />, title: "AI Persona Detection", desc: "Classifies users into real-time psychological personas (e.g., 'Confused Beginner', 'Window Shopper')." },
    { icon: <ShieldCheck className="text-[#006044]" size={28} />, title: "Personalized Nudges", desc: "Triggers explainable, hyper-personalized messaging exactly when the user is about to drop off." },
    { icon: <LineChart className="text-[#006044]" size={28} />, title: "Real-Time Analytics", desc: "Provides admins with a live control center tracking conversion funnels, drop-off risks, and active sessions." },
    { icon: <UserCheck className="text-[#006044]" size={28} />, title: "Conversion Recovery", desc: "Recovers lost revenue by addressing the exact reason for user hesitation via explainable AI." },
    { icon: <Shield className="text-[#006044]" size={28} />, title: "Enterprise Security", desc: "Built on a robust, role-based architecture ensuring data privacy and secure authentication." }
  ]

  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">
      <Navbar />

      {/* Premium Hero Section */}
      <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-hidden">
        
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#006044]/5 border border-[#006044]/10 text-[#006044] text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 uppercase tracking-wide">
            Intelligent Wealth Management
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-gray-900 leading-[1.1]">
            Detect Investor Hesitation<br/>
            <span className="text-[#006044]">Before Drop-Off</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-xl leading-relaxed">
            The IntentEdge Intent Engine silently analyzes behavioral signals to predict drop-offs and deploy hyper-personalized guidance that recovers lost conversions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button
              onClick={() => navigate("/investments")}
              className="bg-[#006044] hover:bg-[#004e36] text-white px-8 py-3.5 rounded font-bold shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Explore Plans
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white border border-[#006044] text-[#006044] hover:bg-gray-50 px-8 py-3.5 rounded font-bold transition-all flex items-center justify-center gap-2"
            >
              View Live Demo
            </button>
          </div>
        </div>

        {/* Hero Image Representation */}
        <div className="flex-1 w-full relative animate-in fade-in zoom-in-95 duration-1000 delay-200 hidden md:block">
          <div className="max-w-lg mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white p-2 hover:shadow-xl transition-shadow duration-300">
            <img 
              src="/hero_wealth.png" 
              alt="IntentEdge Wealth Management" 
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* How IntentEdge Works Section */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How IntentEdge Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our multi-layered engine transforms raw interactions into actionable intelligence.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {storySections.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 p-8 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded bg-[#006044]/5 flex items-center justify-center mb-6 group-hover:bg-[#006044]/10 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home