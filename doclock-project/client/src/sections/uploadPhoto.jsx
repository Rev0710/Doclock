import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import { getAuthUser, setAuthUser, setAvatarDataUrl } from '../lib/api';

export default function UploadPhoto() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    document.title = 'Doclock | Edit Profile';
  }, []);

  useEffect(() => {
    const u = getAuthUser();
    if (u?.name) setFullName(u.name);
  }, []);

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

          <h1 className="upload-title">Edit Profile</h1>

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
              const current = getAuthUser();
              if (fullName.trim()) setAuthUser({ ...(current || {}), name: fullName.trim() });

              if (file) {
                const dataUrl = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result || ''));
                  reader.onerror = () => reject(new Error('Failed to read image'));
                  reader.readAsDataURL(file);
                });
                setAvatarDataUrl(dataUrl);
              }

              navigate('/home');
            }}
          >
            <label className="login-label upload-label">
              <span>Enter your Fullname</span>
              <input
                className="login-input upload-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your Fullname"
                autoComplete="name"
              />
            </label>

            <button className="upload-save" type="submit">
              Save
            </button>
          </form>

     
        </div>
      </div>
      </div>
    
  );
}

