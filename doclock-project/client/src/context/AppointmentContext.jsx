import React, { useState, useEffect, useCallback } from 'react'
import { appointmentsAPI } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { AppointmentContext } from './appointmentContext.js'

function normalizeAppointmentList(payload) {
  if (payload == null) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.appointments)) return payload.appointments
  if (Array.isArray(payload.data)) return payload.data
  if (payload.data && Array.isArray(payload.data.appointments)) return payload.data.appointments
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
      setAppointments(normalizeAppointmentList(res.data))
    } catch (err) {
      console.error('Failed to load appointments:', err)
      setLoadError(err.response?.data?.message || err.message || 'Could not load appointments')
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
      const service =
        formData.service ||
        [formData.specialty, formData.doctorName].filter(Boolean).join(' — ') ||
        'Consultation'
      await appointmentsAPI.create({
        date: formData.date,
        time: formData.time,
        service: String(service),
        ...(formData.doctorId ? { doctorId: String(formData.doctorId) } : {}),
      })
      await loadAppointments()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Booking failed',
      }
    }
  }

  const removeAppointment = async (id) => {
    try {
      await appointmentsAPI.delete(id)
      await loadAppointments()
      return { success: true }
    } catch (err) {
      console.error('Delete failed:', err)
      return { success: false }
    }
  }

  const updateAppointment = async (id, payload) => {
    try {
      await appointmentsAPI.update(id, payload)
      await loadAppointments()
      return { success: true }
    } catch (err) {
      console.error('Update failed:', err)
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
