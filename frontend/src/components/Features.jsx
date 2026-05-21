const features = [
  {
    title: "Behavior Tracking",
    description:
      "Track investor interactions including page visits, compare clicks, time spent, and form abandonment.",
  },
  {
    title: "Risk Scoring",
    description:
      "Generate intelligent behavioral scores to identify high-intent but hesitant investors.",
  },
  {
    title: "Persona Detection",
    description:
      "Classify users into investor personas like Researcher, Beginner, Serious Investor, and Drop-Off Risk.",
  },
  {
    title: "Explainable Decisions",
    description:
      "Provide transparent explanations behind every triggered nudge and behavioral prediction.",
  },
]

const Features = () => {
  return (
    <section className="px-8 py-24 bg-black text-white">
      
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold">
          Intelligent Investor Analytics
        </h2>

        <p className="text-gray-400 mt-6 text-lg max-w-3xl mx-auto">
          Our engine analyzes behavioral intent signals to recover investors
          before conversion drop-off happens.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition duration-300"
          >
            <h3 className="text-2xl font-semibold mb-5 text-blue-500">
              {feature.title}
            </h3>

            <p className="text-gray-400 leading-7">
              {feature.description}
            </p>
          </div>
        ))}

      </div>

    </section>
  )
}

export default Features