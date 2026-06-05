import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  verify: () => api.post('/auth/verify'),
  demoUsers: () => api.get('/auth/demo-users')
};

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getOverview: () => api.get('/dashboard/overview'),
  getRecentAlerts: () => api.get('/dashboard/recent-alerts'),
  getDeviceHealth: () => api.get('/dashboard/device-health')
};

// Alerts endpoints
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  updateStatus: (id, status) => api.patch(`/alerts/${id}/status`, { status }),
  delete: (id) => api.delete(`/alerts/${id}`),
  getStats: () => api.get('/alerts/stats/overview')
};

// Devices endpoints
export const devicesAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  updateStatus: (id, status) => api.patch(`/devices/${id}/status`, { status }),
  delete: (id) => api.delete(`/devices/${id}`)
};

// Sensors endpoints
export const sensorsAPI = {
  getAll: (params) => api.get('/sensors', { params }),
  getById: (id) => api.get(`/sensors/${id}`),
  getReadings: (id) => api.get(`/sensors/${id}/readings`),
  create: (data) => api.post('/sensors', data),
  update: (id, data) => api.put(`/sensors/${id}`, data),
  addReading: (id, value) => api.post(`/sensors/${id}/reading`, { value }),
  delete: (id) => api.delete(`/sensors/${id}`)
};

// Workers endpoints
export const workersAPI = {
  getAll: () => api.get('/workers'),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  assignDevice: (id, deviceId) => api.patch(`/workers/${id}/assign-device`, { deviceId }),
  delete: (id) => api.delete(`/workers/${id}`)
};

// Supervisors endpoints
export const supervisorsAPI = {
  getAll: () => api.get('/supervisors'),
  getById: (id) => api.get(`/supervisors/${id}`),
  create: (data) => api.post('/supervisors', data),
  update: (id, data) => api.put(`/supervisors/${id}`, data),
  assignWorker: (id, workerId) => api.patch(`/supervisors/${id}/assign-worker`, { workerId }),
  delete: (id) => api.delete(`/supervisors/${id}`)
};

// Reports endpoints
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  generateMonthly: () => api.post('/reports/generate/monthly'),
  generateAlertAnalysis: () => api.post('/reports/generate/alert-analysis'),
  generateHealth: () => api.post('/reports/generate/health'),
  delete: (id) => api.delete(`/reports/${id}`)
};

export default api;
