import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './AdminPanel.css'

const MOCK_USERS = [
  { id: 1, name: 'John Dela Cruz', email: 'john@example.com', role: 'patient', status: 'active',   joined: '2025-01-15' },
  { id: 2, name: 'Maria Santos',   email: 'maria@example.com',role: 'patient', status: 'active',   joined: '2025-02-08' },
  { id: 3, name: 'Dr. Sarah Williams', email: 'sarah@doclock.ph', role: 'doctor', status: 'active', joined: '2024-11-01' },
  { id: 4, name: 'Dr. James Tan',  email: 'james@doclock.ph', role: 'doctor', status: 'inactive', joined: '2024-12-20' },
  { id: 5, name: 'Admin User',     email: 'admin@doclock.ph', role: 'admin',  status: 'active',   joined: '2024-10-01' },
]

const MOCK_APPTS = [
  { id: 1, patient: 'John Dela Cruz',  doctor: 'Dr. Sarah Williams', date: '2026-03-22', time: '10:00 AM', status: 'confirmed' },
  { id: 2, patient: 'Maria Santos',    doctor: 'Dr. James Tan',      date: '2026-03-25', time: '02:30 PM', status: 'pending'   },
  { id: 3, patient: 'John Dela Cruz',  doctor: 'Dr. Amara Osei',     date: '2026-04-01', time: '09:00 AM', status: 'confirmed' },
  { id: 4, patient: 'Maria Santos',    doctor: 'Dr. Lisa Chen',      date: '2026-04-05', time: '11:00 AM', status: 'cancelled' },
]

const STATS = [
  { label: 'Total Users',        value: '1,248',  icon: '👥', trend: '+12%',  trendUp: true  },
  { label: 'Total Appointments', value: '8,934',  icon: '📅', trend: '+8%',   trendUp: true  },
  { label: 'Active Doctors',     value: '47',     icon: '👨‍⚕️', trend: '+3',     trendUp: true  },
  { label: 'Revenue (Month)',    value: '₱184K',  icon: '💰', trend: '+15%',  trendUp: true  },
]

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tab,   setTab]   = useState('overview')
  const [users, setUsers] = useState(MOCK_USERS)
  const [appts, setAppts] = useState(MOCK_APPTS)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))
  }

  const deleteUser = (id) => {
    if (window.confirm('Delete this user?')) setUsers(prev => prev.filter(u => u.id !== id))
  }

  const navItems = [
    { key: 'overview',     label: 'Overview',     icon: <IcoGrid /> },
    { key: 'users',        label: 'Users',        icon: <IcoUsers /> },
    { key: 'appointments', label: 'Appointments', icon: <IcoCal /> },
    { key: 'settings',     label: 'Settings',     icon: <IcoGear /> },
  ]

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          Doc<span>Lock</span>
          <div className="admin-badge">Admin</div>
        </div>

        <nav className="admin-nav">
          {navItems.map(n => (
            <button
              key={n.key}
              className={`admin-nav-item ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-nav-item" onClick={() => navigate('/dashboard')}>
            <IcoGrid /> Patient View
          </button>
          <button className="admin-nav-item danger" onClick={handleLogout}>
            <IcoLogout /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {tab === 'overview'     && 'Dashboard Overview'}
              {tab === 'users'        && 'User Management'}
              {tab === 'appointments' && 'All Appointments'}
              {tab === 'settings'     && 'System Settings'}
            </h1>
            <p className="admin-page-sub">Welcome, {user?.name || 'Admin'}</p>
          </div>
        </header>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="anim-fade-up">
            <div className="admin-stats-grid">
              {STATS.map((s, i) => (
                <div key={s.label} className="admin-stat-card anim-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="admin-stat-icon">{s.icon}</div>
                    <span className={`admin-trend ${s.trendUp ? 'trend-up' : 'trend-down'}`}>
                      {s.trendUp ? '↑' : '↓'} {s.trend}
                    </span>
                  </div>
                  <p className="admin-stat-value">{s.value}</p>
                  <p className="admin-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="admin-section-card">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Recent Appointments</h2>
                <button className="admin-link-btn" onClick={() => setTab('appointments')}>View all</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appts.slice(0, 4).map(a => (
                    <tr key={a.id}>
                      <td>{a.patient}</td>
                      <td>{a.doctor}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>
                        <span className={`admin-status-badge status-${a.status === 'confirmed' ? 'green' : a.status === 'pending' ? 'blue' : 'red'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="anim-fade-up admin-section-card">
            <div className="admin-section-header">
              <h2 className="admin-section-title">All Users ({users.length})</h2>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="td-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-role-badge role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`admin-status-badge status-${u.status === 'active' ? 'green' : 'red'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{u.joined}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-action-btn"
                          onClick={() => toggleUserStatus(u.id)}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {u.status === 'active' ? '⏸' : '▶'}
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => deleteUser(u.id)}
                          title="Delete user"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {tab === 'appointments' && (
          <div className="anim-fade-up admin-section-card">
            <div className="admin-section-header">
              <h2 className="admin-section-title">All Appointments ({appts.length})</h2>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a.id}>
                    <td className="td-muted">#{a.id}</td>
                    <td className="td-bold">{a.patient}</td>
                    <td>{a.doctor}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className={`admin-status-badge status-${a.status === 'confirmed' ? 'green' : a.status === 'pending' ? 'blue' : 'red'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {a.status === 'pending' && (
                          <button
                            className="admin-action-btn confirm"
                            onClick={() => setAppts(p => p.map(x => x.id === a.id ? { ...x, status: 'confirmed' } : x))}
                          >✓</button>
                        )}
                        <button
                          className="admin-action-btn danger"
                          onClick={() => setAppts(p => p.map(x => x.id === a.id ? { ...x, status: 'cancelled' } : x))}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="anim-fade-up admin-section-card" style={{ maxWidth: 560 }}>
            <h2 className="admin-section-title" style={{ marginBottom: 24 }}>System Settings</h2>
            {[
              { label: 'Site Name',         val: 'DocLock',      type: 'text' },
              { label: 'Support Email',      val: 'support@doclock.ph', type: 'email' },
              { label: 'Max Appointments/Day', val: '20',       type: 'number' },
              { label: 'Booking Cutoff (hrs)', val: '24',       type: 'number' },
            ].map(f => (
              <div key={f.label} className="settings-field">
                <label className="settings-label">{f.label}</label>
                <input className="settings-input" type={f.type} defaultValue={f.val} />
              </div>
            ))}
            <button
              className="admin-save-btn"
              onClick={() => alert('Settings saved! (hook up to API)')}
            >
              Save Settings
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Icons ── */
const IcoGrid   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoUsers  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoCal    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcoGear   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IcoLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>