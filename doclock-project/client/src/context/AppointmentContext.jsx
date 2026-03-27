import React, { useState, useEffect, useCallback } from 'react'
import { appointmentsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth.js'
import { AppointmentContext } from './appointmentContext.js'

function appointmentsFromResponseBody(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.appointments)) return data.appointments
  if (Array.isArray(data.data)) return data.data
  if (data.data && Array.isArray(data.data.appointments)) return data.data.appointments
  return []
}

export function AppointmentProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await appointmentsAPI.list()
      const list = appointmentsFromResponseBody(res.data)
      setAppointments(list)
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setLoadError(error.response?.data?.message || error.message || 'Could not load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setAppointments([])
      setLoading(false)
      setLoadError('')
      return
    }
    loadAppointments()
  }, [user, authLoading, loadAppointments])

  const addAppointment = async (formData) => {
    try {
      await appointmentsAPI.create(formData)
      await loadAppointments()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Booking failed',
      }
    }
  }

  const removeAppointment = async (id) => {
    try {
      await appointmentsAPI.delete(id)
      await loadAppointments()
      return { success: true }
    } catch (error) {
      console.error('Delete failed:', error)
      return { success: false }
    }
  }

  const updateAppointment = async (id, payload) => {
    try {
      await appointmentsAPI.update(id, payload)
      await loadAppointments()
      return { success: true }
    } catch (error) {
      console.error('Update failed:', error)
      return { success: false }
    }
  }

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        loadError,
        loadAppointments,
        addAppointment,
        removeAppointment,
        updateAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  )
}
