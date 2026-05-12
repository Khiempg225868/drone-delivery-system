import { useState, useEffect } from 'react'
import { getDeliveries } from '../services/api'
import DeliveryForm from '../components/DeliveryForm'

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const response = await getDeliveries()
      setDeliveries(response.data)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading deliveries...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Deliveries</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <DeliveryForm onSubmit={fetchDeliveries} />
          </div>
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Deliveries</h2>
              {deliveries.length === 0 ? (
                <p className="text-gray-500">No deliveries yet</p>
              ) : (
                <div className="space-y-4">
                  {deliveries.map(delivery => (
                    <div key={delivery._id} className="border rounded p-4 hover:bg-gray-50">
                      <p className="font-semibold text-gray-800">{delivery.deliveryId}</p>
                      <p className="text-sm text-gray-500">Status: {delivery.status}</p>
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