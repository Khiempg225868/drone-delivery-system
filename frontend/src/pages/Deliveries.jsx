import { useState, useEffect } from 'react'
import axios from 'axios'
import { confirmDelivery, getDeliveries, getMyDeliveries } from '../services/api'
import DeliveryForm from '../components/DeliveryForm'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../i18n/LanguageContext'

const ORDER_API_BASE = import.meta.env.VITE_API_ORDER_URL || import.meta.env.VITE_API_BASE_URL

export default function Deliveries() {
  const { user } = useAuth()
  const { locale, t } = useLanguage()
  const [deliveries, setDeliveries] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingById, setRatingById] = useState({})
  const [feedbackById, setFeedbackById] = useState({})
  const [confirmingId, setConfirmingId] = useState(null)
  const [ownerHouses, setOwnerHouses] = useState([])
  const [allHouses, setAllHouses] = useState([])
  const [trackingQuery, setTrackingQuery] = useState('')
  const [selectedTrackingId, setSelectedTrackingId] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [orderForm, setOrderForm] = useState({
    houseId: '',
    name: '',
    weight: ''
  })
  const [orderMessage, setOrderMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchDeliveries()
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeliveries({ silent: true })
    }, 15000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (user?.Role !== 'customer') return

    const fetchOwnerHouses = async () => {
      try {
        const response = await axios.post(`${ORDER_API_BASE}/location/houses/search-customer`, {
          phone: user?.Phone,
          email: user?.Email
        })
        setOwnerHouses(response.data.houses || [])
      } catch (error) {
        setOwnerHouses([])
      }
    }

    fetchOwnerHouses()
  }, [user])

  const fetchDeliveries = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true)
      const [deliveryResponse, ordersResponse, housesResponse] = await Promise.all([
        user?.Role === 'customer' ? getMyDeliveries() : getDeliveries(),
        axios.get(`${ORDER_API_BASE}/location/orders`).catch(() => ({ data: [] })),
        axios.get(`${ORDER_API_BASE}/location/houses`).catch(() => ({ data: [] }))
      ])

      setDeliveries(deliveryResponse.data || [])
      setActiveOrders(ordersResponse.data || [])
      setAllHouses(housesResponse.data || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const houseById = new Map(allHouses.map((house) => [house._id, house]))
  const ownerHouseIds = new Set(ownerHouses.map((house) => house._id))

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('Pending'),
      assigned: t('Assigned'),
      in_transit: t('In transit'),
      delivered: t('Delivered'),
      failed: t('Failed'),
      cancelled: t('Cancelled')
    }

    return labels[status] || status || 'N/A'
  }

  const getTrackingSteps = (status) => {
    const steps = [
      { key: 'pending', label: t('Order created') },
      { key: 'assigned', label: t('Route assigned') },
      { key: 'in_transit', label: t('Drone in transit') },
      { key: 'delivered', label: t('Delivered') }
    ]
    const order = ['pending', 'assigned', 'in_transit', 'delivered']
    const currentIndex = Math.max(0, order.indexOf(status))

    return steps.map((step, index) => ({
      ...step,
      completed: status === 'delivered' || index <= currentIndex,
      current: index === currentIndex && status !== 'delivered'
    }))
  }

  const getProgress = (status) => {
    const progress = {
      pending: 25,
      assigned: 50,
      in_transit: 75,
      delivered: 100,
      failed: 100,
      cancelled: 100
    }

    return progress[status] || 0
  }

  const trackingItems = [
    ...activeOrders.map((order) => {
      const house = houseById.get(order.houseId)
      return {
        id: order._id || order.orderId,
        code: order.orderId,
        source: 'order',
        status: order.status,
        packageName: order.package?.description,
        weight: order.package?.weight,
        address: house?.address || t('Unknown address'),
        receiverName: house?.owner?.name,
        receiverPhone: house?.owner?.phone,
        houseId: order.houseId,
        createdAt: order.createdAt,
        deliveredAt: null,
        sequence: order.sequence
      }
    }),
    ...deliveries.map((delivery) => ({
      id: delivery._id,
      code: delivery.deliveryId,
      source: 'delivery',
      status: delivery.status,
      packageName: delivery.package?.description,
      weight: delivery.package?.weight,
      address: delivery.receiver?.address,
      receiverName: delivery.receiver?.name,
      receiverPhone: delivery.receiver?.phone,
      houseId: null,
      createdAt: delivery.createdAt,
      deliveredAt: delivery.actualDeliveryTime,
      sequence: null
    }))
  ]
    .filter((item) => user?.Role !== 'customer' || item.source === 'delivery' || ownerHouseIds.has(item.houseId))
    .filter((item) => {
      const keyword = trackingQuery.trim().toLowerCase()
      if (!keyword) return true
      return [
        item.code,
        item.packageName,
        item.address,
        item.receiverName,
        item.receiverPhone,
        item.status
      ].some((value) => String(value || '').toLowerCase().includes(keyword))
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const selectedTracking = trackingItems.find((item) => item.id === selectedTrackingId) || trackingItems[0]

  const setRating = (id, value) => {
    setRatingById((prev) => ({ ...prev, [id]: value }))
  }

  const setFeedback = (id, value) => {
    setFeedbackById((prev) => ({ ...prev, [id]: value }))
  }

  const handleConfirm = async (delivery) => {
    const rating = ratingById[delivery._id]
    if (!rating) {
      alert(t('Please select a star rating before confirming.'))
      return
    }

    try {
      setConfirmingId(delivery._id)
      await confirmDelivery(delivery._id, {
        rating,
        feedback: feedbackById[delivery._id] || ''
      })
      await fetchDeliveries()
    } catch (error) {
      console.error('Error confirming delivery:', error)
      alert(error.response?.data?.message || t('Cannot confirm order'))
    } finally {
      setConfirmingId(null)
    }
  }

  const renderStars = (current, onSelect) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`text-xl transition ${current >= value ? 'text-yellow-500' : 'text-gray-300'}`}
          aria-label={`${t('Rating')} ${value}`}
        >
          ★
        </button>
      ))}
    </div>
  )

  const handleOrderChange = (e) => {
    const { name, value } = e.target
    setOrderForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setOrderMessage({ type: '', text: '' })

    if (!orderForm.houseId || !orderForm.name || !orderForm.weight) {
      setOrderMessage({ type: 'error', text: t('Please enter all required information') })
      return
    }

    try {
      await axios.post(`${ORDER_API_BASE}/location/orders/toggle`, {
        houseId: orderForm.houseId,
        action: 'add',
        package: {
          description: orderForm.name,
          weight: Number(orderForm.weight)
        }
      })

      setOrderMessage({ type: 'success', text: t('Order registered successfully') })
      setOrderForm({ houseId: '', name: '', weight: '' })
    } catch (error) {
      setOrderMessage({
        type: 'error',
        text: error.response?.data?.message || t('Cannot create order')
      })
    }
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString(locale)
  }

  const statusStyles = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-8 text-center">{t('Loading deliveries...')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{t('Deliveries')}</h1>
            <p className="text-gray-600 mt-1">{t('Track delivery status and confirm receipt')}</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-orange-100 text-sm text-gray-600">
            {t('Total orders:')} <span className="font-semibold text-gray-900">{deliveries.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            {user?.Role !== 'customer' ? (
              <DeliveryForm onSubmit={fetchDeliveries} />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{t('Create Delivery Order')}</h2>
                <p className="text-gray-600 mt-2"></p>

                <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">{t('Select house')}</label>
                    <select
                      name="houseId"
                      value={orderForm.houseId}
                      onChange={handleOrderChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    >
                      <option value="">{t('-- Select your house --')}</option>
                      {ownerHouses.map((house) => (
                        <option key={house._id} value={house._id}>
                          {house.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">{t('Order name')}</label>
                    <input
                      name="name"
                      value={orderForm.name}
                      onChange={handleOrderChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder={t('Example: documents, food')}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">{t('Payload (kg)')}</label>
                    <input
                      type="number"
                      name="weight"
                      min="0.1"
                      max="15"
                      step="0.1"
                      value={orderForm.weight}
                      onChange={handleOrderChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder={t('Example: 2.5')}
                      required
                    />
                  </div>

                  {orderMessage.text && (
                    <div className={`text-sm rounded-lg px-3 py-2 ${orderMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {orderMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    {t('Register order')}
                  </button>
                </form>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div><span className="font-semibold">{t('Full name:')}</span> {user?.FullName || 'N/A'}</div>
                  <div><span className="font-semibold">Email:</span> {user?.Email || 'N/A'}</div>
                  <div><span className="font-semibold">{t('Phone number:')}</span> {user?.Phone || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('Delivery Tracking')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {lastUpdated ? `${t('Last updated')}: ${formatDate(lastUpdated)}` : t('Live status for your orders')}
                  </p>
                </div>
                <button
                  onClick={() => fetchDeliveries()}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm font-semibold"
                >
                  {t('Refresh')}
                </button>
              </div>

              <input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder={t('Search by tracking code, address, or receiver')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />

              {trackingItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {t('No tracking records found')}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mt-5">
                  <div className="xl:col-span-2 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {trackingItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedTrackingId(item.id)}
                        className={`w-full text-left border rounded-xl p-4 transition ${
                          selectedTracking?.id === item.id
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-gray-900">{item.code}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.address || 'N/A'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${statusStyles(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${getProgress(item.status)}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="xl:col-span-3 border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50">
                    {selectedTracking && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">{t('Tracking code')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{selectedTracking.code}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles(selectedTracking.status)}`}>
                            {getStatusLabel(selectedTracking.status)}
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500 transition-all"
                              style={{ width: `${getProgress(selectedTracking.status)}%` }}
                            />
                          </div>
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {getTrackingSteps(selectedTracking.status).map((step) => (
                              <div key={step.key} className="text-center">
                                <div
                                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step.completed
                                      ? 'bg-green-500 text-white'
                                      : step.current
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  {step.completed ? '✓' : '•'}
                                </div>
                                <p className="text-[11px] text-gray-600 mt-2 leading-tight">{step.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-sm">
                          <div className="bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-xs text-gray-500">{t('Package')}</p>
                            <p className="font-semibold text-gray-900">{selectedTracking.packageName || 'N/A'}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedTracking.weight || 0} kg</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-xs text-gray-500">{t('Recipient')}</p>
                            <p className="font-semibold text-gray-900">{selectedTracking.receiverName || 'N/A'}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedTracking.receiverPhone || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-100 p-3 sm:col-span-2">
                            <p className="text-xs text-gray-500">{t('Delivery address')}</p>
                            <p className="font-semibold text-gray-900">{selectedTracking.address || 'N/A'}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-xs text-gray-500">{t('Created at')}</p>
                            <p className="font-semibold text-gray-900">{formatDate(selectedTracking.createdAt)}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-100 p-3">
                            <p className="text-xs text-gray-500">{t('Delivered at')}</p>
                            <p className="font-semibold text-gray-900">{formatDate(selectedTracking.deliveredAt)}</p>
                          </div>
                          {selectedTracking.sequence && (
                            <div className="bg-white rounded-lg border border-gray-100 p-3 sm:col-span-2">
                              <p className="text-xs text-gray-500">{t('Route stop')}</p>
                              <p className="font-semibold text-gray-900">#{selectedTracking.sequence}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('Recent Deliveries')}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">{t('Live')}</span>
              </div>
              {deliveries.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {t('No orders yet')}
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map(delivery => (
                    <div key={delivery._id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm text-gray-500">{t('Order code')}</p>
                          <p className="font-semibold text-gray-900 text-lg">{delivery.deliveryId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">{t('Recipient')}</div>
                          <div className="font-semibold">{delivery.receiver?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 mt-1">{delivery.receiver?.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{delivery.receiver?.email || 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">{t('Delivery address')}</div>
                          <div className="font-semibold">{delivery.receiver?.address || 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">{t('Created at')}</div>
                          <div className="font-semibold">{formatDate(delivery.createdAt)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">{t('Delivered at')}</div>
                          <div className="font-semibold">{formatDate(delivery.actualDeliveryTime)}</div>
                        </div>
                      </div>

                      {delivery.status === 'delivered' && !delivery.customerConfirmed && (
                        <div className="mt-4 space-y-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">{t('Rating:')}</span>
                            {renderStars(ratingById[delivery._id] || 0, (value) => setRating(delivery._id, value))}
                          </div>
                          <textarea
                            value={feedbackById[delivery._id] || ''}
                            onChange={(e) => setFeedback(delivery._id, e.target.value)}
                            placeholder={t('Your comment (optional)')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <button
                            onClick={() => handleConfirm(delivery)}
                            disabled={confirmingId === delivery._id}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
                          >
                            {confirmingId === delivery._id ? t('Processing...') : t('Confirm receipt')}
                          </button>
                        </div>
                      )}
                      {delivery.status === 'delivered' && delivery.customerConfirmed && (
                        <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                          {t('Confirmed at')} {formatDate(delivery.customerConfirmedAt)}
                          <div className="mt-1">{t('Rating')}: {delivery.customerRating} / 5</div>
                          {delivery.customerFeedback && (
                            <div className="mt-1 text-gray-700">{t('Comment')}: {delivery.customerFeedback}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
