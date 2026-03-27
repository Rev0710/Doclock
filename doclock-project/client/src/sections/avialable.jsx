import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarDataUrl } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';
import { usersAPI } from '../services/api.js';

const NavIcon = ({ children }) => (
  <span className="home-navIcon" aria-hidden="true">
    {children}
  </span>
);

export default function Avialable() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const avatar = getAvatarDataUrl();

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await usersAPI.getDoctors();
      const list = Array.isArray(data?.doctors) ? data.doctors : [];
      setDoctors(list);
    } catch (e) {
      setLoadError(e.response?.data?.message || e.message || 'Could not load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Doclock | Available Doctors';
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => `${d.name} ${d.tag} ${d.city} ${d.days}`.toLowerCase().includes(q));
  }, [doctors, query]);

  return (
    <div className="home-page home-dashboard" role="region" aria-label="Available doctors">
      <aside className="home-sidebar" aria-label="Main navigation">
        <div className="home-sidebarLogo">Doclock</div>
        <nav className="home-nav">
          <button type="button" className="home-navItem" onClick={() => navigate('/home')}>
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <path
                  d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </NavIcon>
            Overview
          </button>
          <button type="button" className="home-navItem">
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <path
                  d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5l1.3 1.3L12 21l7.5-7.6 1.3-1.3a5.3 5.3 0 0 0 0-7.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </NavIcon>
            Health Record
          </button>
          <button type="button" className="home-navItem" onClick={() => navigate('/appointments')}>
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </NavIcon>
            Appointments
          </button>
          <button type="button" className="home-navItem">
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <path
                  d="M6.6 2.9 9 5.3c.8.8.8 2 0 2.8L7.6 9.5c1.2 2.3 3.1 4.2 5.4 5.4l1.4-1.4c.8-.8 2-.8 2.8 0l2.4 2.4c.9.9.9 2.3 0 3.2l-1.6 1.6c-.7.7-1.7 1-2.7.9-3.5-.5-6.8-2.4-9.4-5.1C3.4 13.9 1.5 10.6 1 7.1c-.1-1 .2-2 .9-2.7L3.4 2.9c.9-.9 2.3-.9 3.2 0Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </NavIcon>
            Contacts
          </button>
          <button type="button" className="home-navItem active">
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <path d="M20 21a8 8 0 1 0-16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </NavIcon>
            Available Doctors
          </button>
          <button
            type="button"
            className="home-navItem home-navItemLogout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <NavIcon>
              <svg viewBox="0 0 24 24">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </NavIcon>
            Log out
          </button>
        </nav>
      </aside>

      <div className="home-main">
        <header className="home-topbar home-topbarDash">
          <div className="home-searchWrap">
            <span className="home-searchIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input className="home-searchInput" type="search" placeholder="Search" aria-label="Search" />
          </div>
          <div className="home-topbarRight">
            <button className="home-bell" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M13.7 21a2 2 0 01-3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {avatar ? <img className="home-avatar home-avatarHeader" src={avatar} alt="Profile" /> : <div className="home-avatar home-avatarHeader" aria-hidden="true" />}
          </div>
        </header>

        <div className="home-mainInner">
          <main className="home-content home-contentDash avail-page">
            <button className="avail-back" type="button" onClick={() => navigate(-1)} aria-label="Go back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="avail-shell">
              <h1 className="avail-title">Available Doctor’s</h1>

              <div className="avail-searchRow">
                <span className="avail-searchIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  className="avail-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  aria-label="Search doctors"
                />
                <span className="avail-mic" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M19 11a7 7 0 0 1-14 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              {loadError ? (
                <p style={{ color: '#b91c1c', textAlign: 'center', marginTop: 16 }}>{loadError}</p>
              ) : null}

              <div className="avail-list">
                {loading ? (
                  <p style={{ textAlign: 'center', color: '#64748b', marginTop: 24 }}>Loading doctors…</p>
                ) : filtered.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', marginTop: 24 }}>
                    No doctors found yet. When a provider registers as a doctor, they will appear here.
                  </p>
                ) : (
                  filtered.map((d, idx) => (
                    <article key={d.id} className="avail-card">
                      <div className={`avail-avatar a${(idx % 3) + 1}`} aria-hidden="true" />

                      <div className="avail-main">
                        <div className="avail-topLine">
                          <div className="avail-name">{d.name}</div>
                          <span className="avail-tag">{d.tag}</span>
                        </div>

                        <div className="avail-meta">
                          <div className="avail-metaItem">
                            <span className="avail-metaIcon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <path
                                  d="M12 22s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                />
                                <circle cx="12" cy="11" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </span>
                            {d.city}
                          </div>
                          <div className="avail-metaItem">
                            <span className="avail-metaIcon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 2v4M16 2v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </span>
                            {d.days}
                            <span className="avail-time">{d.time}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="avail-book"
                        type="button"
                        onClick={() =>
                          navigate('/set-appointment', {
                            state: {
                              doctorId: d.id,
                              doctorName: d.name,
                              specialty: d.tag,
                            },
                          })
                        }
                      >
                        Book Now
                      </button>
                    </article>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
