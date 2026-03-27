import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://doclock-v63v.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
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

/* Appointments */
export const appointmentsAPI = {
  list:     ()        => api.get('/auth/my-appointments'),
  create:   (data)    => api.post('/auth/book-appointment', data),
  update:   (id, data) => api.put(`/auth/update-appointment/${id}`, data),
  delete:   (id)      => api.delete(`/auth/delete-appointment/${id}`),
}

export default api