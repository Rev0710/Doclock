import React, { useState } from 'react'
import './AppointmentCard.css'

export default function AppointmentCard({ appointment, onCancel, onView }) {
  const [cancelling, setCancelling] = useState(false)

  const statusMap = {
    confirmed: { label: 'Confirmed', cls: 'status-green' },
    pending:   { label: 'Pending',   cls: 'status-blue'  },
    cancelled: { label: 'Cancelled', cls: 'status-red'   },
    completed: { label: 'Completed', cls: 'status-gray'  },
  }

  const { label: statusLabel, cls: statusCls } =
    statusMap[appointment.status] || statusMap.pending

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await onCancel?.(appointment.id)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <article className="appt-card anim-fade-up">
      {/* Left accent bar */}
      <div className={`appt-accent ${statusCls}`} />

      {/* Avatar */}
      <div className="appt-avatar">
        {appointment.doctorAvatar
          ? <img src={appointment.doctorAvatar} alt={appointment.doctor} />
          : <span>{appointment.doctor?.charAt(0) || 'D'}</span>
        }
      </div>

      {/* Info */}
      <div className="appt-info">
        <h3 className="appt-doctor">{appointment.doctor}</h3>
        <p className="appt-spec">{appointment.specialty}</p>
        <div className="appt-meta">
          <span className="appt-meta-item">
            <IconCalendar />
            {appointment.date}
          </span>
          <span className="appt-meta-item">
            <IconClock />
            {appointment.time}
          </span>
          {appointment.type && (
            <span className="appt-meta-item">
              <IconVideo />
              {appointment.type}
            </span>
          )}
        </div>
      </div>

      {/* Status + Actions */}
      <div className="appt-right">
        <span className={`appt-status ${statusCls}`}>{statusLabel}</span>
        <div className="appt-actions">
          <button
            className="appt-btn appt-btn-outline"
            onClick={() => onView?.(appointment)}
          >
            Details
          </button>
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <button
              className="appt-btn appt-btn-danger"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ── Inline icons ── */
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconVideo = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
)