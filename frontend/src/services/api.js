import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Account/Auth endpoints
export const loginAccount = (data) => api.post('/account/login', data)
export const createAccount = (data) => api.post('/account/create', data)
export const changePassword = (data) => api.post('/account/change-password', data)
export const forgetPassword = (data) => api.post('/account/forget-password', data)
export const getAllAccounts = () => api.get('/account/get-all')
export const updateAccount = (id, data) => api.put(`/account/${id}`, data)
export const removeAccount = (id) => api.delete(`/account/${id}`)

// Drones
export const getDrones = () => api.get('/drones')
export const getDroneById = (id) => api.get(`/drones/${id}`)
export const createDrone = (data) => api.post('/drones', data)
export const updateDrone = (id, data) => api.put(`/drones/${id}`, data)
export const deleteDrone = (id) => api.delete(`/drones/${id}`)

// Deliveries
export const getDeliveries = () => api.get('/deliveries')
export const getMyDeliveries = () => api.get('/deliveries/my')
export const getDeliveryById = (id) => api.get(`/deliveries/${id}`)
export const createDelivery = (data) => api.post('/deliveries', data)
export const updateDelivery = (id, data) => api.put(`/deliveries/${id}`, data)
export const deleteDelivery = (id) => api.delete(`/deliveries/${id}`)
export const confirmDelivery = (id, data) => api.post(`/deliveries/${id}/confirm`, data)

export default api