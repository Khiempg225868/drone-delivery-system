import { useState, useEffect } from 'react'
import { confirmDelivery, getDeliveries, getMyDeliveries } from '../services/api'
import DeliveryForm from '../components/DeliveryForm'
import { useAuth } from '../hooks/useAuth'

export default function Deliveries() {
  const { user } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingById, setRatingById] = useState({})
  const [feedbackById, setFeedbackById] = useState({})
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    fetchDeliveries()
  }, [user])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const response = user?.Role === 'customer'
        ? await getMyDeliveries()
        : await getDeliveries()
      setDeliveries(response.data)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const setRating = (id, value) => {
    setRatingById((prev) => ({ ...prev, [id]: value }))
  }

  const setFeedback = (id, value) => {
    setFeedbackById((prev) => ({ ...prev, [id]: value }))
  }

  const handleConfirm = async (delivery) => {
    const rating = ratingById[delivery._id]
    if (!rating) {
      alert('Vui long chon so sao danh gia truoc khi xac nhan.')
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
      alert(error.response?.data?.message || 'Loi xac nhan don hang')
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
          aria-label={`Danh gia ${value} sao`}
        >
          ★
        </button>
      ))}
    </div>
  )

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString('vi-VN')
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
    return <div className="p-8 text-center">Loading deliveries...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Deliveries</h1>
            <p className="text-gray-600 mt-1">Theo doi tinh trang giao hang va xac nhan nhan hang</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-orange-100 text-sm text-gray-600">
            Tong so don: <span className="font-semibold text-gray-900">{deliveries.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {user?.Role !== 'customer' ? (
              <DeliveryForm onSubmit={fetchDeliveries} />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Thong tin khach hang</h2>
                <p className="text-gray-600 mt-2">Ban chi xem va xac nhan cac don hang cua chinh minh.</p>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div><span className="font-semibold">Ho ten:</span> {user?.FullName || 'N/A'}</div>
                  <div><span className="font-semibold">Email:</span> {user?.Email || 'N/A'}</div>
                  <div><span className="font-semibold">So dien thoai:</span> {user?.Phone || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recent Deliveries</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">Live</span>
              </div>
              {deliveries.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Chua co don hang nao
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map(delivery => (
                    <div key={delivery._id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Ma don</p>
                          <p className="font-semibold text-gray-900 text-lg">{delivery.deliveryId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">Nguoi nhan</div>
                          <div className="font-semibold">{delivery.receiver?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 mt-1">{delivery.receiver?.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{delivery.receiver?.email || 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">Dia chi giao</div>
                          <div className="font-semibold">{delivery.receiver?.address || 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">Tao luc</div>
                          <div className="font-semibold">{formatDate(delivery.createdAt)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500">Giao luc</div>
                          <div className="font-semibold">{formatDate(delivery.actualDeliveryTime)}</div>
                        </div>
                      </div>

                      {delivery.status === 'delivered' && !delivery.customerConfirmed && (
                        <div className="mt-4 space-y-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Danh gia:</span>
                            {renderStars(ratingById[delivery._id] || 0, (value) => setRating(delivery._id, value))}
                          </div>
                          <textarea
                            value={feedbackById[delivery._id] || ''}
                            onChange={(e) => setFeedback(delivery._id, e.target.value)}
                            placeholder="Nhan xet cua ban (tuy chon)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <button
                            onClick={() => handleConfirm(delivery)}
                            disabled={confirmingId === delivery._id}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
                          >
                            {confirmingId === delivery._id ? 'Dang xu ly...' : 'Xac nhan da nhan hang'}
                          </button>
                        </div>
                      )}
                      {delivery.status === 'delivered' && delivery.customerConfirmed && (
                        <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                          Da xac nhan luc {formatDate(delivery.customerConfirmedAt)}
                          <div className="mt-1">Danh gia: {delivery.customerRating} / 5</div>
                          {delivery.customerFeedback && (
                            <div className="mt-1 text-gray-700">Nhan xet: {delivery.customerFeedback}</div>
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