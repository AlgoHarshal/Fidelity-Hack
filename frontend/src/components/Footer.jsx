import { Link } from "react-router-dom"

const Footer = () => {
  const handleSupportClick = (e) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent("open-intentedge-chat"))
  }

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 px-8 py-10 mt-20">

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">

        <div>
          <h2 className="text-xl font-bold text-[#006044]">
            IntentEdge
          </h2>

          <p className="text-gray-500 mt-2 text-sm">
            Detect hesitation. Recover intent. Increase conversions.
          </p>
        </div>

        <div className="flex gap-8 text-gray-600 text-sm font-medium items-center">
          <Link to="/" className="hover:text-[#006044] transition cursor-pointer">
            Home
          </Link>

          <Link to="/investments" className="hover:text-[#006044] transition cursor-pointer">
            Investments
          </Link>

          <button 
            onClick={handleSupportClick}
            className="hover:text-[#006044] transition cursor-pointer font-medium"
          >
            Support
          </button>
        </div>

      </div>

    </footer>
  )
}

export default Footer