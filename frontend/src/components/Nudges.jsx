import { useTracking } from "../context/TrackingContext"
const Nudges = () => {
    const { events } = useTracking()
  return (
    <section className="bg-black text-white px-8 py-10">

      <div className="text-center mb-16">

        <h2 className="text-5xl font-bold">
          Personalized Nudge System
        </h2>

        <p className="text-gray-400 text-lg mt-5 max-w-3xl mx-auto">
          Intelligent reminders generated from investor behavior patterns to recover lost conversions.
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* Left Side */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h3 className="text-3xl font-bold mb-8 text-blue-500">
            Trigger Analysis
          </h3>

          <div className="space-y-5">

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Spent 4 minutes on SIP Plans
            </div>

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Compared 3 investment options
            </div>

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Started signup process
            </div>

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Exited without completing registration
            </div>

            <div className="bg-blue-600 p-5 rounded-xl font-semibold text-lg">
              High Intent Hesitation Detected
            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h3 className="text-3xl font-bold mb-8 text-blue-500">
            Personalized Recovery Nudge
          </h3>

          <div className="bg-green-500 text-black rounded-2xl p-6 max-w-md">

            <div className="flex items-center gap-3 mb-4">
              
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold">
                AI
              </div>

              <div>
                <h4 className="font-bold text-lg">
                  IntentEdge Assistant
                </h4>

                <p className="text-sm">
                  Personalized Investor Support
                </p>
              </div>

            </div>

            <div className="space-y-4 text-lg">

              <p>
                Still comparing SIP plans?
              </p>

              <p>
                Start investing today with just ₹500/month and build long-term wealth confidently.
              </p>

              <p className="font-semibold">
                Your personalized plan is ready.
              </p>

            </div>

          </div>

        </div>

      </div>
      

    </section>
  )
}

export default Nudges