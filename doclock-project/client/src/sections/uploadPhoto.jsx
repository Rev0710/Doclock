import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import { getAuthUser } from '../lib/api';
import { useAuth } from '../hooks/useAuth.js';

export default function UploadPhoto() {
  const navigate = useNavigate();
  const { updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    document.title = 'Doclock | Edit Profile';
  }, []);

  useEffect(() => {
    if (!user) return;
    // Doctors must enter their professional name here (not prefilled from email).
    if (user.role === 'doctor') {
      setFullName('');
      return;
    }
    if (user.name) setFullName(user.name);
  }, [user]);

  useEffect(() => {
    return () => {  
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="login-page upload-page">
      <MarketingNavbar />

      <div className="login-shell">
        <div className="upload-frame" role="region" aria-label="Edit profile">
          <button className="upload-back" type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <h1 className="upload-title">{user?.role === 'doctor' ? 'Complete your profile' : 'Edit Profile'}</h1>

          <div className="upload-avatarBlock">
            <label className="upload-avatar" aria-label="Upload photo">
              <input
                className="upload-fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {previewUrl ? (
                <img className="upload-avatarImg" src={previewUrl} alt="Profile preview" />
              ) : (
                <div className="upload-avatarPlaceholder" aria-hidden="true" />
              )}

              <span className="upload-camera" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M20 6h-3.2l-1.2-1.6A2 2 0 0 0 14.1 3H9.9a2 2 0 0 0-1.5.8L7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </label>

            <div className="upload-photoText">Upload photo</div>
          </div>

          <form
            className="upload-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitError('');
              const current = getAuthUser() || user;
              const isDoctor = current?.role === 'doctor';

              if (isDoctor && !fullName.trim()) {
                setSubmitError('Please enter your full name as it should appear to patients.');
                return;
              }

              const payload = {};
              if (fullName.trim()) payload.name = fullName.trim();
              if (file) {
                const dataUrl = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result || ''));
                  reader.onerror = () => reject(new Error('Failed to read image'));
                  reader.readAsDataURL(file);
                });
                payload.avatar = dataUrl;
              }

              if (Object.keys(payload).length > 0) {
                try {
                  await updateProfile(payload);
                } catch (err) {
                  setSubmitError(err?.response?.data?.message || err?.message || 'Could not save profile');
                  return;
                }
              }

              const role = current?.role;
              navigate(role === 'doctor' || role === 'admin' ? '/admin' : '/home');
            }}
          >
            <label className="login-label upload-label">
              <span>{user?.role === 'doctor' ? 'Full name (required)' : 'Full name'}</span>
              <input
                className="login-input upload-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={user?.role === 'doctor' ? 'Dr. Juan Dela Cruz' : 'Your full name'}
                autoComplete="name"
                required={user?.role === 'doctor'}
              />
            </label>
            {user?.role === 'doctor' ? (
              <p style={{ fontSize: 11, color: '#64748b', marginTop: -4, marginBottom: 8, lineHeight: 1.4 }}>
                This is shown to patients when they book with you.
              </p>
            ) : null}
            {submitError ? (
              <div className="login-error" role="alert" style={{ marginBottom: 8 }}>
                {submitError}
              </div>
            ) : null}

            <button className="upload-save" type="submit">
              Save
            </button>
          </form>

     
        </div>
      </div>
      </div>
    
  );
}

