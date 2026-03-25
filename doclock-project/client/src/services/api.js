import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://doclock-v63v.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/* ── Request: attach JWT ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doclock_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response: handle 401 globally ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('doclock_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/* Auth */
export const authAPI = {
  login:    (data)   => api.post('/auth/login', data),
  register: (data)   => api.post('/auth/register', data),
  logout:   ()       => api.post('/auth/logout'),
  me:       ()       => api.get('/auth/me'),
  verify:   (code)   => api.post('/auth/verify', { code }),
  forgotPw: (email)  => api.post('/auth/forgot-password', { email }),
  resetPw:  (data)   => api.post('/auth/reset-password', data),
}

/* Doctors */
export const doctorsAPI = {
  list:        (params) => api.get('/doctors', { params }),
  getById:     (id)     => api.get(`/doctors/${id}`),
  getSlots:    (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
}

/* Appointments */
export const appointmentsAPI = {
  list:    (params) => api.get('/appointments', { params }),
  create:  (data)   => api.post('/appointments', data),
  getById: (id)     => api.get(`/appointments/${id}`),
  cancel:  (id)     => api.patch(`/appointments/${id}/cancel`),
  update:  (id, d)  => api.patch(`/appointments/${id}`, d),
}

/* Admin */
export const adminAPI = {
  stats:      ()       => api.get('/admin/stats'),
  users:      (p)      => api.get('/admin/users', { params: p }),
  updateUser: (id, d)  => api.patch(`/admin/users/${id}`, d),
  deleteUser: (id)     => api.delete(`/admin/users/${id}`),
  allAppts:   (p)      => api.get('/admin/appointments', { params: p }),
}

export default api