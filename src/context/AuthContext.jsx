import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('doclock_token'))
  const [loading, setLoading] = useState(true)

  /* ── Bootstrap: validate saved token on mount ── */
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data.user)
        } catch {
          localStorage.removeItem('doclock_token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [token])

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('doclock_token', newToken)
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  /* ── Register ── */
  const register = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData)
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('doclock_token', newToken)
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  /* ── Logout ── */
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('doclock_token')
    setToken(null)
    setUser(null)
  }, [])

  /* ── Update profile ── */
  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}