import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: `${API_URL}/api` })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sg_token')
      localStorage.removeItem('sg_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  register: (data) => api.post('/auth/register', data),
  getPending: () => api.get('/auth/pending'),
  approve: (id) => api.post(`/auth/approve/${id}`),
  reject: (id) => api.post(`/auth/reject/${id}`),
}

export const workersAPI = {
  getAll: () => api.get('/workers'),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`)
}

export const supervisorsAPI = {
  getAll: () => api.get('/supervisors'),
  getById: (id) => api.get(`/supervisors/${id}`),
  create: (data) => api.post('/supervisors', data),
  update: (id, data) => api.put(`/supervisors/${id}`, data),
  delete: (id) => api.delete(`/supervisors/${id}`),
  assignWorker: (id, workerId) => api.post(`/supervisors/${id}/assign-worker`, { workerId })
}

export const devicesAPI = {
  getAll: () => api.get('/devices'),
  toggle: (id) => api.put(`/devices/${id}/toggle`)
}

export const sensorsAPI = {
  getRealtime: () => api.get('/sensors/realtime'),
  getWorkerData: (workerId) => api.get(`/sensors/worker/${workerId}`)
}

export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getActive: () => api.get('/alerts/active'),
  resolve: (id) => api.put(`/alerts/${id}/resolve`)
}

export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getSupervisor: () => api.get('/dashboard/supervisor'),
  getWorker: () => api.get('/dashboard/worker')
}

export const reportsAPI = {
  getSummary: () => api.get('/reports/summary'),
  getAlerts: () => api.get('/reports/alerts'),
  getWorkers: () => api.get('/reports/workers')
}

export default api
