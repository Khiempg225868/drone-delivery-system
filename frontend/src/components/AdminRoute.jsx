import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminRoute({ children }) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user?.Role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    )
  }

  return children
}