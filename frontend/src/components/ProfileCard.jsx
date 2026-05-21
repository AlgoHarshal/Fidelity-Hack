import { useAuth } from "../context/AuthContext"

const ProfileCard = () => {

  const { user } = useAuth()

  if (!user) return null

  return (

    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">

      <h2 className="text-3xl font-bold mb-4">
        Welcome {user.name}
      </h2>

      <p className="text-gray-400 mb-2">
        Email: {user.email}
      </p>

      <p className="text-gray-400">
        Role: {user.role}
      </p>

    </div>
  )
}

export default ProfileCard