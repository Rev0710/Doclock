import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const dropRef = useRef(null)

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? 'active' : ''

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Doc<span>Lock</span>
        </Link>

        {/* Desktop Links */}
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/book" className={`nav-link ${isActive('/book')}`}>Find Doctor</Link>

          {isAuthenticated && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="navbar-right">

          {isAuthenticated ? (
            <div className="nav-user" ref={dropRef}>

              {/* Avatar Button */}
              <button
                className="nav-avatar-btn"
                onClick={() => setDropOpen(prev => !prev)}
              >
                <div className="nav-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <span className="nav-user-name">
                  {user?.name?.split(' ')[0]}
                </span>

                <svg className={`nav-chevron ${dropOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className="nav-dropdown anim-scale-in">

                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    <IconGrid /> Dashboard
                  </Link>

                  <Link to="/book" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    <IconCalendar /> Book Appointment
                  </Link>

                  {user?.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropOpen(false)}>
                      <IconShield /> Admin Panel
                    </Link>
                  )}

                  <div className="dropdown-divider" />

                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <IconLogout /> Sign Out
                  </button>

                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-btns">
              <Link to="/login" className="btn-nav-ghost">Sign In</Link>
              <Link to="/register" className="btn-nav-primary">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile anim-fade-in">

          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/book" onClick={() => setMenuOpen(false)}>Find Doctor</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

/* Icons */
const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
  </svg>
)

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <path d="M9 21H5V5h4"/>
  </svg>
)