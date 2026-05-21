import { useNavigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center px-6 font-sans">
      <div className="bg-white border border-red-200 rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-600" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You do not have the required administrator privileges to view this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#006044] hover:bg-[#004e36] text-white px-6 py-3 rounded font-bold w-full transition shadow-sm"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

export default Unauthorized
