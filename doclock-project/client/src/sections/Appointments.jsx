import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, getProfileImageSrc } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';
import { useAppointments } from '../hooks/useAppointments.js';
import { formatVisitDate, specialtyAndDoctorFromService } from '../utils/appointmentDisplay.js';

const NavIcon = ({ children }) => (
  <span className="home-navIcon" aria-hidden="true">
    {children}
  </span>
);

export default function Appointments() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { appointments, loading, loadError, loadAppointments, updateAppointment, removeAppointment } = useAppointments();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('upcoming'); // upcoming | completed | cancelled
  const [actionError, setActionError] = useState('');
  const profileImg = getProfileImageSrc(getAuthUser() || user);

  useEffect(() => {
    document.title = 'Doclock | Appointments';
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const visits = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return list.map((appt) => {
      const { specialty, doctor } = specialtyAndDoctorFromService(appt.service);
      const rawId = appt._id ?? appt.id;
      const id = rawId != null ? String(rawId) : '';
      const dateStr = appt.date ? String(appt.date).slice(0, 10) : '';
      const dateVal = dateStr ? new Date(`${dateStr}T12:00:00`) : null;
      const validDate = dateVal && !Number.isNaN(dateVal.getTime());
      const dayStart = validDate ? new Date(dateVal) : null;
      if (dayStart) dayStart.setHours(0, 0, 0, 0);

      const st = String(appt.status || 'pending').toLowerCase();
      let uiStatus = 'upcoming';
      if (st === 'cancelled') uiStatus = 'cancelled';
      else if (validDate && dayStart < today) uiStatus = 'completed';
      else uiStatus = 'upcoming';

      return {
        id,
        status: uiStatus,
        name: doctor,
        specialty,
        date: formatVisitDate(appt.date),
        time: appt.time || '—',
      };
    });
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = visits.filter((v) => v.status === tab);
    if (!q) return base;
    return base.filter((v) => `${v.name} ${v.specialty} ${v.date} ${v.time}`.toLowerCase().includes(q));
  }, [query, tab, visits]);

  const handleCancel = async (id) => {
    setActionError('');
    const res = await updateAppointment(id, { status: 'cancelled' });
    if (!res.success) setActionError('Could not cancel');
  };

  const handleRemove = async (id) => {
    setActionError('');
    const res = await removeAppointment(id);
    if (!res.success) setActionError('Could not remove appointment');
  };

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

  const wideCardBase = (v, actions) => (
    <article key={v.id} className="appts-wideCard" aria-label={`${v.status} appointment`}>
      <div className="appts-wideTop">
        {profileImg ? <img className="appts-wideAvatar" src={profileImg} alt="" /> : <div className="appts-wideAvatar" aria-hidden="true" />}
        <div className="appts-wideInfo">
          <div className="appts-wideName">{v.name}</div>
          <div className="appts-wideSpec">{v.specialty}</div>
        </div>
        <div className="appts-wideIcons">
          <button type="button" className="appts-wideIconBtn" aria-label="Call">
            <svg viewBox="0 0 24 24">
              <path
                d="M6.6 2.9 9 5.3c.8.8.8 2 0 2.8L7.6 9.5c1.2 2.3 3.1 4.2 5.4 5.4l1.4-1.4c.8-.8 2-.8 2.8 0l2.4 2.4c.9.9.9 2.3 0 3.2l-1.6 1.6c-.7.7-1.7 1-2.7.9-3.5-.5-6.8-2.4-9.4-5.1C3.4 13.9 1.5 10.6 1 7.1c-.1-1 .2-2 .9-2.7L3.4 2.9c.9-.9 2.3-.9 3.2 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className="appts-wideIconBtn" aria-label="Message">
            <svg viewBox="0 0 24 24">
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="appts-widePill">
        <div className="appts-widePillCol">
          <div className="appts-widePillLabel">Date</div>
          <div className="appts-widePillValue">
            {calendarMini}
            {v.date}
          </div>
        </div>
        <div className="appts-widePillDivider" aria-hidden="true" />
        <div className="appts-widePillCol">
          <div className="appts-widePillLabel">Time</div>
          <div className="appts-widePillValue">
            {clockMini}
            {v.time}
          </div>
        </div>
      </div>

      <div className="appts-wideHr" />

      <div className="appts-wideActions">{actions}</div>
    </article>
  );

  const upcomingCard = (v) =>
    wideCardBase(
      v,
      <>
        <button type="button" className="appts-wideCancel" onClick={() => handleCancel(v.id)}>
          Cancel
        </button>
        <button
          type="button"
          className="appts-wideChange"
          onClick={() =>
            navigate('/set-appointment', {
              state: { doctorName: v.name, specialty: v.specialty === '—' ? 'General' : v.specialty },
            })
          }
        >
          Change Schedule
        </button>
      </>,
    );

  const completedOrCancelledCard = (v) =>
    wideCardBase(
      v,
      <>
        <button type="button" className="appts-wideRemove" onClick={() => handleRemove(v.id)}>
          Remove
        </button>
        <button type="button" className="appts-wideBookAgain" onClick={() => navigate('/available')}>
          Book Again
        </button>
      </>,
    );

  return (
    <div className="home-page home-dashboard" role="region" aria-label="Appointments">
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
          <button type="button" className="home-navItem active">
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
          <button type="button" className="home-navItem" onClick={() => navigate('/available')}>
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
            <input
              className="home-searchInput"
              type="search"
              placeholder="Search appointments"
              aria-label="Search appointments"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
          <main className="home-content home-contentDash">
            <section className="home-section">
              <div className="appts-tabs" role="tablist" aria-label="Appointment tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'upcoming'}
                  className={`appts-tab ${tab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setTab('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'completed'}
                  className={`appts-tab ${tab === 'completed' ? 'active' : ''}`}
                  onClick={() => setTab('completed')}
                >
                  Completed
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'cancelled'}
                  className={`appts-tab ${tab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setTab('cancelled')}
                >
                  Cancelled
                </button>
              </div>

              {loadError ? (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#b91c1c' }} role="alert">
                    {loadError}
                  </p>
                  <button type="button" className="home-book" style={{ marginTop: 8 }} onClick={() => loadAppointments()}>
                    Try again
                  </button>
                </div>
              ) : actionError ? (
                <p style={{ color: '#b91c1c', marginBottom: 12 }} role="alert">
                  {actionError}
                </p>
              ) : null}

              <div className="home-cards">
                {loadError ? null : loading ? (
                  <p style={{ color: '#64748b', textAlign: 'center', marginTop: 24 }}>Loading appointments…</p>
                ) : filtered.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', marginTop: 24 }}>
                    No {tab} appointments. Book one from Available Doctors or Set Appointment.
                  </p>
                ) : tab === 'upcoming' ? (
                  filtered.map((v) => upcomingCard(v))
                ) : (
                  filtered.map((v) => completedOrCancelledCard(v))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

