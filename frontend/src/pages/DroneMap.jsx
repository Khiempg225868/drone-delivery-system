import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import axios from "axios"
import { useToast, ToastContainer } from '../components/Toast'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'

const ORDER_API_BASE = import.meta.env.VITE_API_ORDER_URL || import.meta.env.VITE_API_BASE_URL
const NOTIFICATION_API_BASE = import.meta.env.VITE_API_NOTIFICATION_URL || import.meta.env.VITE_API_BASE_URL

// House icons: white (not registered), green (registered), red (selected)
const houseIcon = (status) => {
  let bgColor, borderColor
  
  switch(status) {
    case 'selected': // Đang chọn giao hàng - Đỏ
      bgColor = 'hsl(0 84% 55%)'
      borderColor = 'hsl(0 84% 35%)'
      break
    case 'registered': // Đã đăng ký - Xanh
      bgColor = 'hsl(120 84% 55%)'
      borderColor = 'hsl(120 84% 35%)'
      break
    case 'notRegistered': // Chưa đăng ký - Trắng
    default:
      bgColor = 'white'
      borderColor = 'hsl(0 0% 70%)'
  }
  
  return L.divIcon({
    className: "drone-marker",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${bgColor};
      border:2px solid ${borderColor};
      box-shadow:0 1px 3px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const depotIcon = L.divIcon({
  className: "drone-marker",
  html: `<div style="
    width:32px;height:32px;border-radius:6px;
    background:hsl(220 90% 55%);color:white;
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:16px;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.6);
  ">D</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const droneIcon = L.divIcon({
  className: "drone-marker",
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:linear-gradient(135deg, hsl(280 85% 55%), hsl(320 85% 55%));
    color:white;display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:16px;border:3px solid white;
    box-shadow:0 0 12px rgba(200, 100, 255, 0.8);
    animation:pulse 1s infinite;
  ">🚁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    map.fitBounds(points, { padding: [60, 60], maxZoom: 19 })
  }, [points, map])
  return null
}

export default function DroneMap() {
  const DEPOT = { lat: 21.001763, lng: 105.941928 }
  const navigate = useNavigate()
  const location = useLocation()
  const [houses, setHouses] = useState([])
  const [activeIds, setActiveIds] = useState(new Set())
  const [route, setRoute] = useState([])
  const [loading, setLoading] = useState(false)
  const [sequenceMap, setSequenceMap] = useState(new Map())
  const [housesLoading, setHousesLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchForm, setSearchForm] = useState({ name: '', phone: '', email: '' })
  const [claimModal, setClaimModal] = useState({
    isOpen: false,
    houseId: null,
    house: null,
    formData: { name: '', phone: '', email: '' }
  })
  const [claiming, setClaiming] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [dronePosition, setDronePosition] = useState(null)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [deliveredCount, setDeliveredCount] = useState(0)
  const [deliveryLog, setDeliveryLog] = useState([])
  const [autoApplied, setAutoApplied] = useState(false)
  const { toasts, showToast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    initializeHouses()
  }, [])

  const initializeHouses = async () => {
    try {
      setHousesLoading(true)
      
      // Generate houses on first load
      try {
        await axios.post(`${ORDER_API_BASE}/location/houses/generate`)
      } catch (error) {
        // Houses already generated, continue
      }

      // Fetch all houses
      const housesRes = await axios.get(`${ORDER_API_BASE}/location/houses`)
      setHouses(housesRes.data)

      // Get active orders
      const ordersRes = await axios.get(`${ORDER_API_BASE}/location/orders`)
      const activeHouseIds = new Set(
        ordersRes.data.map((o) => o.houseId || o.houseId?._id)
      )
      setActiveIds(activeHouseIds)
    } catch (error) {
      console.error("Error initializing houses:", error)
    } finally {
      setHousesLoading(false)
    }
  }

  const openClaimModal = (house) => {
    const authToken = localStorage.getItem('token')
    if (!authToken) {
      showToast(`❌ ${t('Bạn phải đăng nhập trước')}`, 'error')
      return
    }

    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : {}
  
    setClaimModal({
      isOpen: true,
      houseId: house._id,
      house: house,
      formData: {
        name: user.FullName || '',
        phone: user.Phone || '',
        email: user.Email || ''
      }
    })
  }

  const closeClaimModal = () => {
    setClaimModal({
      isOpen: false,
      houseId: null,
      house: null,
      formData: { name: '', phone: '', email: '' }
    })
  }

  const handleClaimHouse = async (e) => {
    e.preventDefault()
    if (!claimModal.houseId) return

    setClaiming(true)
    try {
      await axios.post(
        `${ORDER_API_BASE}/location/houses/${claimModal.houseId}/register-owner`,
        {
          name: claimModal.formData.name,
          phone: claimModal.formData.phone,
          email: claimModal.formData.email
        }
      )

      showToast(`✓ Đã claim căn nhà: ${claimModal.house.address}`, 'success')
      closeClaimModal()
      initializeHouses()
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Lỗi khi claim căn nhà',
        'error'
      )
    } finally {
      setClaiming(false)
    }
  }

  const handleHouseClick = async (house) => {
    // ✅ Nếu chưa có owner, mở modal claim
    if (!house.hasOwner) {
      openClaimModal(house)
      return
    }

    const isActive = activeIds.has(house._id)
    try {
      const response = await axios.post(`${ORDER_API_BASE}/location/orders/toggle`, {
        houseId: house._id,
        lat: house.lat,
        lng: house.lng,
        action: isActive ? "remove" : "add",
      })

      if (response.data.houseIds && Array.isArray(response.data.houseIds)) {
        setActiveIds(new Set(response.data.houseIds))
        setRoute([])
        setSequenceMap(new Map())
        showToast(
          isActive ? '❌ Bỏ chọn căn nhà' : '✓ Chọn căn nhà thành công',
          'success'
        )
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error("Error toggling order:", error)
      if (error.response?.status === 400) {
        try {
          const ordersRes = await axios.get(`${ORDER_API_BASE}/location/orders`)
          const houseIds = ordersRes.data.map((o) => o.houseId || o.houseId?._id)
          setActiveIds(new Set(houseIds))
        } catch (refreshError) {
          console.error("Error refreshing orders:", refreshError)
        }
      }
      showToast(
        error.response?.data?.message || 'Lỗi: Không thể thay đổi đơn hàng',
        'error'
      )
    }
  }

  const handleOptimize = async () => {
    if (activeIds.size === 0) return
    setLoading(true)
    try {
      const res = await axios.post(`${ORDER_API_BASE}/location/orders/optimize`)
      const orderedIds = res.data.route.map((r) => r.houseId)
      setRoute(orderedIds)

      const seqMap = new Map()
      res.data.route.forEach((r) => {
        seqMap.set(r.houseId, r.sequence)
      })
      setSequenceMap(seqMap)
    } catch (error) {
      console.error("Error optimizing route:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const autoOptimize = new URLSearchParams(location.search).get('auto') === '1'
    if (!autoOptimize || autoApplied || activeIds.size === 0 || loading || isDelivering) return
    handleOptimize()
    setAutoApplied(true)
  }, [location.search, autoApplied, activeIds.size, loading, isDelivering])

  const handleClear = async () => {
    try {
      const selectedHouseIds = Array.from(activeIds)
      
      if (selectedHouseIds.length === 0) {
        showToast('Không có order nào được chọn', 'info')
        return
      }

      for (const houseId of selectedHouseIds) {
        await axios.post(`${ORDER_API_BASE}/location/orders/toggle`, {
          houseId,
          lat: 0,
          lng: 0,
          action: "remove",
        })
      }

      setActiveIds(new Set())
      setRoute([])
      setSequenceMap(new Map())
      showToast(`✓ Đã xóa ${selectedHouseIds.length} order được chọn`, 'success')
    } catch (error) {
      console.error("Error clearing orders:", error)
      showToast('Lỗi: Không thể xóa orders', 'error')
    }
  }

  // Send notification to house owner (non-blocking)
  const sendNotificationToOwner = async (house) => {
    try {
      console.log(`[Notification] Sending notification to ${house.address}...`)
      const response = await axios.post(`${NOTIFICATION_API_BASE}/location/notify-arrival`, {
        houseId: house._id,
        houseName: house.address,
        ownerPhone: house.owner?.phone,
        ownerEmail: house.owner?.email,
        message: `✅ Drone giao hàng đã tới nhà bạn tại ${house.address}. Vui lòng nhận hàng.`
      }, { timeout: 5000 }) // 5 second timeout

      console.log(`[Notification] Success for ${house.address}:`, response.data)

      // Add to delivery log with success status
      const logEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('vi-VN'),
        address: house.address,
        owner: house.owner?.name,
        phone: house.owner?.phone,
        status: '✅ Giao hàng thành công',
        notificationId: response.data.notification?.id
      }
      setDeliveryLog(prev => [...prev, logEntry])
      setDeliveredCount(prev => prev + 1)

      // showToast(`✅ Giao thành công tại ${house.address}\n👤 ${house.owner?.name}\n📞 ${house.owner?.phone}`, 'success')
    } catch (error) {
      console.error(`[Notification] Failed for ${house.address}:`, error.message, error.response?.status, error.response?.data)
      
      // Still log the delivery as successful even if notification failed
      const logEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('vi-VN'),
        address: house.address,
        owner: house.owner?.name,
        phone: house.owner?.phone,
        status: '✅ Giao thành công (Thông báo gửi tạo lỗi)',
        notificationId: null
      }
      setDeliveryLog(prev => [...prev, logEntry])
      setDeliveredCount(prev => prev + 1)
      
      // Show success toast but with warning about notification
      showToast(`✅ Giao thành công tại ${house.address}\n👤 ${house.owner?.name}\n⚠️ Thông báo gửi gặp lỗi`, 'success')
    }
  }

  // Animate drone to a specific location (with tracking callback to avoid stale state)
  const animateDroneToWithTracking = (startPos, targetLat, targetLng, duration = 3000, onPositionUpdate) => {
    return new Promise((resolve) => {
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const lat = startPos.lat + (targetLat - startPos.lat) * progress
        const lng = startPos.lng + (targetLng - startPos.lng) * progress

        onPositionUpdate({ lat, lng })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          onPositionUpdate({ lat: targetLat, lng: targetLng })
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  // Animate drone to a specific location (legacy, kept for compatibility)
  const animateDroneTo = (targetLat, targetLng, duration = 3000) => {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const startLat = dronePosition?.lat || DEPOT.lat
      const startLng = dronePosition?.lng || DEPOT.lng

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const lat = startLat + (targetLat - startLat) * progress
        const lng = startLng + (targetLng - startLng) * progress

        setDronePosition({ lat, lng })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  // Start delivery simulation
  const handleStartDelivery = async () => {
    if (route.length === 0) {
      showToast('Vui lòng tạo lộ trình trước', 'error')
      return
    }

    // Capture route and housesMap at the start to avoid stale closures
    const routeSnapshot = [...route]
    const housesMap = new Map(houses.map((h) => [h._id, h]))
    let isDeliveryActive = true
    let currentDronePos = { lat: DEPOT.lat, lng: DEPOT.lng }

    setIsDelivering(true)
    setCurrentStopIndex(0)
    setDronePosition(currentDronePos)
    setDeliveryLog([])
    setDeliveredCount(0)
    showToast('🚁 Bắt đầu giao hàng...', 'success')

    try {
      console.log(`[Delivery] Starting delivery with ${routeSnapshot.length} houses`)
      
      // Move to each house in the route (sequentially, without returning to depot)
      for (let i = 0; i < routeSnapshot.length; i++) {
        if (!isDeliveryActive) {
          console.log('[Delivery] Delivery cancelled')
          break
        }

        // Wait if paused
        while (isPaused && isDeliveryActive) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        setCurrentStopIndex(i + 1)
        const houseId = routeSnapshot[i]
        const house = housesMap.get(houseId)

        if (!house) {
          console.error(`[Delivery] House not found for ID: ${houseId}`)
          showToast(`⚠️ Không tìm thấy căn nhà #${i + 1}`, 'warning')
          continue
        }

        try {
          console.log(`[Delivery] Stop ${i + 1}/${routeSnapshot.length}: Moving from (${currentDronePos.lat.toFixed(6)}, ${currentDronePos.lng.toFixed(6)}) to ${house.address}`)
          
          // Animate drone to house location (using tracked position, not React state)
          await animateDroneToWithTracking(currentDronePos, house.lat, house.lng, 4000, (pos) => {
            currentDronePos = pos
            setDronePosition(pos)
          })
          console.log(`[Delivery] Reached ${house.address} at (${currentDronePos.lat.toFixed(6)}, ${currentDronePos.lng.toFixed(6)})`)

          // Send notification to owner
          await sendNotificationToOwner(house)
          console.log(`[Delivery] Notification sent for ${house.address}`)

          showToast(`✓ Đã giao hàng tại: ${house.address}`, 'success')

          // Wait 1 second before moving to next house
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (stepError) {
          console.error(`[Delivery] Error at step ${i + 1}:`, stepError)
          showToast(`Lỗi tại nhà #${i + 1}: ${stepError.message}`, 'error')
        }
      }

      // Return to depot
      console.log('[Delivery] Returning to depot')
      showToast('🚁 Trở về depot...', 'info')
      await animateDroneToWithTracking(currentDronePos, DEPOT.lat, DEPOT.lng, 4000, (pos) => {
        currentDronePos = pos
        setDronePosition(pos)
      })

      isDeliveryActive = false
      setIsDelivering(false)
      setDronePosition(null)
      setCurrentStopIndex(0)
      console.log(`[Delivery] Completed all ${routeSnapshot.length} deliveries`)
      showToast(`✅ Hoàn thành giao hàng ${routeSnapshot.length} ngôi nhà`, 'success')
    } catch (error) {
      console.error("[Delivery] Fatal error during delivery:", error)
      isDeliveryActive = false
      setIsDelivering(false)
      showToast('Lỗi: Giao hàng bị gián đoạn', 'error')
    }
  }

  // Pause delivery
  const handlePauseDelivery = () => {
    setIsPaused(!isPaused)
    showToast(isPaused ? '▶ Tiếp tục giao hàng' : '⏸ Tạm dừng giao hàng', 'info')
  }

  // Stop delivery
  const handleStopDelivery = async () => {
    console.log('[Delivery] Stop button clicked')
    setIsDelivering(false)
    setIsPaused(false)
    setDronePosition(null)
    setCurrentStopIndex(0)
    showToast('🛑 Dừng giao hàng', 'warning')
  }

  const houseById = useMemo(() => new Map(houses.map((h) => [h._id, h])), [houses])

  const polyline = useMemo(() => {
    if (route.length === 0) return []
    const pts = [[DEPOT.lat, DEPOT.lng]]
    for (const id of route) {
      const h = houseById.get(id)
      if (h) pts.push([h.lat, h.lng])
    }
    pts.push([DEPOT.lat, DEPOT.lng])
    return pts
  }, [route, houseById])

  if (housesLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading houses...</p>
        </div>
      </div>
    )
  }

  const handleSearchOwner = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${ORDER_API_BASE}/location/houses/search-owner`, {
        name: searchForm.name,
        phone: searchForm.phone,
        email: searchForm.email,
      })
      setSearchResults(response.data.houses)
    } catch (error) {
      showToast('Không tìm thấy căn nhà', 'error')
    }
  }

  const handleAutoSelect = async (house) => {
    if (!house.hasOwner) {
      showToast('Căn nhà này chưa có chủ sở hữu', 'error')
      return
    }

    try {
      const response = await axios.post(`${ORDER_API_BASE}/location/orders/toggle`, {
        houseId: house._id,
        lat: house.lat,
        lng: house.lng,
        action: "add",
      })

      if (response.data.orders && Array.isArray(response.data.orders)) {
        setActiveIds(new Set(response.data.orders))
        setRoute([])
        setSequenceMap(new Map())
        setSearchResults([])
        setSearchForm({ name: '', phone: '', email: '' })
        showToast(`✓ Đã chọn căn nhà của ${house.owner.name}`, 'success')
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi chọn căn nhà', 'error')
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      <ToastContainer toasts={toasts} />

      {/* Claim House Modal */}
      {claimModal.isOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">📍 {t('Register House')}</h2>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600">{t('Address:')}</p>
              <p className="font-semibold text-gray-900">{claimModal.house?.address}</p>
            </div>

            <form onSubmit={handleClaimHouse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Full Name')}
                </label>
                <input
                  type="text"
                  value={claimModal.formData.name}
                  onChange={(e) =>
                    setClaimModal({
                      ...claimModal,
                      formData: { ...claimModal.formData, name: e.target.value }
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('Enter full name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Phone Number')}
                </label>
                <input
                  type="tel"
                  value={claimModal.formData.phone}
                  onChange={(e) =>
                    setClaimModal({
                      ...claimModal,
                      formData: { ...claimModal.formData, phone: e.target.value }
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('Enter phone number')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={claimModal.formData.email}
                  onChange={(e) =>
                    setClaimModal({
                      ...claimModal,
                      formData: { ...claimModal.formData, email: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('Enter email')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeClaimModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {claiming ? t('Processing...') : `✓ ${t('Register house')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delivery Status Panel */}
      {isDelivering && (
        <div className="absolute top-20 right-4 z-[900] bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl p-5 w-80 text-white border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="animate-spin">🚁</span> {t('Delivering')}
            </h3>
            <span className={`text-sm px-3 py-1 rounded-full ${
              isPaused 
                ? 'bg-yellow-500/30 border border-yellow-300' 
                : 'bg-green-500/30 border border-green-300'
            }`}>
              {isPaused ? `⏸ ${t('Pause')}` : `▶ ${t('Running')}`}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm opacity-90">{t('Delivery progress')}</p>
              <div className="mt-1 w-full bg-white/30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStopIndex + 1) / route.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 font-semibold">
                Stop {currentStopIndex + 1} / {route.length}
              </p>
              <p className="text-xs mt-1 opacity-75">✅ {t('Delivered:')} {deliveredCount}</p>
            </div>

            {route[currentStopIndex] && houseById.get(route[currentStopIndex]) && (
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm opacity-90">{t('Current delivery stop')}</p>
                <p className="font-semibold text-sm mt-1">
                  {houseById.get(route[currentStopIndex])?.address}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  👤 {houseById.get(route[currentStopIndex])?.owner?.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Log Panel */}
      {deliveryLog.length > 0 && (
        <div className="absolute top-20 right-96 z-[900] bg-white rounded-xl shadow-xl p-4 border border-gray-200 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              📋 {t('Delivery history')} ({deliveryLog.length})
            </h3>
            {isDelivering && <span className="animate-pulse text-green-600 text-2xl">●</span>}
          </div>
          
          <div className="space-y-2">
            {deliveryLog.map((entry, idx) => (
              <div key={entry.id} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg text-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">#{idx + 1} {entry.address}</p>
                    <p className="text-xs text-gray-600 mt-1">👤 {entry.owner}</p>
                    <p className="text-xs text-gray-600">📱 {entry.phone}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold text-green-700">{entry.status}</span>
                      <span className="text-xs text-gray-500">{entry.time}</span>
                    </div>
                  </div>
                </div>
                {entry.notificationId && (
                  <p className="text-xs text-green-600 mt-2">✓ {t('Notification ID:')} {entry.notificationId.substring(0, 8)}...</p>
                )}
              </div>
            ))}
          </div>
          
          {!isDelivering && deliveryLog.length > 0 && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm font-bold text-green-800">✅ {t('Delivery completed')}</p>
              <p className="text-xs text-green-700 mt-1">{t('Total:')} {deliveredCount} {t('points')}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Search Owner Section */}
      <div className="absolute top-20 left-4 z-[900] bg-white rounded-xl shadow-xl p-4 w-80 max-h-96 overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">🔍 {t('Search owner')}</h3>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-600 hover:text-gray-900"
          >
            {showSearch ? '✕' : '≡'}
          </button>
        </div>

        {showSearch && (
          <>
            <form onSubmit={handleSearchOwner} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder={t('Owner name')}
                value={searchForm.name}
                onChange={(e) => setSearchForm({...searchForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="tel"
                placeholder={t('Phone number')}
                value={searchForm.phone}
                onChange={(e) => setSearchForm({...searchForm, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={searchForm.email}
                onChange={(e) => setSearchForm({...searchForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                {t('Search')}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">{t('Results')} ({searchResults.length}):</p>
                {searchResults.map((house) => (
                  <div
                    key={house._id}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="font-semibold text-gray-800">{house.address}</p>
                    <p className="text-sm text-gray-600">👤 {house.owner?.name}</p>
                    <p className="text-sm text-gray-600">📱 {house.owner?.phone}</p>
                    <button
                      onClick={() => handleAutoSelect(house)}
                      disabled={activeIds.has(house._id)}
                      className="mt-2 w-full bg-green-500 text-white py-1 px-2 rounded text-sm font-semibold hover:bg-green-600 disabled:bg-gray-400"
                    >
                      {activeIds.has(house._id) ? `✓ ${t('Selected')}` : `+ ${t('Selected for delivery')}`}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Bar - Compact */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-gray-200 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            title={t('Go back')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('Back')}
          </button>
          <div className="pl-4 border-l border-gray-300">
            <div className="font-bold text-lg text-gray-800">🚁 Drone Delivery Map</div>
            <div className="text-xs text-gray-500">{t('Vinhomes, Hanoi')}</div>
          </div>
        </div>
        <LanguageSwitcher compact />
      </div>

      {/* Stats Info Panel - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[900] bg-white rounded-xl shadow-xl p-4 border border-gray-200 w-72">
        <h3 className="font-bold text-lg text-gray-800 mb-3">📊 {t('Order information')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <span className="text-gray-700 font-medium">{t('Total houses:')}</span>
            <span className="font-bold text-blue-600 text-lg">{houses.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
            <span className="text-gray-700 font-medium">{t('Selected:')}</span>
            <span className="font-bold text-green-600 text-lg">{activeIds.size}</span>
          </div>
          {route.length > 0 && (
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">{t('Route:')}</span>
              <span className="font-bold text-purple-600 text-lg">{route.length}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">📍 {t('Legend')}</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-400"></div>
              <span className="text-sm text-gray-600">{t('Not registered')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700"></div>
              <span className="text-sm text-gray-600">{t('Registered')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700"></div>
              <span className="text-sm text-gray-600">{t('Selected for delivery')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons Panel - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-[900] bg-white rounded-xl shadow-xl p-4 border border-gray-200 w-56">
        <div className="space-y-2">
          <button
            onClick={handleClear}
            disabled={activeIds.size === 0 || isDelivering}
            className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('Clear all')}
          </button>
          <button
            onClick={handleOptimize}
            disabled={activeIds.size === 0 || loading || isDelivering}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {loading ? t('Optimizing...') : t('Optimize route')}
          </button>

          {/* Delivery Control Buttons */}
          {!isDelivering ? (
            <button
              onClick={handleStartDelivery}
              disabled={route.length === 0}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2 animate-pulse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🚁 {t('Start delivery')}
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseDelivery}
                className={`w-full px-4 py-2.5 ${
                  isPaused
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                } text-white rounded-lg transition font-semibold text-sm flex items-center justify-center gap-2`}
              >
                {isPaused ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    ▶ {t('Continue')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    ⏸ {t('Pause')}
                  </>
                )}
              </button>
              <button
                onClick={handleStopDelivery}
                className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h12v12H6V4z" />
                </svg>
                🛑 {t('Stop delivery')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 bottom-0 pt-16" style={{ zIndex: 1 }}>
        <MapContainer
          center={[DEPOT.lat, DEPOT.lng]}
          zoom={17}
          minZoom={12}
          maxZoom={19}
          style={{ height: "100%", width: "100%", backgroundColor: "#f0f0f0" }}
          dragging={true}
          scrollWheelZoom={true}
          touchZoom={true}
          zoomControl={false}
          maxBoundsViscosity={1.0}
        >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          tms={false}
        />

        <Marker position={[DEPOT.lat, DEPOT.lng]} icon={depotIcon}>
          <Popup>
            <div className="font-semibold">Depot - Vinhomes</div>
            <div className="text-sm">
              Lat: {DEPOT.lat.toFixed(6)}
              <br />
              Lng: {DEPOT.lng.toFixed(6)}
            </div>
          </Popup>
        </Marker>

        {houses.map((h) => {
          const isSelected = activeIds.has(h._id)
          const seq = sequenceMap.get(h._id)
          
          let status = 'notRegistered'
          if (!h.hasOwner) {
            status = 'notRegistered'
          } else if (isSelected) {
            status = 'selected'
          } else if (h.hasOwner) {
            status = 'registered'
          }
          
          return (
            <Marker
              key={h._id}
              position={[h.lat, h.lng]}
              icon={houseIcon(status)}
              eventHandlers={{ click: () => handleHouseClick(h) }}
            >
              <Popup>
                <div className="w-48">
                  <div className="font-semibold">{h.address}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    ID: {h.houseId}
                  </div>
                  <div className="text-sm text-gray-600">
                    Lat: {h.lat.toFixed(6)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Lng: {h.lng.toFixed(6)}
                  </div>
                  {h.hasOwner && (
                    <div className="mt-2 p-2 bg-blue-100 rounded">
                      <p className="text-blue-700 font-semibold text-sm">👤 {h.owner?.name}</p>
                      <p className="text-blue-600 text-xs">📱 {h.owner?.phone}</p>
                    </div>
                  )}
                  {isSelected && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                      <span className="text-red-700 font-semibold">🔴 {t('Selected for delivery')}</span>
                      {seq && (
                        <div className="text-sm text-red-600">Stop #{seq}</div>
                      )}
                    </div>
                  )}
                  {!isSelected && h.hasOwner && (
                    <div className="mt-2 p-2 bg-green-100 rounded">
                      <span className="text-green-700 font-semibold">✓ {t('Registered')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleHouseClick(h)}
                    disabled={!h.hasOwner}
                    className={`mt-2 w-full py-1 px-2 rounded text-sm font-semibold transition ${
                      isSelected
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : h.hasOwner
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {!h.hasOwner 
                      ? `❌ ${t('No owner yet')}`
                      : isSelected 
                      ? `❌ ${t('Remove selection')}` 
                      : `✓ ${t('Selected for delivery')}`}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Drone Marker - Show during delivery */}
        {dronePosition && (
          <Marker position={[dronePosition.lat, dronePosition.lng]} icon={droneIcon}>
            <Popup>
              <div className="font-semibold">🚁 {t('Drone delivering')}</div>
              <div className="text-sm">Stop #{currentStopIndex + 1}/{route.length}</div>
              <div className="text-sm text-gray-600">
                Lat: {dronePosition.lat.toFixed(6)}
              </div>
              <div className="text-sm text-gray-600">
                Lng: {dronePosition.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {polyline.length > 0 && (
          <>
            <Polyline
              positions={polyline}
              pathOptions={{
                color: "hsl(220, 90%, 55%)",
                weight: 4,
                opacity: 0.8,
                dashArray: "5, 5",
              }}
            />
            
            {polyline.map((point, idx) => {
              if (idx === 0 || idx === polyline.length - 1) return null
              
              const nextPoint = polyline[idx + 1]
              if (!nextPoint) return null
              
              const lat1 = point[0] * Math.PI / 180
              const lat2 = nextPoint[0] * Math.PI / 180
              const lng1 = point[1] * Math.PI / 180
              const lng2 = nextPoint[1] * Math.PI / 180
              
              const y = Math.sin(lng2 - lng1) * Math.cos(lat2)
              const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
              const angle = Math.atan2(y, x) * 180 / Math.PI
              
              const midLat = (point[0] + nextPoint[0]) / 2
              const midLng = (point[1] + nextPoint[1]) / 2
              
              return (
                <Marker
                  key={`arrow-${idx}`}
                  position={[midLat, midLng]}
                  icon={L.divIcon({
                    className: "direction-arrow",
                    html: `<div style="
                      width: 20px;
                      height: 20px;
                      background: hsl(220, 90%, 55%);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: 12px;
                      transform: rotate(${angle}deg);
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">→</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                />
              )
            })}
            
            {route.map((houseId, idx) => {
              const house = houseById.get(houseId)
              if (!house) return null
              
              return (
                <Marker
                  key={`stop-${houseId}`}
                  position={[house.lat, house.lng]}
                  icon={L.divIcon({
                    className: "stop-number",
                    html: `<div style="
                      width: 24px;
                      height: 24px;
                      background: hsl(0, 84%, 55%);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: 12px;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${idx + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                />
              )
            })}
          </>
        )}

        <FitBounds points={polyline} />
      </MapContainer>
      </div>
    </div>
  )
}
