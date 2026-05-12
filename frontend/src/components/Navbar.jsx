import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!token) return null

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-600">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <span className="text-3xl">🚁</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DroneFlow
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-bold text-gray-900">{user?.FullName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
