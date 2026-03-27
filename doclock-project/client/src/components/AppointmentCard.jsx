import React, { useState } from "react";
import "./AppointmentCard.css";

export default function AppointmentCard({ appointment, onCancel, onView }) {
  const [loadingAction, setLoadingAction] = useState(false);

  if (!appointment) return null;

  const statusMap = {
    confirmed: { label: "Confirmed", cls: "status-green" },
    pending: { label: "Pending", cls: "status-blue" },
    cancelled: { label: "Cancelled", cls: "status-red" },
    completed: { label: "Completed", cls: "status-gray" },
  };

  const status = appointment.status || "pending";
  const { label: statusLabel, cls: statusCls } =
    statusMap[status] || statusMap.pending;

  // FIXED: Support all possible backend field names
  const doctorName =
    appointment.doctorName ||
    appointment.doctor ||
    appointment.service ||
    "Unknown Doctor";

  const specialty =
    appointment.specialty ||
    appointment.department ||
    appointment.type ||
    "General Specialist";

  const date = appointment.date || "No date";
  const time = appointment.time || "No time";

  const handleAction = async (actionFn) => {
    if (!actionFn) return;
    setLoadingAction(true);
    try {
      await actionFn(appointment._id || appointment.id);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <article className="appt-card anim-fade-up">
      <div className={`appt-accent ${statusCls}`} />

      <div className="appt-avatar">
        <span>{doctorName?.charAt(0)?.toUpperCase() || "D"}</span>
      </div>

      <div className="appt-info">
        <h3 className="appt-doctor">{doctorName}</h3>
        <p className="appt-spec">{specialty}</p>

        <div className="appt-meta">
          <span className="appt-meta-item">
            <IconCalendar />
            {date}
          </span>
          <span className="appt-meta-item">
            <IconClock />
            {time}
          </span>

          {appointment.mode && (
            <span className="appt-meta-item">
              <IconVideo />
              {appointment.mode}
            </span>
          )}
        </div>
      </div>

      <div className="appt-right">
        <span className={`appt-status ${statusCls}`}>{statusLabel}</span>

        <div className="appt-actions">
          <button
            className="appt-btn appt-btn-outline"
            onClick={() => onView?.(appointment)}
            disabled={loadingAction}
          >
            Details
          </button>

          {status !== "cancelled" && status !== "completed" && (
            <button
              className="appt-btn appt-btn-danger"
              onClick={() => handleAction(onCancel)}
              disabled={loadingAction}
            >
              {loadingAction ? "..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* icons */
const IconCalendar = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: "4px" }}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: "4px" }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconVideo = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: "4px" }}
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);