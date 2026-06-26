const runtimeWindow = typeof window !== 'undefined' ? window : undefined
const runtimeConfig = runtimeWindow?.__APP_CONFIG__ ?? {}
const buildTimeEnv = import.meta.env ?? {}

const readConfigValue = (runtimeKey, buildKey, fallback) => {
  return runtimeConfig[runtimeKey] || buildTimeEnv[buildKey] || fallback
}

export const appConfig = {
  apiBaseUrl: readConfigValue('APP_API_BASE_URL', 'VITE_API_BASE_URL', 'http://localhost:5002/api'),
  authBaseUrl: readConfigValue('APP_API_AUTH_URL', 'VITE_API_AUTH_URL', 'http://localhost:5001/api'),
  deliveryBaseUrl: readConfigValue('APP_API_DELIVERY_URL', 'VITE_API_DELIVERY_URL', 'http://localhost:5002/api'),
  orderBaseUrl: readConfigValue('APP_API_ORDER_URL', 'VITE_API_ORDER_URL', 'http://localhost:5003/api'),
  notificationBaseUrl: readConfigValue('APP_API_NOTIFICATION_URL', 'VITE_API_NOTIFICATION_URL', 'http://localhost:5004/api'),
}
