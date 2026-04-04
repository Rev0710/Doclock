import { useState, useEffect } from 'react'
import api from '../services/api.js'
import { AuthContext } from './authContext.js'

function normalizeLoginEmail(raw) {
  return String(raw ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
}

function normalizeLoginPassword(raw) {
  return String(raw ?? '').trim()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const setAuthHeader = (token) => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    try {
      localStorage.removeItem('doclock_avatar')
    } catch {
      /* ignore */
    }
    setAuthHeader(null)
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setAuthHeader(token)
        setUser(JSON.parse(storedUser))
      } catch {
        console.error('Session data invalid; signing out.')
        logout()
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const onAuthLost = () => {
      setAuthHeader(null)
      setUser(null)
    }
    window.addEventListener('doclock:auth-lost', onAuthLost)
    return () => window.removeEventListener('doclock:auth-lost', onAuthLost)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email: normalizeLoginEmail(email),
      password: normalizeLoginPassword(password),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setAuthHeader(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const body = { ...payload, email: String(payload?.email || '').trim().toLowerCase() }
    const { data } = await api.post('/auth/register', body)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setAuthHeader(data.token)
    setUser(data.user)
    return data.user
  }

  const updateProfile = async (payload) => {
    const { data } = await api.put('/users/profile', payload)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const deleteProfile = async () => {
    await api.delete('/users/profile')
    logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
        deleteProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
