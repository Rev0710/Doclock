import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppointmentCard from '../components/AppointmentCard.jsx'
import './Dashboard.css'

/* ── Mock data (replace with real API calls) ── */
const MOCK_APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Sarah Williams', specialty: 'Cardiologist',   date: '2026-03-22', time: '10:00 AM', status: 'confirmed', avatar: 'SW', type: 'In-Person' },
  { id: 2, doctor: 'Dr. James Tan',      specialty: 'Dermatologist',  date: '2026-03-25', time: '02:30 PM', status: 'pending',   avatar: 'JT', type: 'Video Call' },
  { id: 3, doctor: 'Dr. Amara Osei',     specialty: 'Neurologist',    date: '2026-04-01', time: '09:00 AM', status: 'confirmed', avatar: 'AO', type: 'In-Person' },
]

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Williams', spec: 'Cardiologist',   rating: 4.9, avail: true,  avatar: 'SW' },
  { id: 2, name: 'Dr. James Tan',      spec: 'Dermatologist',  rating: 4.8, avail: true,  avatar: 'JT' },
  { id: 3, name: 'Dr. Lisa Chen',      spec: 'Pediatrician',   rating: 4.9, avail: false, avatar: 'LC' },
]

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LBL = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS)
  const [detailAppt,   setDetailAppt]   = useState(null)
  const [calMonth,  setCalMonth]  = useState(new Date().getMonth())
  const [calYear,   setCalYear]   = useState(new Date().getFullYear())
  const [selDate,   setSelDate]   = useState(null)
  const [sideNav,   setSideNav]   = useState('dashboard')

  const handleLogout = async () => { await logout(); navigate('/login') }

  const handleCancel = (id) => {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
    )
  }

  /* ── Calendar ── */
  const firstDay     = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate()
  const apptDays     = appointments
    .filter(a => a.date.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, '0')}`))
    .map(a => parseInt(a.date.split('-')[2]))

  const today = new Date()

  /* ── Stats ── */
  const stats = [
    { label: 'Total Appointments', value: appointments.length,                                   icon: '📅', color: '#eff6ff', textColor: 'var(--blue-600)' },
    { label: 'Confirmed',          value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: '#f0fdf4', textColor: 'var(--green-600)' },
    { label: 'Pending',            value: appointments.filter(a => a.status === 'pending').length,   icon: '🕐', color: '#fff7ed', textColor: '#ea580c' },
    { label: 'Cancelled',          value: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: '#fef2f2', textColor: 'var(--red-600)' },
  ]

  const navItems = [
    { key: 'dashboard',    icon: <IcoGrid />,    label: 'Dashboard' },
    { key: 'appointments', icon: <IcoCalendar/>, label: 'Appointments' },
    { key: 'doctors',      icon: <IcoUsers />,   label: 'Find Doctors' },
    { key: 'profile',      icon: <IcoUser />,    label: 'My Profile' },
  ]

  return (
    <div className="dash-layout">
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">Doc<span>Lock</span></div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">MAIN</p>
          {navItems.map(n => (
            <button
              key={n.key}
              className={`sidebar-nav-item ${sideNav === n.key ? 'active' : ''}`}
              onClick={() => setSideNav(n.key)}
            >
              {n.icon} {n.label}
            </button>
          ))}
          {user?.role === 'admin' && (
            <>
              <p className="sidebar-section-label" style={{ marginTop: 20 }}>ADMIN</p>
              <Link to="/admin" className="sidebar-nav-item">
                <IcoShield /> Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="sidebar-user-info">
              <p className="su-name">{user?.name || 'Guest User'}</p>
              <p className="su-role">{user?.role || 'Patient'}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <IcoLogout /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar">
          <div>
            <h1 className="dash-page-title">
              {sideNav === 'dashboard'    && `Good morning, ${user?.name?.split(' ')[0] || 'there'} 👋`}
              {sideNav === 'appointments' && 'My Appointments'}
              {sideNav === 'doctors'      && 'Find a Doctor'}
              {sideNav === 'profile'      && 'My Profile'}
            </h1>
            <p className="dash-page-sub">
              {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-icon-btn" title="Notifications"><IcoBell /></button>
            <Link to="/book" className="dash-book-btn">+ Book Appointment</Link>
          </div>
        </header>

        {/* ─────────── DASHBOARD TAB ─────────── */}
        {sideNav === 'dashboard' && (
          <div className="anim-fade-up">
            {/* Stats */}
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="stat-card anim-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="stat-icon" style={{ background: s.color, fontSize: 22 }}>{s.icon}</div>
                  <p className="stat-value" style={{ color: s.textColor }}>{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Two-col grid */}
            <div className="dash-two-col">
              {/* Left: Appointments */}
              <div>
                <div className="section-bar">
                  <h2 className="section-bar-title">Upcoming Appointments</h2>
                  <button className="section-bar-link" onClick={() => setSideNav('appointments')}>View all →</button>
                </div>
                <div className="appt-list">
                  {appointments.filter(a => a.status !== 'cancelled').slice(0, 3).map(a => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      onCancel={handleCancel}
                      onView={setDetailAppt}
                    />
                  ))}
                  {appointments.length === 0 && (
                    <div className="empty-state">
                      <p>📅</p><p>No appointments yet.</p>
                      <Link to="/book" className="dash-book-btn" style={{ marginTop: 12 }}>Book now</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Calendar + Quick Doctors */}
              <div className="dash-right-col">
                <Calendar
                  month={calMonth} year={calYear}
                  apptDays={apptDays} selDate={selDate}
                  onPrev={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }}
                  onNext={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }}
                  onSelect={setSelDate}
                />

                <div style={{ marginTop: 20 }}>
                  <div className="section-bar">
                    <h2 className="section-bar-title">Top Doctors</h2>
                    <button className="section-bar-link" onClick={() => setSideNav('doctors')}>See all →</button>
                  </div>
                  <div className="quick-doctors">
                    {MOCK_DOCTORS.map(d => (
                      <Link to="/book" key={d.id} className="quick-doctor-row">
                        <div className="qd-avatar">{d.avatar}</div>
                        <div className="qd-info">
                          <p className="qd-name">{d.name}</p>
                          <p className="qd-spec">{d.spec} · ★{d.rating}</p>
                        </div>
                        <div className={`qd-dot ${d.avail ? 'avail' : 'busy'}`} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────── APPOINTMENTS TAB ─────────── */}
        {sideNav === 'appointments' && (
          <div className="anim-fade-up">
            <div className="tab-filters">
              {['All', 'Confirmed', 'Pending', 'Cancelled'].map(f => (
                <button key={f} className="tab-chip active-first">{f}</button>
              ))}
            </div>
            <div className="appt-list">
              {appointments.map(a => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onCancel={handleCancel}
                  onView={setDetailAppt}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─────────── DOCTORS TAB ─────────── */}
        {sideNav === 'doctors' && (
          <div className="anim-fade-up">
            <p style={{ color: 'var(--slate-500)', marginBottom: 24 }}>
              Browse and book from our network of verified specialists.
            </p>
            <Link to="/book" className="dash-book-btn" style={{ display: 'inline-flex' }}>
              Open Doctor Finder →
            </Link>
          </div>
        )}

        {/* ─────────── PROFILE TAB ─────────── */}
        {sideNav === 'profile' && (
          <div className="anim-fade-up profile-section">
            <div className="profile-card">
              <div className="profile-avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
              <div>
                <h2 className="profile-name">{user?.name || 'Guest User'}</h2>
                <p className="profile-email">{user?.email || '—'}</p>
                <span className="profile-role-badge">{user?.role || 'patient'}</span>
              </div>
            </div>
            <div className="profile-fields">
              {[
                ['Full Name',    user?.name  || ''],
                ['Email',        user?.email || ''],
                ['Phone',        user?.phone || '+63 9XX XXX XXXX'],
                ['Date of Birth','January 15, 1992'],
                ['Gender',       'Male'],
                ['Address',      'Iloilo City, Western Visayas'],
              ].map(([label, val]) => (
                <div key={label} className="profile-field">
                  <label className="pf-label">{label}</label>
                  <input className="pf-input" defaultValue={val} />
                </div>
              ))}
              <button
                className="dash-book-btn"
                style={{ marginTop: 8 }}
                onClick={() => alert('Profile saved! (hook up to API)')}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL ── */}
      {detailAppt && (
        <div className="modal-overlay" onClick={() => setDetailAppt(null)}>
          <div className="modal-box anim-scale-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetailAppt(null)}>×</button>
            <h2 className="modal-title">Appointment Details</h2>
            <div className="modal-doctor-info">
              <div className="qd-avatar" style={{ width: 52, height: 52, fontSize: 20, borderRadius: 14 }}>{detailAppt.avatar}</div>
              <div>
                <p className="modal-doctor-name">{detailAppt.doctor}</p>
                <p className="modal-doctor-spec">{detailAppt.specialty}</p>
              </div>
              <span className={`appt-status status-${detailAppt.status === 'confirmed' ? 'green' : detailAppt.status === 'pending' ? 'blue' : 'red'}`} style={{ marginLeft: 'auto' }}>
                {detailAppt.status}
              </span>
            </div>
            <div className="modal-details">
              {[['Date', detailAppt.date], ['Time', detailAppt.time], ['Type', detailAppt.type || 'In-Person']].map(([l, v]) => (
                <div key={l} className="modal-detail-row">
                  <span className="mdr-label">{l}</span>
                  <span className="mdr-value">{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-btn-outline" onClick={() => setDetailAppt(null)}>Close</button>
              {detailAppt.status !== 'cancelled' && (
                <button className="modal-btn-danger" onClick={() => { handleCancel(detailAppt.id); setDetailAppt(null) }}>
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Calendar sub-component ── */
function Calendar({ month, year, apptDays, selDate, onPrev, onNext, onSelect }) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = new Date()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <div className="mini-cal">
      <div className="cal-head">
        <span className="cal-month-label">{MONTHS[month]} {year}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="cal-nav-btn" onClick={onPrev}>‹</button>
          <button className="cal-nav-btn" onClick={onNext}>›</button>
        </div>
      </div>
      <div className="cal-day-labels">
        {DAY_LBL.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-cells">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const isToday  = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const isSel    = selDate === dateStr(d)
          const hasAppt  = apptDays.includes(d)
          return (
            <button
              key={i}
              className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''} ${hasAppt && !isSel ? 'has-appt' : ''}`}
              onClick={() => onSelect(dateStr(d))}
            >
              {d}
              {hasAppt && !isSel && <span className="cal-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Sidebar icons ── */
const IcoGrid    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoCalendar= () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcoUsers   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoUser    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoShield  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IcoLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoBell    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>

const MONTHS_CONST = ['January','February','March','April','May','June','July','August','September','October','November','December']