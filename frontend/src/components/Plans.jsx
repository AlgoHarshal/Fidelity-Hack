import { useState } from "react"
import { useTracking } from "../context/TrackingContext"
import CheckoutModal from "./CheckoutModal"
const plans = [
  {
    title: "SIP Investment",
    return: "12% Avg Returns",
    risk: "Low Risk",
    description:
      "Start investing monthly with flexible SIP plans designed for long-term wealth growth.",
  },
  {
    title: "Mutual Funds",
    return: "15% Avg Returns",
    risk: "Medium Risk",
    description:
      "Diversified mutual fund portfolios managed by top financial experts.",
  },
  {
    title: "Retirement Plan",
    return: "10% Avg Returns",
    risk: "Very Low Risk",
    description:
      "Secure your future with intelligent retirement investment strategies.",
  },
  {
  title: "Insurance Plans",
  return: "Secure Coverage",
  risk: "Protected",
  description:
    "Protect your family and future with smart life and health insurance plans.",
  },
]

const Plans = () => {
    const { trackEvent } = useTracking()
    const [selectedPlan, setSelectedPlan] = useState(null)
    
  return (
    <section className="bg-black text-white px-8 py-24">

      <div className="text-center mb-16">

        <h2 className="text-5xl font-bold">
          Investment Opportunities
        </h2>

        <p className="text-gray-400 mt-5 text-lg">
          Explore personalized investment plans powered by behavioral intelligence.
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300"
          >

            <h3 className="text-3xl font-bold text-blue-500 mb-4">
              {plan.title}
            </h3>

            <div className="flex gap-4 mb-5">

              <span className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
                {plan.return}
              </span>

              <span className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
                {plan.risk}
              </span>

            </div>

            <p className="text-gray-400 leading-7 mb-8">
              {plan.description}
            </p>

            <div className="flex gap-4">

              <button
              onClick={() => {
                trackEvent("Invest Clicked", plan.title)
                setSelectedPlan(plan.title)
              }}
              className="bg-blue-600 hover:bg-blue-500 transition duration-300 hover:scale-105 px-5 py-3 rounded-xl font-semibold">
              Invest Now
            </button>

              <button
              onClick={() => trackEvent("Compare Clicked", plan.title)}
                className="border border-gray-700 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold"
                >
               Compare
               </button>

            </div>

          </div>
        ))}

      </div>

      <CheckoutModal 
        isOpen={!!selectedPlan} 
        planName={selectedPlan} 
        onClose={() => setSelectedPlan(null)} 
      />

    </section>
  )
}

export default Plans