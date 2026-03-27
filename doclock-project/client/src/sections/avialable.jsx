import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthUser, getProfileImageSrc } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';
import { usersAPI } from '../services/api.js';
import { doctorsMatchingService, isKnownServiceId, serviceTitleById } from '../utils/serviceDoctorMatch.js';
import DashboardNav from '../components/DashboardNav.jsx';

export default function Avialable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawServiceId = searchParams.get('service') || '';
  const serviceFilterId = isKnownServiceId(rawServiceId) ? rawServiceId : '';
  const serviceFilterTitle = serviceFilterId ? serviceTitleById(serviceFilterId) : '';
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const profileImg = getProfileImageSrc(getAuthUser() || user);

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
    let list = doctors;
    if (serviceFilterId) {
      const matched = doctorsMatchingService(doctors, serviceFilterId);
      list = matched.length ? matched : [];
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) => `${d.name} ${d.tag} ${d.city} ${d.days}`.toLowerCase().includes(q));
  }, [doctors, query, serviceFilterId]);

  return (
    <div className="home-page home-dashboard" role="region" aria-label="Available doctors">
      <aside className="home-sidebar" aria-label="Main navigation">
        <DashboardNav active="available" />
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
            {profileImg ? <img className="home-avatar home-avatarHeader" src={profileImg} alt="" /> : <div className="home-avatar home-avatarHeader" aria-hidden="true" />}
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

              {serviceFilterTitle ? (
                <p className="avail-serviceBanner" role="status">
                  Showing doctors recommended for <strong>{serviceFilterTitle}</strong>
                  {filtered.length === 0 && doctors.length > 0 ? (
                    <span> — no specialty match yet; clear the filter from the URL or pick another service.</span>
                  ) : null}
                  <button
                    type="button"
                    className="avail-clearService"
                    onClick={() => navigate('/available', { replace: true })}
                  >
                    Show all doctors
                  </button>
                </p>
              ) : null}

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
                    {doctors.length === 0
                      ? 'No doctors found yet. When a provider registers as a doctor, they will appear here.'
                      : serviceFilterId
                        ? 'No doctors match this service filter. Try “Show all doctors” or adjust your search.'
                        : 'No doctors match your search.'}
                  </p>
                ) : (
                  filtered.map((d, idx) => (
                    <article key={d.id} className="avail-card">
                      <div className="avail-avatar-wrap" aria-hidden="true">
                        <img
                          className="avail-avatar-img"
                          src={getProfileImageSrc({ _id: d.id, name: d.name, avatar: d.avatar })}
                          alt=""
                        />
                      </div>

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
