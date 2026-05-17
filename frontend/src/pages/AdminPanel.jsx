import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../i18n/LanguageContext'

const AUTH_API_BASE = import.meta.env.VITE_API_AUTH_URL || import.meta.env.VITE_API_BASE_URL
const DELIVERY_API_BASE = import.meta.env.VITE_API_DELIVERY_URL || import.meta.env.VITE_API_BASE_URL
const ORDER_API_BASE = import.meta.env.VITE_API_ORDER_URL || import.meta.env.VITE_API_BASE_URL

export default function AdminPanel() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrones: 0,
    totalDeliveries: 0,
    totalHouses: 0,
    activeDeliveries: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch statistics from various endpoints
      const [usersRes, dronesRes, deliveriesRes, housesRes] = await Promise.allSettled([
        axios.get(`${AUTH_API_BASE}/account/get-all`).catch(() => ({ data: { accounts: [] } })),
        axios.get(`${DELIVERY_API_BASE}/drones`).catch(() => ({ data: [] })),
        axios.get(`${DELIVERY_API_BASE}/deliveries`).catch(() => ({ data: [] })),
        axios.get(`${ORDER_API_BASE}/location/houses`).catch(() => ({ data: [] }))
      ])

      const users = usersRes.status === 'fulfilled' ? (usersRes.value.data.accounts || usersRes.value.data || []) : []
      const drones = dronesRes.status === 'fulfilled' ? (dronesRes.value.data || []) : []
      const deliveries = deliveriesRes.status === 'fulfilled' ? (deliveriesRes.value.data || []) : []
      const houses = housesRes.status === 'fulfilled' ? (housesRes.value.data || []) : []

      const activeDeliveries = deliveries.length > 0 ? deliveries.filter(d => d.status === 'active' || d.status === 'in_progress').length : 0

      setStats({
        totalUsers: users.length,
        totalDrones: drones.length,
        totalDeliveries: deliveries.length,
        totalHouses: houses.length,
        activeDeliveries: activeDeliveries,
      })
    } catch (err) {
      setError(t('Failed to fetch statistics'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const adminActions = [
    {
      icon: '👥',
      title: t('Manage Users'),
      description: t('View, edit, and manage system users'),
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🧾',
      title: t('Manage Orders'),
      description: t('Review orders and push to Drone Map'),
      path: '/admin/orders',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '📍',
      title: t('Manage Locations'),
      description: t('Add and manage delivery locations'),
      path: '/admin/locations',
      color: 'from-green-500 to-green-600'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Loading admin panel...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ {t('Admin Panel')}</h1>
        <p className="text-gray-600">{t('Manage your drone delivery system')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('Total Users')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="text-5xl opacity-20">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('Total Drones')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalDrones}</p>
            </div>
            <div className="text-5xl opacity-20">🚁</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('Total Deliveries')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalDeliveries}</p>
            </div>
            <div className="text-5xl opacity-20">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">{t('Active Deliveries')}</p>
              <p className="text-3xl font-bold mt-2">{stats.activeDeliveries}</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">{t('Locations')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalHouses}</p>
            </div>
            <div className="text-5xl opacity-20">📍</div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Quick Actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color}`}></div>
              
              {/* Content */}
              <div className="relative p-8 text-white text-left">
                <div className="text-5xl mb-4">{action.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{action.title}</h3>
                <p className="text-white/90 mb-4">{action.description}</p>
                <div className="inline-flex items-center gap-2 text-white font-semibold">
                  {t('Go to')} {action.title}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">📋 {t('System Information')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-semibold">{t('Total System Users:')}</p>
            <p className="text-lg">{stats.totalUsers} {t('users')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('Registered Locations:')}</p>
            <p className="text-lg">{stats.totalHouses} {t('locations')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('Active Drones:')}</p>
            <p className="text-lg">{stats.totalDrones} {t('drones')}</p>
          </div>
          <div>
            <p className="font-semibold">{t('Delivery Status:')}</p>
            <p className="text-lg">{stats.activeDeliveries} {t('active')} / {stats.totalDeliveries} {t('total')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
