import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useTracking } from "../context/TrackingContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { Shield, Heart, Umbrella, Building2, ArrowRight } from "lucide-react"

const PLANS = [
  {
    icon: Shield,
    title: "Term Life Insurance",
    coverage: "₹1 Cr Coverage",
    premium: "₹799/month",
    risk: "Zero Risk",
    color: "text-blue-400",
    description: "Pure life cover at the lowest premium. Protects your family's financial future in your absence.",
    features: ["No medical test up to 45 yrs", "Online claim settlement", "Tax benefit under 80C"],
  },
  {
    icon: Heart,
    title: "Health Insurance",
    coverage: "₹10 Lakh Cover",
    premium: "₹1,200/month",
    risk: "Protected",
    color: "text-green-400",
    description: "Comprehensive health coverage including hospitalisation, OPD, and critical illness riders.",
    features: ["Cashless at 10,000+ hospitals", "No-claim bonus up to 50%", "Pre & post hospitalisation"],
  },
  {
    icon: Umbrella,
    title: "ULIP Plan",
    coverage: "Insurance + Investment",
    premium: "₹5,000/month",
    risk: "Low-Medium Risk",
    color: "text-purple-400",
    description: "Dual benefit: life cover + market-linked investment returns. Best for long-term wealth with protection.",
    features: ["5-year lock-in period", "Partial withdrawal after 5 yrs", "Tax-free maturity"],
  },
  {
    icon: Building2,
    title: "Endowment Plan",
    coverage: "Guaranteed Returns",
    premium: "₹3,500/month",
    risk: "Very Low Risk",
    color: "text-yellow-400",
    description: "Guaranteed savings plan with life cover. Ideal for risk-averse investors seeking assured returns.",
    features: ["Guaranteed maturity benefit", "Bonus addition every year", "Loan facility available"],
  },
]

const Insurance = () => {
  usePageTracking("Insurance Plans")
  const { trackEvent } = useTracking()

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="text-center px-8 py-20">
        <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/30 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Shield size={16} /> Protected Coverage
        </div>
        <h1 className="text-5xl font-bold mb-5">Insurance Plans</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Protect what matters most. Explore plans designed to secure your family's future while building wealth.
        </p>
      </section>

      {/* Plans Grid */}
      <section className="px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300 group"
              >
                <div className="flex items-start justify-between mb-5">
                  <Icon className={`${plan.color}`} size={36} />
                  <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">{plan.risk}</span>
                </div>

                <h3 className={`text-2xl font-bold mb-2 ${plan.color}`}>{plan.title}</h3>
                <div className="flex gap-3 mb-4">
                  <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-lg text-sm">{plan.coverage}</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm">{plan.premium}</span>
                </div>
                <p className="text-gray-400 leading-7 mb-5">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <button
                    onClick={() => trackEvent("Invest Clicked", plan.title)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold transition"
                  >
                    Get Covered <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => trackEvent("Compare Clicked", plan.title)}
                    className="border border-gray-700 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold transition"
                  >
                    Compare
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Insurance
