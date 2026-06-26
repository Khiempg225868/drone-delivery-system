import { useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../i18n/LanguageContext'
import { appConfig } from '../config/runtimeConfig'

const ORDER_API_BASE = appConfig.orderBaseUrl || appConfig.apiBaseUrl

export default function AdminLocations() {
  const { t } = useLanguage()
  const [coordsText, setCoordsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [preview, setPreview] = useState([])

  // Parse coordinates from text (format: lat, lng on each line)
  const parseCoordinates = (text) => {
    const lines = text.trim().split('\n')
    const coords = []
    
    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length === 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({ lat, lng })
        }
      }
    })
    
    return coords
  }

  const handleTextChange = (e) => {
    const text = e.target.value
    setCoordsText(text)
    setPreview(parseCoordinates(text))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (preview.length === 0) {
      setMessage({ type: 'error', text: t('No valid coordinates found') })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        `${ORDER_API_BASE}/location/houses/batch`,
        { houses: preview }
      )
      
      setMessage({
        type: 'success',
        text: t('Added {count} houses successfully!', { count: response.data.count }),
      })
      
      setCoordsText('')
      setPreview([])
      
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('Failed to add houses'),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📍 {t('House Coordinate Management')}
        </h1>
        <p className="text-gray-600">
          {t('Add or update house coordinates in the system')}
        </p>
      </div>

      {/* Alerts */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Enter Coordinates')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('Format: lat, lng (one coordinate per line)')}
              </label>
              <textarea
                value={coordsText}
                onChange={handleTextChange}
                placeholder="20.987141, 105.950775
20.988112, 105.944377
20.990237, 105.946258
..."
                className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 {t('Tip:')}</span> {t('Paste the coordinates below:')}
              </p>
              <code className="block mt-2 text-xs text-blue-700 whitespace-pre-wrap">
                20.987141, 105.950775
                20.988112, 105.944377
                20.990237, 105.946258
                20.996968, 105.953539
                20.996914, 105.952972
                20.991558, 105.958092
                20.991570, 105.959006
              </code>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || preview.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                {loading ? `⏳ ${t('Adding...')}` : `✓ ${t('Add')} ${preview.length} ${t('houses')}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCoordsText('')
                  setPreview([])
                }}
                className="px-6 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition"
              >
                🗑️ {t('Delete')}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('Preview')} ({preview.length})
          </h2>

          {preview.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>{t('No coordinates entered yet')}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preview.map((coord, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {t('House #')}{idx + 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Lat: {coord.lat.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Lng: {coord.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="text-3xl">🏠</div>
                </div>
              ))}
            </div>
          )}

          {preview.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ {t('Ready to add')} <span className="font-bold">{preview.length}</span>{' '}
                {t('houses to the system')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ {t('Information')}</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✓ {t('Each coordinate must be:')} <code className="bg-white px-2 py-1 rounded">lat, lng</code></li>
          <li>✓ {t('New houses will be numbered automatically from the current highest ID')}</li>
          <li>✓ {t('All new houses will be in "not registered" status')}</li>
          <li>✓ {t('You can add multiple batches without duplicate concerns')}</li>
        </ul>
      </div>
    </div>
  )
}
