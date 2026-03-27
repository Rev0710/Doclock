import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero_img.png';
import { apiFetch, getAuthUser, getProfileImageSrc } from '../lib/api';
import { useAppointments } from '../hooks/useAppointments.js';
import { useAuth } from '../hooks/useAuth.js';
import DashboardNav from '../components/DashboardNav.jsx';

export default function SerApntmt() {
  const navigate = useNavigate();
  const location = useLocation();
  const picked = location.state || {};
  const doctorId = picked.doctorId;
  const doctorName = picked.doctorName || 'Dr. James Tan';
  const specialty = picked.specialty || 'Dermatologist';
  const fee = 650;

  const { loadAppointments } = useAppointments();
  const { user } = useAuth();
  const profileImg = getProfileImageSrc(getAuthUser() || user);
  const dateInputRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [patientType, setPatientType] = useState('you');
  const [patientName, setPatientName] = useState(() => getAuthUser()?.name || '');
  const [patientAge, setPatientAge] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');

  useEffect(() => {
    document.title = 'Doclock | Set Appointment';
  }, []);

  const timeSlots = useMemo(
    () => ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00'],
    [],
  );

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return 'Enter date';
    const d = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return selectedDate;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  const onBookNow = async () => {
    setBookError('');
    if (!selectedDate) {
      setBookError('Please select an appointment date.');
      return;
    }
    setBooking(true);
    try {
      const who = patientName || getAuthUser()?.name || 'Patient';
      await apiFetch('/api/auth/book-appointment', {
        method: 'POST',
        body: {
          date: selectedDate,
          time: selectedTime || '',
          service: `${specialty} — ${doctorName} — ${who}${patientAge ? ` (${patientAge})` : ''}`,
          ...(doctorId ? { doctorId: String(doctorId) } : {}),
        },
      });

      await loadAppointments();

      navigate('/booked', {
        state: {
          doctor: doctorName,
          specialty,
          date: selectedDate ? selectedDate : 'Not selected',
          time: selectedTime || 'Not selected',
          type: 'In-Person',
          fee,
        },
      });
    } catch (err) {
      setBookError(err?.message || 'Failed to save appointment');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="home-page home-dashboard" role="region" aria-label="Set appointment">
      <aside className="home-sidebar" aria-label="Main navigation">
        <DashboardNav />
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
          <main className="home-content home-contentDash apnt-page">
            <button className="apnt-back" type="button" onClick={() => navigate(-1)} aria-label="Go back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="apnt-card">
              <div className="apnt-hero">
                <div className="apnt-heroTitle">Set Appointment</div>
                <img className="apnt-heroImg" src={heroImg} alt="" />
              </div>

              <div className="apnt-body">
                <div className="apnt-layout">
                  <div className="apnt-left">
                    <div className="apnt-doctorRow">
                      <div>
                        <div className="apnt-docName">{doctorName}</div>
                        <div className="apnt-metaRow">
                          <span className="apnt-metaItem">
                            <span className="apnt-metaIcon" aria-hidden="true">
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
                            ADDRESS
                          </span>
                          <span className="apnt-metaItem">
                            <span className="apnt-metaIcon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 2v4M16 2v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </span>
                            Mon – Thu-Fri
                          </span>
                          <span className="apnt-metaItem">
                            <span className="apnt-metaIcon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            9:00 am – 4:00 pm
                          </span>
                        </div>
                      </div>

                      <span className="apnt-chip">{specialty}</span>
                    </div>

                    <h3 className="apnt-h3">Select Appointment Date</h3>

                    <div className="apnt-grid">
                      <div className="apnt-dateBox">
                        <div className="apnt-smallLabel">Date</div>
                        <label
                          className="apnt-dateField"
                          onClick={() => {
                            const el = dateInputRef.current;
                            if (!el) return;
                            // showPicker is supported in Chromium-based browsers
                            if (typeof el.showPicker === 'function') el.showPicker();
                            else el.focus();
                          }}
                        >
                          <span className={`apnt-datePlaceholder ${selectedDate ? 'hasValue' : ''}`}>{selectedDateText}</span>
                          <span className="apnt-dateIcon" aria-hidden="true">
                            📅
                          </span>
                          <input
                            className="apnt-dateInput"
                            type="date"
                            ref={dateInputRef}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            aria-label="Select date"
                          />
                        </label>
                        <button className="apnt-monthBtn" type="button">
                          MM/DD/YYYY
                        </button>
                      </div>

                      <div className="apnt-timeBox">
                        <div className="apnt-smallLabel">Time</div>
                        <div className="apnt-timeGrid">
                          {timeSlots.map((t) => (
                            <button
                              key={t}
                              type="button"
                              className={`apnt-timeBtn ${selectedTime === t ? 'active' : ''}`}
                              onClick={() => setSelectedTime(t)}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h3 className="apnt-h3">Patient</h3>
                    <div className="apnt-toggle">
                      <button
                        type="button"
                        className={`apnt-toggleBtn ${patientType === 'you' ? 'active' : ''}`}
                        onClick={() => setPatientType('you')}
                      >
                        You
                      </button>
                      <button
                        type="button"
                        className={`apnt-toggleBtn ${patientType === 'other' ? 'active' : ''}`}
                        onClick={() => setPatientType('other')}
                      >
                        Other Patient
                      </button>
                    </div>

                    <div className="apnt-formRow">
                      <label className="apnt-field">
                        <div className="apnt-fieldLabel">Enter your Name</div>
                        <input className="apnt-input" placeholder="Enter your Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                      </label>
                      <label className="apnt-field">
                        <div className="apnt-fieldLabel">Enter your Age</div>
                        <input className="apnt-input" placeholder="Enter your Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
                      </label>
                      <label className="apnt-field">
                        <div className="apnt-fieldLabel">Symptoms</div>
                        <input className="apnt-input" placeholder="Symptoms" />
                      </label>
                    </div>

                    <button
                      className="apnt-book"
                      type="button"
                      onClick={onBookNow}
                      disabled={booking}
                    >
                      {booking ? 'Booking...' : 'Book NOW'}
                    </button>
                    {bookError ? <div className="login-error" role="alert">{bookError}</div> : null}
                  </div>

                  <aside className="apnt-right" aria-label="Appointment summary">
                    <div className="apnt-summaryCard">
                      <div className="apnt-summaryTitle">Appointment Summary</div>

                      <div className="apnt-summaryRows">
                        <div className="apnt-sRow">
                          <div className="apnt-sLabel">Doctor</div>
                          <div className="apnt-sValue">{doctorName}</div>
                        </div>
                        <div className="apnt-sRow">
                          <div className="apnt-sLabel">Specialty</div>
                          <div className="apnt-sValue">{specialty}</div>
                        </div>
                        <div className="apnt-sRow">
                          <div className="apnt-sLabel">Date</div>
                          <div className={`apnt-sValue ${selectedDate ? '' : 'muted'}`}>{selectedDate ? selectedDateText : 'Not selected'}</div>
                        </div>
                        <div className="apnt-sRow">
                          <div className="apnt-sLabel">Time</div>
                          <div className={`apnt-sValue ${selectedTime ? '' : 'muted'}`}>{selectedTime || 'Not selected'}</div>
                        </div>
                        <div className="apnt-sRow">
                          <div className="apnt-sLabel">Type</div>
                          <div className="apnt-sValue">In-Person</div>
                        </div>
                      </div>

                      <div className="apnt-summaryDivider" />

                      <div className="apnt-totalRow">
                        <div className="apnt-totalLabel">Total Fee</div>
                        <div className="apnt-totalValue">₱{fee}</div>
                      </div>
                    </div>

                    <div className="apnt-note">
                      <span className="apnt-noteIcon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span>Free cancellation up to 24 hours before the appointment.</span>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

