import { useLanguage } from '../i18n/LanguageContext'

export default function DroneList({ drones }) {
  const { t } = useLanguage()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drones.map(drone => (
        <div key={drone._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-blue-600 mb-4">{drone.name}</h3>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {drone.droneId}</p>
            <p><strong>{t('Status:')}</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-white ${
                drone.status === 'available' ? 'bg-green-500' : 
                drone.status === 'in_flight' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}>
                {drone.status}
              </span>
            </p>
            <p><strong>{t('Battery:')}</strong> <span className="text-green-600">{drone.batteryLevel}%</span></p>
            <p><strong>{t('Capacity:')}</strong> {drone.maxCapacity}kg</p>
          </div>
        </div>
      ))}
    </div>
  )
}
