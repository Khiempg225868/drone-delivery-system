import { useState } from 'react'
import { createDelivery } from '../services/api'
import { useLanguage } from '../i18n/LanguageContext'

export default function DeliveryForm({ onSubmit }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    deliveryId: '',
    sender: { name: '', phone: '', address: '' },
    receiver: { name: '', phone: '', address: '', latitude: 0, longitude: 0 },
    package: { weight: '', description: '' },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createDelivery(formData)
      setFormData({
        deliveryId: '',
        sender: { name: '', phone: '', address: '' },
        receiver: { name: '', phone: '', address: '', latitude: 0, longitude: 0 },
        package: { weight: '', description: '' },
      })
      onSubmit()
    } catch (error) {
      console.error('Error creating delivery:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{t('Create Delivery')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={t('Delivery ID')}
          name="deliveryId"
          value={formData.deliveryId}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {t('Create Delivery')}
        </button>
      </form>
    </div>
  )
}
