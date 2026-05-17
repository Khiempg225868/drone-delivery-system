import { useState, useEffect } from 'react'
import { getDrones } from '../services/api'
import DroneList from '../components/DroneList'
import { useLanguage } from '../i18n/LanguageContext'

export default function Drones() {
  const { t } = useLanguage()
  const [drones, setDrones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrones()
  }, [])

  const fetchDrones = async () => {
    try {
      setLoading(true)
      const response = await getDrones()
      setDrones(response.data)
    } catch (error) {
      console.error('Error fetching drones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">{t('Loading drones...')}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">{t('Drone Fleet')}</h1>
        <DroneList drones={drones} onRefresh={fetchDrones} />
      </div>
    </div>
  )
}
