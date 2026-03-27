import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero_img.png';
import plus from '../assets/cross-png.png';
import stethoscope from '../assets/stethoscope-icon.png';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Doclock | Login';
  }, []);

  return (

    
    <div className="login-page">
      {/* NAVBAR */}
      <MarketingNavbar />
      <div className="login-shell">
        <div className="login-frame" role="region" aria-label="Login">
          <div className="login-left" aria-hidden="true">
            <img className="login-doctor" src={heroImg} alt="" />
            <div className="login-deco-plus" > <img src={plus} alt="" /></div>
            <div className="login-deco-stetho" > <img src={stethoscope} alt="" /></div>
          </div>

          <div className="login-right">
            <header className="login-header">
              <h1 className="login-title">Welcome to Doclock</h1>
              <p className="login-subtitle">Book your appointment effortlessly in seconds.</p>
            </header>

            <form
              className="login-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setLoading(true);
                try {
                  const user = await login(email, password);
                  const role = user?.role;
                  navigate(role === 'doctor' || role === 'admin' ? '/admin' : '/home');
                } catch (err) {
                  setError(err?.response?.data?.message || err?.message || 'Login failed');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label className="login-label">
                <span>Email</span>
                <input
                  className="login-input"
                  type="email"
                  name="email"
                  inputMode="email"
                  placeholder="Enter Email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="login-label">
                <span>Password</span>
                <div className="login-passwordRow">
                  <input
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
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

              <div className="login-metaRow">
                <a className="login-forgot" href="#" onClick={(e) => e.preventDefault()}>
                  FORGOT PASSWORD ?
                </a>
              </div>

              {error ? <div className="login-error" role="alert">{error}</div> : null}

              <button className="login-primary" type="submit">
                {loading ? 'LOGGING IN…' : 'LOGIN'}
              </button>

              <div className="login-divider">
                <span>or sign in</span>
              </div>

              <div className="login-socialRow">
                <button className="login-socialBtn" type="button" aria-label="Continue with Apple">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M16.7 13.3c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.5.8-3.2.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.9-3.4 2.1-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2 2.6 2 .9 0 1.3-.6 2.4-.6 1.2 0 1.5.6 2.5.6 1.1 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-1.5-.6-1.5-3.1Z"
                      fill="currentColor"
                    />
                    <path d="M14.8 5.9c.6-.8 1-1.8.9-2.9-1 .1-2 .7-2.6 1.5-.6.7-1.1 1.8-.9 2.8 1 .1 2-.6 2.6-1.4Z" fill="currentColor" />
                  </svg>
                </button>
                <button className="login-socialBtn" type="button" aria-label="Continue with Google">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M21.6 12.3c0-.7-.1-1.2-.2-1.8H12v3.3h5.3c-.1.9-.8 2.2-2.3 3.1v2.2h3.2c1.9-1.7 3-4.2 3-6.8Z"
                      fill="#4285F4"
                    />
                    <path d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.2c-.9.6-2 1.1-3.4 1.1-2.6 0-4.7-1.7-5.5-4H3v2.3C4.6 19.9 8 22 12 22Z" fill="#34A853" />
                    <path d="M6.5 13.4c-.2-.6-.4-1.3-.4-2s.1-1.4.3-2V7.1H3C2.4 8.3 2 9.7 2 11.4c0 1.6.4 3.1 1 4.3l3.5-2.3Z" fill="#FBBC05" />
                    <path d="M12 5.5c1.5 0 2.6.6 3.2 1.1l2.4-2.3C17 2.9 14.7 2 12 2 8 2 4.6 4.1 3 7.1l3.5 2.3C7.3 7.2 9.4 5.5 12 5.5Z" fill="#EA4335" />
                  </svg>
                </button>
              </div>

              <p className="login-register">
                Don’t have an account?{' '}
                <Link to="/register">Register</Link>
              </p>
            </form>
          </div>
        </div>

       
      </div>
    </div>
  );
}

