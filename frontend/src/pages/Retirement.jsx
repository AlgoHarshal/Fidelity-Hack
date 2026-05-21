import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useTracking } from "../context/TrackingContext"
import { usePageTracking } from "../hooks/usePageTracking"
import { Sunset, TrendingUp, PiggyBank, BarChart3, ArrowRight } from "lucide-react"

const PLANS = [
  {
    icon: Sunset,
    title: "NPS (National Pension System)",
    returns: "10–12% Avg Returns",
    risk: "Low Risk",
    color: "text-orange-400",
    minInvest: "₹500/month",
    description: "Government-backed pension scheme with market-linked returns and tax benefits under 80CCD.",
    features: ["Tax deduction up to ₹2L", "60% lump sum at retirement", "40% converts to pension"],
  },
  {
    icon: PiggyBank,
    title: "PPF (Public Provident Fund)",
    returns: "7.1% Guaranteed",
    risk: "Zero Risk",
    color: "text-green-400",
    minInvest: "₹500/year",
    description: "Government-guaranteed, completely tax-free savings scheme ideal for risk-averse retirees.",
    features: ["EEE tax benefit (fully exempt)", "15-year lock-in period", "Partial withdrawal after 7 yrs"],
  },
  {
    icon: TrendingUp,
    title: "Retirement Mutual Fund",
    returns: "14–18% Avg Returns",
    risk: "Medium Risk",
    color: "text-blue-400",
    minInvest: "₹1,000/month",
    description: "Equity-oriented retirement fund with professional management. Best for a 15+ year horizon.",
    features: ["5-year lock-in period", "Tax-free after 1 year (LTCG)", "Diversified equity portfolio"],
  },
  {
    icon: BarChart3,
    title: "Senior Citizens Savings Scheme",
    returns: "8.2% Guaranteed",
    risk: "Very Low Risk",
    color: "text-purple-400",
    minInvest: "₹1,000 lump sum",
    description: "Designed exclusively for post-retirement. Offers the highest guaranteed returns of any government scheme.",
    features: ["Age 60+ eligibility", "Quarterly interest payout", "Max ₹30 lakh deposit"],
  },
]

const Retirement = () => {
  usePageTracking("Retirement Plans")
  const { trackEvent } = useTracking()

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="text-center px-8 py-20">
        <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-600/30 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sunset size={16} /> Plan Your Golden Years
        </div>
        <h1 className="text-5xl font-bold mb-5">Retirement Plans</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Secure your future today. Our retirement solutions grow your wealth while ensuring guaranteed income post-retirement.
        </p>
      </section>

      {/* Plans */}
      <section className="px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <Icon className={`${plan.color}`} size={36} />
                  <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">{plan.risk}</span>
                </div>

                <h3 className={`text-2xl font-bold mb-2 ${plan.color}`}>{plan.title}</h3>
                <div className="flex gap-3 mb-4">
                  <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-lg text-sm">{plan.returns}</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm">Min: {plan.minInvest}</span>
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
                    Start Planning <ArrowRight size={16} />
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

export default Retirement
