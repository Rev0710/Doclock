import axios from 'axios'

function apiTimeoutMs() {
  const raw = import.meta.env.VITE_API_TIMEOUT_MS
  if (raw === undefined || raw === '') return 45000
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 45000
  return n
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://doclock-v63v.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
  // Serverless + MongoDB cold start can exceed 15s; 0 = Axios no-timeout.
  timeout: apiTimeoutMs(),
})

/* ── Request Interceptor: attach JWT ── */
api.interceptors.request.use(
  (config) => {
    // FIXED: Changed 'doclock_token' to 'token' to match your AuthContext
    const token = localStorage.getItem('token') 
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response Interceptor: handle 401 globally ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('doclock:auth-lost'))
      const path = window.location.pathname || ''
      const publicPaths = ['/', '/login', '/register']
      if (!publicPaths.includes(path)) {
        window.location.href = '/login'
      }
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
}

/* Users */
export const usersAPI = {
  getDoctors: () => api.get('/users/doctors'),
  getHealthRecord: () => api.get('/users/health-record'),
  updateHealthRecord: (body) => api.put('/users/health-record', body),
}

/* Appointments */
export const appointmentsAPI = {
  list: () =>
    api.get('/auth/my-appointments', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    }),
  create:   (data)    => api.post('/auth/book-appointment', data),
  update:   (id, data) => api.put(`/auth/update-appointment/${id}`, data),
  delete:   (id)      => api.delete(`/auth/delete-appointment/${id}`),
}

export default api