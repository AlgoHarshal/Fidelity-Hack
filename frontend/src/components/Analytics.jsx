import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Brain,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react"

const data = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 210 },
  { day: "Wed", users: 180 },
  { day: "Thu", users: 280 },
  { day: "Fri", users: 350 },
  { day: "Sat", users: 300 },
]

const Analytics = () => {
  return (
    <section className="bg-black text-white px-8 py-24">

      <div className="text-center mb-16">

        <h2 className="text-5xl font-bold">
          Behavioral Intelligence Dashboard
        </h2>

        <p className="text-gray-400 text-lg mt-5 max-w-3xl mx-auto">
          Real-time investor analytics powered by behavioral tracking and explainable intelligence systems.
        </p>

      </div>

      {/* Top Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition">

          <Brain className="text-blue-500 mb-5" size={40} />

          <h3 className="text-gray-400">
            AI Risk Score
          </h3>

          <p className="text-4xl font-bold mt-3">
            78/100
          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition">

          <Users className="text-green-500 mb-5" size={40} />

          <h3 className="text-gray-400">
            Active Investors
          </h3>

          <p className="text-4xl font-bold mt-3">
            1,248
          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition">

          <TrendingUp className="text-yellow-400 mb-5" size={40} />

          <h3 className="text-gray-400">
            Conversion Rate
          </h3>

          <p className="text-4xl font-bold mt-3">
            18%
          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition">

          <Activity className="text-purple-400 mb-5" size={40} />

          <h3 className="text-gray-400">
            Nudges Triggered
          </h3>

          <p className="text-4xl font-bold mt-3">
            586
          </p>

        </div>

      </div>

      {/* Chart + Trigger */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h3 className="text-3xl font-bold mb-8">
            Investor Activity Trends
          </h3>

          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={data}>

                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2563eb"
                  strokeWidth={4}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Trigger Engine */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h3 className="text-3xl font-bold mb-8">
            Explainable Trigger Engine
          </h3>

          <div className="space-y-5">

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ User spent 4 mins on SIP page
            </div>

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Compared 3 investment plans
            </div>

            <div className="bg-gray-800 p-5 rounded-xl">
              ✓ Exit detected before signup
            </div>

            <div className="bg-blue-600 p-5 rounded-xl font-semibold text-lg">
              Personalized Nudge Triggered
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Analytics