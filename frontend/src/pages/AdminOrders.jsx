import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../i18n/LanguageContext'
import { appConfig } from '../config/runtimeConfig'

const ORDER_API_BASE = appConfig.orderBaseUrl || appConfig.apiBaseUrl

export default function AdminOrders() {
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const houseMap = useMemo(() => {
    return new Map(houses.map((house) => [house._id, house]))
  }, [houses])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const [ordersRes, housesRes] = await Promise.all([
        axios.get(`${ORDER_API_BASE}/location/orders`),
        axios.get(`${ORDER_API_BASE}/location/houses`)
      ])
      setOrders(ordersRes.data || [])
      setHouses(housesRes.data || [])
    } catch (err) {
      console.error(err)
      setError(t('Cannot load orders'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString(locale)
  }

  const totalWeight = orders.reduce((sum, order) => sum + (order.package?.weight || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧾 {t('Orders')}</h1>
          <p className="text-gray-600 mt-1">{t('Manage orders and send them to Drone Map for delivery optimization')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            {t('Refresh')}
          </button>
          <button
            onClick={() => navigate('/drone-map?auto=1')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {t('Apply all to Drone Map')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('Total orders')}</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('Total payload')}</p>
          <p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('Pending status')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter((o) => o.status === 'pending' || o.status === 'assigned' || o.status === 'in_transit').length}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t('Order list')}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('Loading orders...')}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('No orders yet')}</div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => {
              const house = houseMap.get(order.houseId)
              return (
                <div key={order._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">{t('Order code')}</p>
                      <p className="text-lg font-semibold text-gray-900">{order.orderId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {house?.address || t('Unknown address')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        {order.package?.weight || 0} kg
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-700">
                    <div className="bg-white rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">{t('Order name')}</p>
                      <p className="font-semibold">{order.package?.description || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">{t('House')}</p>
                      <p className="font-semibold">{house?.owner?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">{house?.owner?.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">{t('Created at')}</p>
                      <p className="font-semibold">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
