import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../i18n/LanguageContext'

const getMenuItems = (userRole) => {
  const baseItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '🚁', label: 'Drones', path: '/drones' },
    { icon: '📦', label: 'Deliveries', path: '/deliveries' },
    { icon: '🗺️', label: 'Drone Map', path: '/drone-map' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ]

  if (userRole === 'admin') {
    return [
      ...baseItems,
      { icon: '⚙️', label: 'Admin Panel', path: '/admin' },
      { icon: '👥', label: 'Users', path: '/admin/users' },
      { icon: '📍', label: 'Locations', path: '/admin/locations' },
      { icon: '🧾', label: 'Orders', path: '/admin/orders' },
    ]
  }

  return baseItems
}

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useLanguage()
  const menuItems = getMenuItems(user?.Role)

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-blue-600 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚁</span>
            <span className="font-bold text-lg">DroneFlow</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-blue-600 rounded transition"
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      {/* User Info */}
      {isExpanded && (
        <div className="p-4 border-b border-blue-600 bg-blue-800/50">
          <p className="text-sm font-semibold truncate">{user?.FullName}</p>
          <p className="text-xs text-blue-200 truncate">{user?.Email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-600 rounded text-xs font-semibold">
            {user?.Role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-white/20 border-l-4 border-white'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isExpanded && <span className="font-semibold">{t(item.label)}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-blue-600 text-sm text-blue-200">
          <p className="text-xs">© 2026 DroneFlow</p>
          <p className="text-xs">{t('Drone Delivery System')}</p>
        </div>
      )}
    </div>
  )
}
