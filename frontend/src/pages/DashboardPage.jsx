import Navbar from "../components/Navbar"
import Dashboard from "../components/Dashboard"
import Footer from "../components/Footer"

const DashboardPage = () => {
  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#006044]/20">

      <Navbar />

      <Dashboard />

      <Footer />

    </div>
  )
}

export default DashboardPage