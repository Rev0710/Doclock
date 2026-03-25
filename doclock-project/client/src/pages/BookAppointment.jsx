import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import './BookAppointment.css'

const DOCTORS = [
  { id: 1, name: 'Dr. Sarah Williams', spec: 'Cardiologist',   rating: 4.9, exp: '12 yrs', patients: 1240, avatar: 'SW', avail: true,  price: 850,  bio: 'Board-certified cardiologist specializing in preventive cardiology and heart disease management.' },
  { id: 2, name: 'Dr. James Tan',      spec: 'Dermatologist',  rating: 4.8, exp: '8 yrs',  patients: 980,  avatar: 'JT', avail: true,  price: 650,  bio: 'Expert in medical and cosmetic dermatology with a focus on skin cancer detection and treatment.' },
  { id: 3, name: 'Dr. Amara Osei',     spec: 'Neurologist',    rating: 4.7, exp: '15 yrs', patients: 2100, avatar: 'AO', avail: false, price: 950,  bio: 'Leading neurologist specializing in epilepsy, migraines, and neurodegenerative diseases.' },
  { id: 4, name: 'Dr. Lisa Chen',      spec: 'Pediatrician',   rating: 4.9, exp: '10 yrs', patients: 1650, avatar: 'LC', avail: true,  price: 700,  bio: 'Dedicated pediatrician providing comprehensive care for children from birth through adolescence.' },
  { id: 5, name: 'Dr. Marco Reyes',    spec: 'Orthopedist',    rating: 4.6, exp: '9 yrs',  patients: 870,  avatar: 'MR', avail: true,  price: 800,  bio: 'Orthopedic surgeon specializing in sports injuries, joint replacement, and minimally invasive procedures.' },
  { id: 6, name: 'Dr. Priya Sharma',   spec: 'Ophthalmologist',rating: 4.8, exp: '11 yrs', patients: 1100, avatar: 'PS', avail: true,  price: 720,  bio: 'Experienced ophthalmologist offering comprehensive eye care including LASIK and cataract surgery.' },
]

const SPECIALTIES = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedist', 'Ophthalmologist']
const TIME_SLOTS  = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','01:00 PM','02:00 PM','03:00 PM','04:30 PM','05:00 PM','06:00 PM']
const TAKEN_SLOTS = [2, 5] // indices of unavailable slots

export default function BookAppointment() {
  const navigate = useNavigate()

  const [specFilter, setSpecFilter] = useState('All')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null)   // selected doctor
  const [selDate,    setSelDate]     = useState('')
  const [selTime,    setSelTime]     = useState('')
  const [consultType,setConsultType] = useState('In-Person')
  const [reason,     setReason]     = useState('')
  const [step,       setStep]       = useState(1)       // 1 = list, 2 = booking form
  const [success,    setSuccess]    = useState(false)
  const [loading,    setLoading]    = useState(false)

  /* Filter doctors */
  const filtered = DOCTORS.filter(d => {
    const matchSpec = specFilter === 'All' || d.spec === specFilter
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.spec.toLowerCase().includes(search.toLowerCase())
    return matchSpec && matchSearch
  })

  const handleSelect = (doc) => { setSelected(doc); setStep(2); window.scrollTo(0,0) }

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!selDate || !selTime) return alert('Please select date and time.')
    setLoading(true)
    /* Simulate API call */
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
  }

  /* ── SUCCESS SCREEN ── */
  if (success) return (
    <div className="book-page">
  
      <div className="book-success anim-scale-in">
        <div className="success-icon">🎉</div>
        <h2 className="success-title">Appointment Booked!</h2>
        <p className="success-sub">
          Your appointment with <strong>{selected.name}</strong> has been confirmed for{' '}
          <strong>{selDate}</strong> at <strong>{selTime}</strong>.
        </p>
        <div className="success-detail-card">
          <div className="sdc-row"><span>Doctor</span><span>{selected.name}</span></div>
          <div className="sdc-row"><span>Specialty</span><span>{selected.spec}</span></div>
          <div className="sdc-row"><span>Date</span><span>{selDate}</span></div>
          <div className="sdc-row"><span>Time</span><span>{selTime}</span></div>
          <div className="sdc-row"><span>Type</span><span>{consultType}</span></div>
          <div className="sdc-row"><span>Fee</span><span>₱{selected.price}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="book-btn-outline" onClick={() => { setSuccess(false); setStep(1); setSelected(null); setSelDate(''); setSelTime('') }}>
            Book Another
          </button>
          <button className="book-btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="book-page">
      

      <div className="book-container">
        {/* ── STEP 1: DOCTOR LIST ── */}
        {step === 1 && (
          <div className="anim-fade-up">
            <div className="book-header">
              <h1 className="book-title">Find a Doctor</h1>
              <p className="book-sub">Browse {DOCTORS.length} verified specialists and book instantly</p>
            </div>

            {/* Search + Filter */}
            <div className="book-filters">
              <div className="book-search-bar">
                <IcoSearch />
                <input
                  type="text"
                  placeholder="Search by name or specialty…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="spec-chips">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    className={`spec-chip ${specFilter === s ? 'active' : ''}`}
                    onClick={() => setSpecFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="results-count">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>

            {/* Doctor cards */}
            <div className="book-doctors-grid">
              {filtered.map((d, i) => (
                <div
                  key={d.id}
                  className="book-doctor-card anim-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="bdc-top">
                    <div className="bdc-avatar">{d.avatar}</div>
                    <div className="bdc-info">
                      <h3 className="bdc-name">{d.name}</h3>
                      <p className="bdc-spec">{d.spec}</p>
                      <div className="bdc-rating">★ {d.rating}
                        <span className="bdc-rating-count">({Math.floor(Math.random() * 200 + 100)} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="bdc-bio">{d.bio}</p>
                  <div className="bdc-badges">
                    <span className="bdc-badge">{d.exp} experience</span>
                    <span className="bdc-badge">{d.patients.toLocaleString()} patients</span>
                  </div>
                  <div className="bdc-footer">
                    <div>
                      <p className="bdc-price">₱{d.price}<span>/session</span></p>
                      <p className={`bdc-avail ${d.avail ? 'avail-yes' : 'avail-no'}`}>
                        <span className="avail-dot" /> {d.avail ? 'Available today' : 'Not available'}
                      </p>
                    </div>
                    <button
                      className={`bdc-book-btn ${!d.avail ? 'disabled' : ''}`}
                      onClick={() => d.avail && handleSelect(d)}
                      disabled={!d.avail}
                    >
                      {d.avail ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: BOOKING FORM ── */}
        {step === 2 && selected && (
          <div className="anim-fade-up">
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back to doctors
            </button>

            <div className="booking-layout">
              {/* Left: form */}
              <div className="booking-form-col">
                {/* Doctor summary */}
                <div className="booking-doctor-banner">
                  <div className="bdc-avatar" style={{ width: 60, height: 60, fontSize: 22, borderRadius: 16 }}>
                    {selected.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 className="bd-name">{selected.name}</h2>
                    <p className="bd-spec">{selected.spec}</p>
                    <p className="bd-rating">★ {selected.rating} · {selected.exp} experience</p>
                  </div>
                  <div className="bd-price">
                    <span>₱{selected.price}</span>
                    <small>/session</small>
                  </div>
                </div>

                <form onSubmit={handleConfirm}>
                  {/* Date picker */}
                  <div className="form-section">
                    <h3 className="form-section-title">Select Date</h3>
                    <input
                      type="date"
                      className="date-picker"
                      value={selDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setSelDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Time slots */}
                  <div className="form-section">
                    <h3 className="form-section-title">Available Time Slots</h3>
                    <div className="time-slots-grid">
                      {TIME_SLOTS.map((t, i) => {
                        const isTaken = TAKEN_SLOTS.includes(i)
                        return (
                          <button
                            key={t}
                            type="button"
                            className={`time-slot ${selTime === t ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                            onClick={() => !isTaken && setSelTime(t)}
                            disabled={isTaken}
                          >
                            {t}
                          </button>
                        )
                      })}
                    </div>
                    <div className="slot-legend">
                      <span><span className="legend-dot available" /> Available</span>
                      <span><span className="legend-dot selected-dot" /> Selected</span>
                      <span><span className="legend-dot taken-dot" /> Taken</span>
                    </div>
                  </div>

                  {/* Consult type */}
                  <div className="form-section">
                    <h3 className="form-section-title">Consultation Type</h3>
                    <div className="consult-types">
                      {['In-Person', 'Video Call', 'Phone Call'].map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`consult-type-btn ${consultType === t ? 'active' : ''}`}
                          onClick={() => setConsultType(t)}
                        >
                          {t === 'In-Person' ? '🏥' : t === 'Video Call' ? '📹' : '📞'} {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="form-section">
                    <h3 className="form-section-title">Reason for Visit <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span></h3>
                    <textarea
                      className="reason-textarea"
                      rows={3}
                      placeholder="Briefly describe your symptoms or concern…"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="book-btn-primary book-btn-full" disabled={loading}>
                    {loading ? <><span className="btn-spinner" /> Confirming…</> : 'Confirm Appointment'}
                  </button>
                </form>
              </div>

              {/* Right: summary */}
              <div className="booking-summary-col">
                <div className="summary-card">
                  <h3 className="summary-title">Appointment Summary</h3>
                  <div className="summary-rows">
                    {[
                      ['Doctor',    selected.name],
                      ['Specialty', selected.spec],
                      ['Date',      selDate  || 'Not selected'],
                      ['Time',      selTime  || 'Not selected'],
                      ['Type',      consultType],
                    ].map(([l, v]) => (
                      <div key={l} className="summary-row">
                        <span className="sr-label">{l}</span>
                        <span className={`sr-value ${(!selDate && l === 'Date') || (!selTime && l === 'Time') ? 'sr-empty' : ''}`}>{v}</span>
                      </div>
                    ))}
                    <div className="summary-total">
                      <span>Total Fee</span>
                      <span className="summary-price">₱{selected.price}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-note">
                  <IcoInfo /> Free cancellation up to 24 hours before the appointment.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

/* ── Icons ── */
const IcoSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--slate-400)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IcoInfo   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>