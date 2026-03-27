import React, { useState, useEffect, useCallback } from 'react'
import { appointmentsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth.js'
import { AppointmentContext } from './appointmentContext.js'

export function AppointmentProvider({ children }) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await appointmentsAPI.list()
      const data = res.data

      if (Array.isArray(data)) {
        setAppointments(data)
      } else if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments)
      } else if (Array.isArray(data.data)) {
        setAppointments(data.data)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setAppointments([])
      setLoading(false)
      return
    }
    loadAppointments()
  }, [user, loadAppointments])

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
