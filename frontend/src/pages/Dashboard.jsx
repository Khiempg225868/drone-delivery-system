import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDrones, getDeliveries } from '../services/api'
import axios from 'axios'
import { useLanguage } from '../i18n/LanguageContext'

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-${color}-600 text-sm font-medium mb-1`}>{label}</p>
        <p className={`text-4xl font-bold text-${color}-900`}>{value}</p>
        {trend && <p className={`text-${color}-600 text-xs mt-2`}>{trend}</p>}
      </div>
      <div className={`text-6xl opacity-20`}>{icon}</div>
    </div>
  </div>
)

const RecentItem = ({ type, title, status, time }) => (
  <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
    <div className="flex items-center space-x-3">
      <div className="text-2xl">{type === 'drone' ? '🚁' : '📦'}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'active'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  </div>
)

const RolloutBanner = ({ t }) => (
  <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg">
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
          🚀
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{t('CI/CD Rollout Demo')}</h2>
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              v2.0.9
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t('This banner is the visible UI marker for ArgoCD sync and rollback validation.')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-gray-500">{t('Build')}</p>
          <p className="text-sm font-bold text-gray-900">{t('Passed')}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-gray-500">{t('ArgoCD')}</p>
          <p className="text-sm font-bold text-emerald-600">{t('Synced')}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-gray-500">{t('Rollback')}</p>
          <p className="text-sm font-bold text-blue-600">{t('Ready')}</p>
        </div>
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    drones: 0,
    deliveries: 0,
    activeDeliveries: 0,
    completedToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      // Fetch drones and deliveries - these might fail, but it's not critical
      try {
        const [dronesRes, deliveriesRes] = await Promise.all([
          getDrones(),
          getDeliveries(),
        ])

        const activeDeliveries = deliveriesRes.data.filter(
          (d) => d.status === 'in_transit' || d.status === 'assigned'
        ).length

        const completedToday = deliveriesRes.data.filter(
          (d) => d.status === 'delivered'
        ).length

        setStats({
          drones: dronesRes.data.length,
          deliveries: deliveriesRes.data.length,
          activeDeliveries,
          completedToday,
        })
      } catch (statsError) {
        console.log('Could not fetch drones/deliveries stats:', statsError.message)
        // Continue with owner search even if stats fail
      }

    } catch (error) {
      console.error('Unexpected error in fetchStats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Loading dashboard...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {t('Welcome back,')} {user?.FullName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {t("Here's what's happening with your delivery system today")}
        </p>
      </div>

      <RolloutBanner t={t} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="🚁"
          label={t('Total Drones')}
          value={stats.drones}
          color="blue"
          trend={t('Operational')}
        />
        <StatCard
          icon="📦"
          label={t('Total Deliveries')}
          value={stats.deliveries}
          color="purple"
          trend={t('All time')}
        />
        <StatCard
          icon="🚚"
          label={t('Active Deliveries')}
          value={stats.activeDeliveries}
          color="orange"
          trend={t('In progress')}
        />
        <StatCard
          icon="✓"
          label={t('Completed Today')}
          value={stats.completedToday}
          color="green"
          trend={t('Success rate 98%')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h2 className="text-2xl font-bold">{t('Recent Activity')}</h2>
              <p className="text-blue-100 text-sm mt-1">{t('Latest orders and drones')}</p>
            </div>
            <div className="divide-y">
              <RecentItem
                type="drone"
                title="Drone #001 - Route Optimized"
                status="active"
                time="2 minutes ago"
              />
              <RecentItem
                type="delivery"
                title="Order #DEL-001 - Delivered"
                status="completed"
                time="15 minutes ago"
              />
              <RecentItem
                type="drone"
                title="Drone #003 - Maintenance Required"
                status="pending"
                time="1 hour ago"
              />
              <RecentItem
                type="delivery"
                title="Order #DEL-002 - In Transit"
                status="active"
                time="3 hours ago"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('System Status')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('Fleet Status')}</span>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {t('OPERATIONAL')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('Uptime')}</span>
                <span className="text-sm font-bold text-blue-600">99.8%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('Avg Delivery')}</span>
                <span className="text-sm font-bold text-purple-600">45 min</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('Quick Actions')}</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105">
                🗺️ {t('View Drone Map')}
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105">
                📦 {t('Create Delivery')}
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105">
                ⚙️ {t('Optimize Route')}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
