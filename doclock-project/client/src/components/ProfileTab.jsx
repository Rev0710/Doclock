import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { getProfileImageSrc } from '../lib/api.js'

export default function ProfileTab() {
  const { user, updateProfile, deleteProfile } = useAuth()

  // 1. STATE INITIALIZATION
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // 2. HELPER FUNCTIONS (Missing these caused the white screen)
  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '', api: '' }))
    setSuccess('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      const payload = { 
        name: form.name, 
        email: form.email, 
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        birthDate: form.birthDate
      }
      if (form.password) payload.password = form.password

      await updateProfile(payload)
      setSuccess('✅ Profile updated successfully!')
      setForm(f => ({ ...f, password: '', confirm: '' }))
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Update failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('CRITICAL: Are you sure? This will permanently delete your account.')) {
      try {
        await deleteProfile()
      } catch (err) {
        setErrors({ api: 'Failed to delete account.' })
      }
    }
  }

  // 3. UI RENDERING
  return (
    <div className="anim-fade-up profile-section">
      <div className="profile-card">
        <img
          className="profile-avatar-lg"
          src={getProfileImageSrc(user)}
          alt=""
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h2 className="profile-name">{user?.name || 'Guest'}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="profile-role-badge">{user?.role}</span>
        </div>
      </div>

      {success && <div style={{color: 'green', marginBottom: '10px'}}>{success}</div>}
      {errors.api && <div style={{color: 'red', marginBottom: '10px'}}>{errors.api}</div>}

      <form onSubmit={handleSave} className="profile-fields">
        <div className="profile-row">
          <div className="profile-field">
            <label className="pf-label">Full Name</label>
            <input className="pf-input" value={form.name} onChange={set('name')} />
          </div>
          <div className="profile-field">
            <label className="pf-label">Email Address</label>
            <input className="pf-input" value={form.email} onChange={set('email')} />
          </div>
        </div>

        <div className="profile-row">
          <div className="profile-field">
            <label className="pf-label">Phone Number</label>
            <input className="pf-input" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="profile-field">
            <label className="pf-label">Date of Birth</label>
            <input className="pf-input" type="date" value={form.birthDate} onChange={set('birthDate')} />
          </div>
        </div>

        <div className="profile-row">
          <div className="profile-field">
            <label className="pf-label">Gender</label>
            <select className="pf-input" value={form.gender} onChange={set('gender')}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="profile-field">
            <label className="pf-label">Address</label>
            <input className="pf-input" value={form.address} onChange={set('address')} />
          </div>
        </div>

        <button type="submit" className="dash-book-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="danger-zone" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ color: 'red' }}>Danger Zone</h3>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>Once you delete your account, there is no going back.</p>
        <button
          type="button"
          onClick={handleDelete}
          className="delete-acc-btn"
          style={{
            color: 'red',
            background: 'none',
            border: '1px solid red',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Delete My Account
        </button>
      </div>

    </div>
  )
}