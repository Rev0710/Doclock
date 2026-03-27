import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AppointmentContext } from "../context/AppointmentContext";
import AppointmentCard from "../components/AppointmentCard.jsx";
import ProfileTab from "../components/ProfileTab.jsx";
import "./Dashboard.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LBL = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    appointments,
    loading,
    loadAppointments,
    removeAppointment,
    updateAppointment,
  } = useContext(AppointmentContext);

  const [sideNav, setSideNav] = useState("dashboard");
  const [detailAppt, setDetailAppt] = useState(null);

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) loadAppointments();
  }, [user, loadAppointments]);

  const safeAppts = Array.isArray(appointments) ? appointments : [];

  // upcoming = not cancelled
  const upcoming = safeAppts.filter((a) => a?.status !== "cancelled");

  // status counts
  const confirmedCount = safeAppts.filter((a) => a?.status === "confirmed").length;
  const pendingCount = safeAppts.filter((a) => a?.status === "pending").length;
  const cancelledCount = safeAppts.filter((a) => a?.status === "cancelled").length;

  // calendar marked days
  const apptDays = safeAppts
    .filter((a) => typeof a?.date === "string")
    .filter((a) =>
      a.date.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, "0")}`)
    )
    .map((a) => parseInt(a.date.split("-")[2], 10))
    .filter((n) => !isNaN(n));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      setDetailAppt(null);
    } catch (err) {
      alert("Failed to update appointment.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment permanently?")) return;
    await removeAppointment(id);
    setDetailAppt(null);
  };

  // Loading UI (prevents white screen)
  if (loading && safeAppts.length === 0) {
    return (
      <div className="dash-loading">
        <div className="spinner"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          Doc<span>Lock</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${sideNav === "dashboard" ? "active" : ""}`}
            onClick={() => setSideNav("dashboard")}
          >
            <IcoGrid /> Dashboard
          </button>

          <button
            className={`sidebar-nav-item ${sideNav === "appointments" ? "active" : ""}`}
            onClick={() => setSideNav("appointments")}
          >
            <IcoCalendar /> Appointments
          </button>

          <button
            className={`sidebar-nav-item ${sideNav === "profile" ? "active" : ""}`}
            onClick={() => setSideNav("profile")}
          >
            <IcoUser /> My Profile
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="sidebar-user-info">
              <p className="su-name">{user?.name || "User"}</p>
              <p className="su-role">{user?.role || "Patient"}</p>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <IcoLogout /> Sign Out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <h1 className="dash-page-title">
              Good day, {user?.name?.split(" ")[0] || "User"} 👋
            </h1>
            <p className="dash-page-sub">{new Date().toDateString()}</p>
          </div>

          <div className="dash-topbar-right">
            <Link to="/book" className="dash-book-btn">
              + Book Appointment
            </Link>
          </div>
        </header>

        {/* DASHBOARD VIEW */}
        {sideNav === "dashboard" && (
          <div className="dash-content anim-fade-up">
            <div className="stats-grid">
              <StatCard label="Total Appointments" val={safeAppts.length} icon="📅" bg="#eff6ff" text="#2563eb" />
              <StatCard label="Confirmed" val={confirmedCount} icon="✅" bg="#f0fdf4" text="#16a34a" />
              <StatCard label="Pending" val={pendingCount} icon="⏳" bg="#fff7ed" text="#ea580c" />
              <StatCard label="Cancelled" val={cancelledCount} icon="❌" bg="#fef2f2" text="#dc2626" />
            </div>

            <div className="dash-two-col">
              <section>
                <div className="section-bar">
                  <h2 className="section-bar-title">Upcoming Appointments</h2>
                  <button className="section-bar-link" onClick={() => setSideNav("appointments")}>
                    View all →
                  </button>
                </div>

                <div className="appt-list">
                  {upcoming.length > 0 ? (
                    upcoming.slice(0, 3).map((a) => (
                      <AppointmentCard
                        key={a._id || a.id}
                        appointment={a}
                        onView={() => setDetailAppt(a)}
                        onCancel={() => handleUpdateStatus(a._id || a.id, "cancelled")}
                      />
                    ))
                  ) : (
                    <div className="professional-empty-state">
                      <div className="empty-icon-container">
                        <IcoCalendarLarge />
                      </div>
                      <h3>No Upcoming Appointments</h3>
                      <p>
                        Your schedule is clear. Book your next appointment now.
                      </p>
                      <Link to="/book" className="empty-state-btn">
                        Book Now
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <aside className="dash-right-col">
                <Calendar
                  month={calMonth}
                  year={calYear}
                  apptDays={apptDays}
                  onPrev={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear((y) => y - 1);
                    } else setCalMonth((m) => m - 1);
                  }}
                  onNext={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear((y) => y + 1);
                    } else setCalMonth((m) => m + 1);
                  }}
                />
              </aside>
            </div>
          </div>
        )}

        {/* APPOINTMENTS VIEW */}
        {sideNav === "appointments" && (
          <div className="anim-fade-up">
            <div className="section-bar">
              <h2 className="section-bar-title">All Appointments</h2>
            </div>

            <div className="appt-list-full">
              {safeAppts.length > 0 ? (
                safeAppts.map((a) => {
                  const name =
                    a.doctorName || a.doctor || a.service || "Doctor";
                  return (
                    <div key={a._id || a.id} className="appt-row-card">
                      <div className="row-info">
                        <div className="row-avatar">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="row-name">{name}</p>
                          <p className="row-sub">
                            {a.date || "No date"} • {a.time || "No time"}
                          </p>
                        </div>
                      </div>

                      <div className="row-actions">
                        <span className={`status-tag ${a.status || "pending"}`}>
                          {a.status || "pending"}
                        </span>

                        <button className="btn-icon" onClick={() => setDetailAppt(a)}>
                          View
                        </button>

                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(a._id || a.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No appointment records found.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {sideNav === "profile" && <ProfileTab />}
      </main>

      {/* DETAIL MODAL */}
      {detailAppt && (
        <div className="modal-overlay" onClick={() => setDetailAppt(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetailAppt(null)}>
              ×
            </button>

            <h3 className="modal-title">Appointment Details</h3>

            <div className="modal-details">
              <div className="modal-detail-row">
                <span className="mdr-label">Doctor</span>
                <span className="mdr-value">
                  {detailAppt.doctorName || detailAppt.doctor || detailAppt.service}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="mdr-label">Date</span>
                <span className="mdr-value">{detailAppt.date || "N/A"}</span>
              </div>

              <div className="modal-detail-row">
                <span className="mdr-label">Time</span>
                <span className="mdr-value">{detailAppt.time || "N/A"}</span>
              </div>

              <div className="modal-detail-row">
                <span className="mdr-label">Reason</span>
                <span className="mdr-value">{detailAppt.reason || "Not provided"}</span>
              </div>

              <div className="modal-detail-row">
                <span className="mdr-label">Status</span>
                <span className="mdr-value">{detailAppt.status || "pending"}</span>
              </div>
            </div>

            <div className="modal-actions">
              {detailAppt.status === "pending" && (
                <button
                  className="modal-btn-outline"
                  onClick={() => handleUpdateStatus(detailAppt._id || detailAppt.id, "confirmed")}
                >
                  Confirm
                </button>
              )}

              {detailAppt.status !== "cancelled" && (
                <button
                  className="modal-btn-outline"
                  onClick={() => handleUpdateStatus(detailAppt._id || detailAppt.id, "cancelled")}
                >
                  Cancel
                </button>
              )}

              <button
                className="modal-btn-danger"
                onClick={() => handleDelete(detailAppt._id || detailAppt.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTS */
function StatCard({ label, val, icon, bg, text }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <p className="stat-value" style={{ color: text }}>
          {val}
        </p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function Calendar({ month, year, apptDays, onPrev, onNext }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isThisMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="mini-cal">
      <div className="cal-head">
        <span className="cal-month-label">
          {MONTHS[month]} {year}
        </span>

        <div style={{ display: "flex", gap: "6px" }}>
          <button className="cal-nav-btn" onClick={onPrev}>
            ‹
          </button>
          <button className="cal-nav-btn" onClick={onNext}>
            ›
          </button>
        </div>
      </div>

      <div className="cal-day-labels">
        {DAY_LBL.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="cal-cells">
        {cells.map((d, i) => {
          const isToday = isThisMonth && d === today.getDate();
          const hasAppt = d && apptDays.includes(d);

          return (
            <button
              key={i}
              className={`cal-cell ${isToday ? "today" : ""} ${
                hasAppt ? "has-appt" : ""
              }`}
              disabled={!d}
            >
              {d}
              {hasAppt && <span className="cal-dot"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ICONS */
const IcoGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IcoCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IcoUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IcoLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IcoCalendarLarge = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);