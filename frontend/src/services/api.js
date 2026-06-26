import axios from 'axios'
import { appConfig } from '../config/runtimeConfig'

const API_BASE_URL = appConfig.apiBaseUrl
const AUTH_BASE_URL = appConfig.authBaseUrl || API_BASE_URL
const DELIVERY_BASE_URL = appConfig.deliveryBaseUrl || API_BASE_URL
const ORDER_BASE_URL = appConfig.orderBaseUrl || API_BASE_URL
const NOTIFICATION_BASE_URL = appConfig.notificationBaseUrl || API_BASE_URL

const createApi = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return instance
}

const authApi = createApi(AUTH_BASE_URL)
const deliveryApi = createApi(DELIVERY_BASE_URL)
const orderApi = createApi(ORDER_BASE_URL)
const notificationApi = createApi(NOTIFICATION_BASE_URL)

// Account/Auth endpoints
export const loginAccount = (data) => authApi.post('/account/login', data)
export const createAccount = (data) => authApi.post('/account/create', data)
export const changePassword = (data) => authApi.post('/account/change-password', data)
export const forgetPassword = (data) => authApi.post('/account/forget-password', data)
export const getAllAccounts = () => authApi.get('/account/get-all')
export const updateAccount = (id, data) => authApi.put(`/account/${id}`, data)
export const removeAccount = (id) => authApi.delete(`/account/${id}`)

// Drones
export const getDrones = () => deliveryApi.get('/drones')
export const getDroneById = (id) => deliveryApi.get(`/drones/${id}`)
export const createDrone = (data) => deliveryApi.post('/drones', data)
export const updateDrone = (id, data) => deliveryApi.put(`/drones/${id}`, data)
export const deleteDrone = (id) => deliveryApi.delete(`/drones/${id}`)

// Deliveries
export const getDeliveries = () => deliveryApi.get('/deliveries')
export const getMyDeliveries = () => deliveryApi.get('/deliveries/my')
export const getDeliveryById = (id) => deliveryApi.get(`/deliveries/${id}`)
export const createDelivery = (data) => deliveryApi.post('/deliveries', data)
export const updateDelivery = (id, data) => deliveryApi.put(`/deliveries/${id}`, data)
export const deleteDelivery = (id) => deliveryApi.delete(`/deliveries/${id}`)
export const confirmDelivery = (id, data) => deliveryApi.post(`/deliveries/${id}/confirm`, data)

export { orderApi, notificationApi }

export default deliveryApi