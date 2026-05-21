const WebsiteStructure = () => {
  return (
    <section className="bg-black text-white px-8 py-24">
      
      <div className="text-center mb-16">
        
        <h2 className="text-5xl font-bold">
          Financial Website Structure
        </h2>

        <p className="text-gray-400 text-lg mt-5 max-w-3xl mx-auto">
          Multi-page intelligent investment platform designed to track investor intent and behavioral interactions.
        </p>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Card 1 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300">
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              1
            </div>

            <h3 className="text-2xl font-bold text-blue-500">
              Financial Website
            </h3>
          </div>

          <p className="text-gray-400 mb-5">
            Build a multi-page simulated financial website:
          </p>

          <ul className="space-y-3 text-gray-300">
            <li>• Home / Landing Page</li>
            <li>• Investment Plans Page</li>
            <li>• Insurance Plans Page</li>
            <li>• Retirement Plans Page</li>
            <li>• Checkout / Sign-up Form</li>
          </ul>

        </div>

        {/* Card 2 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300">
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              2
            </div>

            <h3 className="text-2xl font-bold text-blue-500">
              Behavior Tracking
            </h3>
          </div>

          <p className="text-gray-400 mb-5">
            Capture real-time investor interactions:
          </p>

          <ul className="space-y-3 text-gray-300">
            <li>• Time spent per page</li>
            <li>• Compare button clicks</li>
            <li>• Form interactions</li>
            <li>• Exit without signup</li>
            <li>• User journey analytics</li>
          </ul>

        </div>

        {/* Card 3 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300">
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              3
            </div>

            <h3 className="text-2xl font-bold text-blue-500">
              AI Intelligence Engine
            </h3>
          </div>

          <p className="text-gray-400 mb-5">
            Detect hesitation and recover investor intent:
          </p>

          <ul className="space-y-3 text-gray-300">
            <li>• Behavioral Risk Score</li>
            <li>• Persona Detection</li>
            <li>• Explainable Decisions</li>
            <li>• Personalized Nudges</li>
            <li>• Conversion Prediction</li>
          </ul>

        </div>

      </div>

    </section>
  )
}

export default WebsiteStructure