import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero_img.png';
import plus from '../assets/cross-png.png';
import stethoscope from '../assets/stethoscope-icon.png';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Doclock | Register';
  }, []);

  return (
    <div className="login-page">
      <MarketingNavbar />

      <div className="login-shell">
        <div className="login-frame register-frame" role="region" aria-label="Register">
          <div className="login-left" aria-hidden="true">
            <img className="login-doctor" src={heroImg} alt="" />
            <div className="login-deco-plus">
              <img src={plus} alt="" />
            </div>
            <div className="login-deco-stetho">
              <img src={stethoscope} alt="" />
            </div>
          </div>

          <div className="login-right">
            <header className="login-header">
              <h1 className="register-title">
                Create Account <span aria-hidden="true">🚀</span>
              </h1>
              <p className="login-subtitle">Fill in your details to get started</p>
            </header>

            <form
              className="login-form register-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                if (!name.trim()) return setError('Please enter your name');
                if (password.length < 8) return setError('Password must be at least 8 characters');
                if (password !== confirm) return setError('Passwords do not match');
                if (role === 'doctor' && !specialty.trim()) return setError('Please select doctor type');
                setLoading(true);
                try {
                  await register({ name: name.trim(), email, phone, password, role, specialty: specialty.trim() });
                  navigate(role === 'admin' ? '/admin' : '/upload-photo');
                } catch (err) {
                  setError(err?.response?.data?.message || err?.message || 'Registration failed');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label className="login-label">
                <span>Full name</span>
                <input
                  className="login-input"
                  type="text"
                  placeholder="John Dela Cruz"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="login-label">
                <span>Email Address</span>
                <input
                  className="login-input"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <div className="register-grid2">
                <label className="login-label">
                  <span>Gender</span>
                  <select className="login-input" defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </label>
                <label className="login-label">
                  <span>Birth Date</span>
                  <input className="login-input" type="date" />
                </label>
              </div>

              <label className="login-label">
                <span>Home Address</span>
                <input className="login-input" type="text" placeholder="Street, City, Province" autoComplete="street-address" />
              </label>

              <label className="login-label">
                <span>Phone Number</span>
                <input
                  className="login-input"
                  type="tel"
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <div className="register-grid2">
                <label className="login-label">
                  <span>Password</span>
                  <div className="login-passwordRow">
                    <input
                      className="login-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 chars"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="login-eye"
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </label>

                <label className="login-label">
                  <span>Confirm</span>
                  <div className="login-passwordRow">
                    <input
                      className="login-input"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                    <button
                      className="login-eye"
                      type="button"
                      aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </label>
              </div>

              <label className="login-label">
                <span>I am a</span>
                <select
                  className="login-input"
                  value={role}
                  onChange={(e) => {
                    const nextRole = e.target.value;
                    setRole(nextRole);
                    if (nextRole !== 'doctor') setSpecialty('');
                  }}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                </select>
              </label>

              {role === 'doctor' ? (
                <label className="login-label">
                  <span>Doctor Type</span>
                  <select className="login-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                    <option value="">Select specialization</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="OB-GYN">OB-GYN</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                  </select>
                </label>
              ) : null}

              <p className="register-terms">
                By creating an account you agree to our{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
                .
              </p>

              {error ? <div className="login-error" role="alert">{error}</div> : null}

              <button className="register-primary" type="submit">
                {loading ? 'Creating…' : 'Create Account'}
              </button>

              <p className="login-register">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

