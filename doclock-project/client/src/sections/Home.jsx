import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getAuthUser, getProfileImageSrc, setAuthUser } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';
import { useAppointments } from '../hooks/useAppointments.js';
import { formatVisitDate, specialtyAndDoctorFromService } from '../utils/appointmentDisplay.js';

const NavIcon = ({ children }) => (
  <span className="home-navIcon" aria-hidden="true">
    {children}
  </span>
);

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { appointments, loading: visitsLoading, loadError: visitsLoadError, loadAppointments } = useAppointments();
  const [name, setName] = useState(() => user?.name || getAuthUser()?.name || 'user');

  const upcomingVisits = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return list
      .filter((a) => (a.status || 'pending') !== 'cancelled')
      .filter((a) => {
        if (!a?.date) return true;
        const d = new Date(`${String(a.date).slice(0, 10)}T12:00:00`);
        if (Number.isNaN(d.getTime())) return true;
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => {
        const da = String(a.date || '');
        const db = String(b.date || '');
        if (da !== db) return da.localeCompare(db);
        return String(a.time || '').localeCompare(String(b.time || ''));
      });
  }, [appointments]);

  useEffect(() => {
    document.title = 'Doclock | Home';
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await authApi.me();
        const user = me?.user;
        if (!user) return;
        setAuthUser(user);
        if (alive) setName(user.name || 'user');
      } catch {
        // ignore (not logged in / server not running)
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const profileImg = getProfileImageSrc(getAuthUser() || user);

  const commonServices = [
    { title: "Children's Vaccinations", icon: '🧸' },
    { title: 'COVID-19 Consultations', icon: '😷' },
    { title: 'Medical Certificates', icon: '📄' },
    { title: 'Vaccination Forms', icon: '🧾' },
    { title: 'LASIK', icon: '👁️' },
    { title: 'Cataract Surgery', icon: '🔍' },
    { title: 'Cortisone Injections', icon: '💉' },
    { title: 'IUDs & Other Birth Control', icon: '🩹' },
  ];

  const calendarMini = (
    <svg viewBox="0 0 24 24" className="home-pillSvg">
      <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2v4M16 2v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const clockMini = (
    <svg viewBox="0 0 24 24" className="home-pillSvg">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="home-page home-dashboard">
      <aside className="home-sidebar" aria-label="Main navigation">
        <div className="home-sidebarLogo">Doclock</div>
        <nav className="home-nav">
          <button type="button" className="home-navItem active">
            <NavIcon>
              <svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </NavIcon>
            Overview
          </button>
          <button type="button" className="home-navItem">
            <NavIcon>
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5l1.3 1.3L12 21l7.5-7.6 1.3-1.3a5.3 5.3 0 0 0 0-7.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </NavIcon>
            Health Record
          </button>
          <button type="button" className="home-navItem" onClick={() => navigate('/appointments')}>
            <NavIcon>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </NavIcon>
            Appointments
          </button>
          <button type="button" className="home-navItem">
            <NavIcon>
              <svg viewBox="0 0 24 24"><path d="M6.6 2.9 9 5.3c.8.8.8 2 0 2.8L7.6 9.5c1.2 2.3 3.1 4.2 5.4 5.4l1.4-1.4c.8-.8 2-.8 2.8 0l2.4 2.4c.9.9.9 2.3 0 3.2l-1.6 1.6c-.7.7-1.7 1-2.7.9-3.5-.5-6.8-2.4-9.4-5.1C3.4 13.9 1.5 10.6 1 7.1c-.1-1 .2-2 .9-2.7L3.4 2.9c.9-.9 2.3-.9 3.2 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </NavIcon>
            Contacts
          </button>
          <button type="button" className="home-navItem" onClick={() => navigate('/available')}>
            <NavIcon>
              <svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 1 0-16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
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
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </NavIcon>
            Log out
          </button>
        </nav>
      </aside>

      <div className="home-main">
        <header className="home-topbar home-topbarDash">
          <div className="home-searchWrap">
            <span className="home-searchIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
            <input className="home-searchInput" type="search" placeholder="Search" aria-label="Search" />
          </div>
          <div className="home-topbarRight">
            <button className="home-bell" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M13.7 21a2 2 0 01-3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {profileImg ? (
              <img className="home-avatar home-avatarHeader" src={profileImg} alt="" />
            ) : (
              <div className="home-avatar home-avatarHeader" aria-hidden="true" />
            )}
          </div>
        </header>

        <div className="home-mainInner">
          <div className="home-greeting">
            <div className="home-hello">Hello, {name || 'user'}</div>
            <div className="home-subhello">Good Morning</div>
          </div>

          <main className="home-content home-contentDash">
            <section className="home-section home-visitsPanel">
              <h2 className="home-h2 home-h2Visits">Upcoming Visits</h2>

              <div className="home-cards">
                {visitsLoadError ? (
                  <div className="home-noVisitsWrap">
                    <p className="home-noVisits" style={{ color: '#b91c1c', margin: '0 0 12px' }} role="alert">
                      {visitsLoadError}
                    </p>
                    <button type="button" className="home-book" onClick={() => loadAppointments()}>
                      Try again
                    </button>
                  </div>
                ) : visitsLoading ? (
                  <p className="home-noVisits" style={{ color: '#1e3a8a', margin: 0 }}>
                    Loading visits…
                  </p>
                ) : upcomingVisits.length === 0 ? (
                  <div className="home-noVisitsWrap">
                    <p className="home-noVisits" style={{ color: '#1e3a8a', margin: '0 0 12px' }}>
                      {appointments.length > 0
                        ? 'No upcoming visits from today onward. Past bookings appear under Appointments → Completed.'
                        : 'No upcoming visits yet. Book an appointment and it will show up here.'}
                    </p>
                    <button type="button" className="home-book" onClick={() => navigate('/set-appointment')}>
                      Book appointment
                    </button>
                  </div>
                ) : (
                  upcomingVisits.map((appt, idx) => {
                    const { specialty, doctor } = specialtyAndDoctorFromService(appt.service);
                    const rawId = appt._id ?? appt.id;
                    const id = rawId != null ? String(rawId) : `${appt.date}-${appt.time}-${idx}`;
                    return (
                      <article key={id} className="home-visitCard">
                        <div className="home-visitLeft">
                          <div className="home-doc">
                            <div className={idx % 2 ? 'home-docAvatar alt' : 'home-docAvatar'} aria-hidden="true" />
                            <div>
                              <div className="home-docName">{doctor}</div>
                              <div className="home-docRole">{specialty}</div>
                              <div className="home-docActions">
                                <button type="button" className="home-docActionBtn" aria-label="Call">
                                  <svg viewBox="0 0 24 24"><path d="M6.6 2.9 9 5.3c.8.8.8 2 0 2.8L7.6 9.5c1.2 2.3 3.1 4.2 5.4 5.4l1.4-1.4c.8-.8 2-.8 2.8 0l2.4 2.4c.9.9.9 2.3 0 3.2l-1.6 1.6c-.7.7-1.7 1-2.7.9-3.5-.5-6.8-2.4-9.4-5.1C3.4 13.9 1.5 10.6 1 7.1c-.1-1 .2-2 .9-2.7L3.4 2.9c.9-.9 2.3-.9 3.2 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                                </button>
                                <button type="button" className="home-docActionBtn" aria-label="Message">
                                  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="home-pillRow">
                          <div className="home-pill">
                            <div className="home-pillLabel">
                              {calendarMini}
                              Date
                            </div>
                            <div className="home-pillValue">{formatVisitDate(appt.date)}</div>
                          </div>
                          <div className="home-pill">
                            <div className="home-pillLabel">
                              {clockMini}
                              Time
                            </div>
                            <div className="home-pillValue">{appt.time || '—'}</div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="home-section">
              <div className="home-scheduleGrid">
                <div className="home-scheduleLeft">
                  <div className="home-scheduleHeader">
                    <h2 className="home-h2">Schedule Your Visits</h2>
                    <div className="home-scheduleDesc">
                      Plan follow-ups and new visits in one place—pick a doctor, choose a time, and keep every appointment on your radar.
                    </div>
                  </div>

                  <div className="home-actions">
                    <button className="home-contact" type="button">
                      Contact Us
                    </button>
                    <button className="home-book" type="button" onClick={() => navigate('/available')}>
                      Book Now →
                    </button>
                  </div>
                </div>

                <div className="features-panel">
                  <div className="features-row">
                    <div className="feat-card featured">
                      <div className="feat-icon-wrap">
                        <div className="feat-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                      </div>
                      <span className="feat-label">24/7 Access</span>
                      <p className="feat-desc">
                        Sign in anytime to view visits, messages, and updates—your care timeline stays available day or night.
                      </p>
                      <div className="feat-arrow" aria-hidden="true">+</div>
                    </div>

                    <div className="feat-card">
                      <div className="feat-icon-wrap">
                        <div className="feat-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                      </div>
                      <span className="feat-label">Easy Booking</span>
                      <p className="feat-desc-hover">
                        Book a slot in minutes: choose a doctor, date, and time without phone tag or long forms.
                      </p>
                    </div>

                    <div className="feat-card">
                      <div className="feat-icon-wrap">
                        <div className="feat-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                        </div>
                      </div>
                      <span className="feat-label">Near You</span>
                      <p className="feat-desc-hover">
                        Explore available providers and specialties so you can find the right care close to home.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="home-section">
              <div className="home-commonHeader">
                <div>
                  <h2 className="home-commonTitle">Common Services</h2>
                  <p className="home-commonSub">Easily access doctors offering these services</p>
                </div>
                <button className="home-viewAll" type="button">
                  View All
                </button>
              </div>

              <div className="home-commonGrid">
                {commonServices.map((svc) => (
                  <button key={svc.title} className="home-commonCard" type="button">
                    <div className="home-commonIcon" aria-hidden="true">
                      {svc.icon}
                    </div>
                    <div className="home-commonText">{svc.title}</div>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
