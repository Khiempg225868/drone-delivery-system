import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'
import { appConfig } from '../config/runtimeConfig'

const ORDER_API_BASE = appConfig.orderBaseUrl || appConfig.apiBaseUrl
const NOTIFICATION_API_BASE = appConfig.notificationBaseUrl || appConfig.apiBaseUrl

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const { locale, t } = useLanguage()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [userHouses, setUserHouses] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const notificationsRef = useRef(null)
  const menuRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!user) return

    const fetchOwnerHouses = async () => {
      try {
        const housesRes = await axios.post(`${ORDER_API_BASE}/location/houses/search-customer`, {
          phone: user?.Phone,
          email: user?.Email
        })

        if (housesRes.data.houses && housesRes.data.houses.length > 0) {
          setUserHouses(housesRes.data.houses)
          setIsOwner(true)
        } else {
          setUserHouses([])
          setIsOwner(false)
        }
      } catch (err) {
        setUserHouses([])
        setIsOwner(false)
      }
    }

    fetchOwnerHouses()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    if (!isOwner || userHouses.length === 0) {
      alert(t('Bạn không phải là chủ sở hữu nhà. Chỉ chủ sở hữu mới có thể xem thông báo giao hàng của mình.'))
      return
    }

    setNotificationsLoading(true)
    try {
      const allNotifications = []

      for (const house of userHouses) {
        try {
          const response = await axios.get(`${NOTIFICATION_API_BASE}/location/notifications?houseId=${house._id}&limit=20&page=1`)
          if (response.data.notifications) {
            allNotifications.push(...response.data.notifications)
          }
        } catch (err) {
          console.error(`Error fetching notifications for house ${house._id}:`, err)
        }
      }

      allNotifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      setNotifications(allNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      alert(t('Lỗi: Không thể tải thông báo'))
    } finally {
      setNotificationsLoading(false)
    }
  }

  const toggleNotifications = async () => {
    const nextOpen = !showNotifications
    setShowNotifications(nextOpen)

    if (nextOpen) {
      await fetchNotifications()
    }
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  if (!token) return null

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-600">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <span className="text-3xl">🚁</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DroneFlow
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">
              {t('Welcome,')} <span className="font-bold text-gray-900">{user?.FullName}</span>
            </span>
            <LanguageSwitcher compact />
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                disabled={!isOwner}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${
                  !isOwner
                    ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                title={isOwner ? 'Thong bao giao hang' : 'Chi chu so huu co the xem'}
                aria-label="Thong bao giao hang"
              >
                {notificationsLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <span className="text-lg">🔔</span>
                )}
                {isOwner && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-4 h-4 min-w-[16px] px-1 rounded-full text-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <div
                className={`absolute right-0 mt-3 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-200 ease-out origin-top-right ${
                  showNotifications
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
                aria-hidden={!showNotifications}
              >
                <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Thong bao giao hang</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-sm opacity-90 hover:opacity-100"
                    >
                      X
                    </button>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Thong bao moi nhat cho nha cua ban</p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-600">
                      Dang tai thong bao...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Chua co thong bao nao
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.slice(0, 6).map((notif, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start gap-3">
                            <div className="text-xl">🏠</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">
                                  {notif.houseName}
                                </p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  notif.status === 'SENT'
                                    ? 'bg-green-100 text-green-800'
                                    : notif.status === 'FAILED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {notif.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notif.sentAt).toLocaleString(locale)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 6 && (
                  <div className="px-4 py-3 border-t bg-gray-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false)
                        navigate('/dashboard')
                      }}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Xem tat ca
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar with Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold hover:shadow-lg transition"
                title={user?.FullName}
              >
                {getInitials(user?.FullName)}
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user?.FullName}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <div className="space-y-1 p-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition"
                    >
                      👤 Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard')
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition"
                    >
                      📊 Dashboard
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
