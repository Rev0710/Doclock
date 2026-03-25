import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import './Home.css'

/* ── Mock doctors for showcase ── */
const FEATURED = [
  { name: 'Dr. Sarah Williams', spec: 'Cardiologist',    rating: 4.9, exp: '12 yrs', avatar: 'SW', avail: true  },
  { name: 'Dr. James Tan',      spec: 'Dermatologist',   rating: 4.8, exp: '8 yrs',  avatar: 'JT', avail: true  },
  { name: 'Dr. Amara Osei',     spec: 'Neurologist',     rating: 4.7, exp: '15 yrs', avatar: 'AO', avail: false },
  { name: 'Dr. Lisa Chen',      spec: 'Pediatrician',    rating: 4.9, exp: '10 yrs', avatar: 'LC', avail: true  },
]

const FEATURES = [
  { icon: '🔍', title: 'Find Specialists',   desc: 'Browse hundreds of verified doctors across all specializations.' },
  { icon: '📅', title: 'Easy Scheduling',    desc: 'Book appointments in seconds — no phone calls needed.' },
  { icon: '🔔', title: 'Smart Reminders',    desc: 'Automated reminders via SMS and email so you never miss a visit.' },
  { icon: '📋', title: 'Health Records',     desc: 'Securely store and access medical history anytime, anywhere.' },
  { icon: '💬', title: 'Teleconsultation',   desc: 'Connect with doctors virtually from the comfort of your home.' },
  { icon: '⭐', title: 'Verified Reviews',   desc: 'Read authentic patient reviews to choose the right provider.' },
]

const STATS = [
  { value: '50K+', label: 'Patients Served' },
  { value: '200+', label: 'Specialist Doctors' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '98%',  label: 'Satisfaction Rate' },
]

export default function Home() {
  return (
    <div className="home-page">


      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text anim-fade-up">
            <div className="hero-tag">🏥 Trusted by 50,000+ patients across the Philippines</div>
            <h1 className="hero-title">
              Book Your <span>Doctor</span><br />Appointment Instantly
            </h1>
            <p className="hero-desc">
              Connect with top-rated specialists in your area. Schedule, manage,
              and track your healthcare appointments — all in one secure place.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="hero-btn-primary">
                Book an Appointment
                <IconArrow />
              </Link>
              <Link to="/book" className="hero-btn-outline">Browse Doctors</Link>
            </div>

            <div className="hero-stats">
              {STATS.map(s => (
                <div key={s.label} className="hero-stat">
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual anim-fade-up delay-2">
            <div className="hero-visual-inner">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="hero-illus">
                <circle cx="100" cy="80" r="44" fill="rgba(255,255,255,.18)"/>
                <text x="100" y="96" textAnchor="middle" fontSize="44">👨‍⚕️</text>
                <rect x="36" y="136" width="128" height="44" rx="14" fill="rgba(255,255,255,.12)"/>
                <rect x="50" y="147" width="80" height="8" rx="4" fill="rgba(255,255,255,.5)"/>
                <rect x="50" y="162" width="56" height="6" rx="3" fill="rgba(255,255,255,.3)"/>
              </svg>

              <div className="hero-float-card hero-float-card--1 anim-slide-in delay-3">
                <div className="hfc-icon hfc-icon--green">✓</div>
                <div>
                  <p className="hfc-title">Appointment Confirmed</p>
                  <p className="hfc-sub">Dr. Sarah · 10:00 AM</p>
                </div>
              </div>
              <div className="hero-float-card hero-float-card--2 anim-slide-in delay-4">
                <div className="hfc-icon hfc-icon--blue">🔒</div>
                <div>
                  <p className="hfc-title">Secure & HIPAA</p>
                  <p className="hfc-sub">Data encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Everything you need for better healthcare</h2>
            <p className="section-sub">Simple, powerful tools to manage your health journey</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card anim-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ── */}
      <section className="featured-doctors">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Meet our top doctors</h2>
            <p className="section-sub">Verified specialists ready to help you</p>
          </div>
          <div className="doctors-grid">
            {FEATURED.map((d, i) => (
              <div
                key={d.name}
                className="doctor-card anim-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="dc-avatar">{d.avatar}</div>
                <div className="dc-info">
                  <h4 className="dc-name">{d.name}</h4>
                  <p className="dc-spec">{d.spec}</p>
                  <div className="dc-meta">
                    <span className="dc-rating">★ {d.rating}</span>
                    <span className="dc-exp">{d.exp} exp</span>
                  </div>
                </div>
                <div className={`dc-avail ${d.avail ? 'avail-yes' : 'avail-no'}`}>
                  <span className="avail-dot" />
                  {d.avail ? 'Available' : 'Busy'}
                </div>
                <Link to={`/book`} className="dc-book-btn">Book Now</Link>
              </div>
            ))}
          </div>
          <div className="see-all-wrap">
            <Link to="/book" className="see-all-btn">See all doctors →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">How DocLock works</h2>
            <p className="section-sub">Get started in three simple steps</p>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '👤', title: 'Create Account',       desc: 'Sign up free and complete your health profile in minutes.' },
              { step: '02', icon: '🔍', title: 'Find Your Doctor',     desc: 'Browse specialists, read reviews, and choose the best match.' },
              { step: '03', icon: '📅', title: 'Book & Get Confirmed', desc: 'Pick a time slot and receive instant confirmation.' },
            ].map((s, i) => (
              <div key={s.step} className="step-card anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to take control of your health?</h2>
          <p className="cta-sub">Join thousands of patients who trust DocLock every day.</p>
          <Link to="/register" className="cta-btn">Create Free Account →</Link>
        </div>
        <div className="cta-blob cta-blob--1" />
        <div className="cta-blob cta-blob--2" />
      </section>

    </div>
  )
}

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)