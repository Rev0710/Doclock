// ─────────────────────────────────────────────
// ProfileTab.jsx  —  drop this file in src/components/
// Then in Dashboard.jsx:
//   1. import ProfileTab from '../components/ProfileTab.jsx'
//   2. Replace the entire {sideNav === 'profile' && (...)} block with:
//      {sideNav === 'profile' && <ProfileTab />}
// ─────────────────────────────────────────────
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfileTab() {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    phone:    user?.phone || '',
    password: '',
    confirm:  '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '', api: '' }))
    setSuccess('')
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (form.password && form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    if (form.password && form.password !== form.confirm)
      e.confirm = 'Passwords do not match'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      const payload = { name: form.name, email: form.email, phone: form.phone }
      if (form.password) payload.password = form.password

      await updateProfile(payload)

      setSuccess('✅ Profile updated successfully!')
      setForm(f => ({ ...f, password: '', confirm: '' }))
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Update failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="anim-fade-up profile-section">
      {/* Profile header card */}
      <div className="profile-card">
        <div className="profile-avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
        <div>
          <h2 className="profile-name">{user?.name || 'Guest User'}</h2>
          <p className="profile-email">{user?.email || '—'}</p>
          <span className="profile-role-badge">{user?.role || 'patient'}</span>
        </div>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          color: '#166534', padding: '12px 16px', borderRadius: 10,
          marginBottom: 16, fontSize: '0.9rem'
        }}>
          {success}
        </div>
      )}
      {errors.api && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          color: '#991b1b', padding: '12px 16px', borderRadius: 10,
          marginBottom: 16, fontSize: '0.9rem'
        }}>
          {errors.api}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="profile-fields" noValidate>
        {/* Full Name */}
        <div className="profile-field">
          <label className="pf-label">Full Name</label>
          <input
            className={`pf-input ${errors.name ? 'pf-input--error' : ''}`}
            value={form.name}
            onChange={set('name')}
            placeholder="Your full name"
          />
          {errors.name && <p className="pf-error">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="profile-field">
          <label className="pf-label">Email Address</label>
          <input
            className={`pf-input ${errors.email ? 'pf-input--error' : ''}`}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
          />
          {errors.email && <p className="pf-error">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="profile-field">
          <label className="pf-label">Phone Number</label>
          <input
            className={`pf-input ${errors.phone ? 'pf-input--error' : ''}`}
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+63 9XX XXX XXXX"
          />
          {errors.phone && <p className="pf-error">{errors.phone}</p>}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <p className="pf-label" style={{ marginBottom: 4 }}>
          Change Password <span style={{ fontWeight: 400, color: '#94a3b8' }}>(leave blank to keep current)</span>
        </p>

        {/* New Password */}
        <div className="profile-field">
          <label className="pf-label">New Password</label>
          <input
            className={`pf-input ${errors.password ? 'pf-input--error' : ''}`}
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Min. 8 characters"
          />
          {errors.password && <p className="pf-error">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="profile-field">
          <label className="pf-label">Confirm New Password</label>
          <input
            className={`pf-input ${errors.confirm ? 'pf-input--error' : ''}`}
            type="password"
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="Repeat new password"
          />
          {errors.confirm && <p className="pf-error">{errors.confirm}</p>}
        </div>

        <button
          type="submit"
          className="dash-book-btn"
          style={{ marginTop: 8 }}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}