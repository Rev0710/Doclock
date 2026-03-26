import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css' // Ensure the CSS below is added to this file

export default function Register() {
  const { register } = useAuth() 
  const navigate = useNavigate()

  const todayDate = new Date().toISOString().split('T')[0];
  const minDate = "1900-01-01";

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirm: '', role: 'patient',
    address: '', gender: '', birthDate: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email) e.email = 'Email is required make sure to enter a valid email with "@"'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone) e.phone = 'Phone number is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.gender) e.gender = 'Gender is required'
    if (!form.birthDate) e.birthDate = 'Birth date is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setErrors({});

    try {
      const userData = await register({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.toLowerCase().trim(),
        phone: form.phone.replace(/\s/g, ''), 
        password: form.password,
        role: form.role,
        address: form.address,
        gender: form.gender,
        birthDate: form.birthDate,
      });

      if (userData?.role === 'doctor') {
        navigate('/doctor-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ api: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  return (
    <div className="auth-page">
      {/* Visual Side Panel */}
      <div className="auth-visual">
        <div className="auth-visual-inner">
          <div className="auth-logo">Doc<span>Lock</span></div>
          <h2 className="auth-visual-title">Join 50,000+<br />Patients Today</h2>
          <p className="auth-visual-sub">
            Create your account and get instant access to hundreds of verified doctors.
          </p>
          <div className="auth-visual-cards">
            <div className="visual-card anim-fade-up">
              <span className="vc-icon">🏥</span>
              <div><p className="vc-title">Find Specialists</p><p className="vc-sub">200+ verified doctors</p></div>
            </div>
            <div className="visual-card anim-fade-up delay-1">
              <span className="vc-icon">🔒</span>
              <div><p className="vc-title">Secure Data</p><p className="vc-sub">Your records are encrypted</p></div>
            </div>
          </div>
        </div>
        <div className="auth-bg-blob auth-bg-blob--1" />
      </div>

      {/* Main Registration Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box anim-fade-up">
          <div className="auth-form-header">
            <h1 className="auth-title">Create Account 🚀</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>

          {errors.api && <div className="auth-alert auth-alert--error">{errors.api}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field-grid-2">
              <div className="field-group">
                <label className="field-label">First Name</label>
                <div className={`field-wrap-modern ${errors.firstName ? 'error' : ''}`}>
                  <IconUser />
                  <input type="text" placeholder="Name" value={form.firstName} onChange={set('firstName')} />
                </div>
                {errors.firstName && <p className="field-error">{errors.firstName}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Last Name</label>
                <div className={`field-wrap-modern ${errors.lastName ? 'error' : ''}`}>
                  <IconUser />
                  <input type="text" placeholder="Last Name" value={form.lastName} onChange={set('lastName')} />
                </div>
                {errors.lastName && <p className="field-error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className={`field-wrap-modern ${errors.email ? 'error' : ''}`}>
                <IconMail />
                <input type="email" placeholder="email@gmail.com" value={form.email} onChange={set('email')} />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label className="field-label">Gender</label>
                <div className="field-wrap-modern">
                  <select value={form.gender} onChange={set('gender')}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && <p className="field-error">{errors.gender}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Birth Date</label>
                <div className="field-wrap-modern">
                  <input type="date" min={minDate} max={todayDate} value={form.birthDate} onChange={set('birthDate')} />
                </div>
                {errors.birthDate && <p className="field-error">{errors.birthDate}</p>}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Home Address</label>
              <div className="field-wrap-modern">
                <input type="text" placeholder="Address" value={form.address} onChange={set('address')} />
              </div>
              {errors.address && <p className="field-error">{errors.address}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <div className={`field-wrap-modern ${errors.phone ? 'error' : ''}`}>
                <IconPhone />
                <input type="tel" placeholder="09123456789" value={form.phone} onChange={set('phone')} />
              </div>
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="field-grid-2">
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className={`field-wrap-modern ${errors.password ? 'error' : ''}`}>
                  <IconLock />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} />
                  <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Confirm</label>
                <div className={`field-wrap-modern ${errors.confirm ? 'error' : ''}`}>
                  <IconLock />
                  <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} />
                </div>
                {errors.confirm && <p className="field-error">{errors.confirm}</p>}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Role Selection</label>
              <div className="field-wrap-modern">
                <select value={form.role} onChange={set('role')}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            <p className="terms-text">
              By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" className="auth-submit-btn-modern" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Inline Icon Components ── */
const IconUser  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconMail  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconPhone = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const IconLock  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconEyeOff= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>