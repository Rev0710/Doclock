import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const NavIcon = ({ children }) => (
  <span className="home-navIcon" aria-hidden="true">
    {children}
  </span>
);

/**
 * @param {'overview' | 'health' | 'appointments' | 'available'} active
 */
export default function DashboardNav({ active = 'overview' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <>
      <div className="home-sidebarLogo">Doclock</div>
      <nav className="home-nav">
        <button
          type="button"
          className={`home-navItem${active === 'overview' ? ' active' : ''}`}
          onClick={() => navigate('/home')}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <path
                d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </NavIcon>
          Overview
        </button>
        <button
          type="button"
          className={`home-navItem${active === 'health' ? ' active' : ''}`}
          onClick={() => navigate('/health-record')}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <path
                d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5l1.3 1.3L12 21l7.5-7.6 1.3-1.3a5.3 5.3 0 0 0 0-7.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </NavIcon>
          Health Record
        </button>
        <button
          type="button"
          className={`home-navItem${active === 'appointments' ? ' active' : ''}`}
          onClick={() => navigate('/appointments')}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </NavIcon>
          Appointments
        </button>
        <button type="button" className="home-navItem">
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <path
                d="M6.6 2.9 9 5.3c.8.8.8 2 0 2.8L7.6 9.5c1.2 2.3 3.1 4.2 5.4 5.4l1.4-1.4c.8-.8 2-.8 2.8 0l2.4 2.4c.9.9.9 2.3 0 3.2l-1.6 1.6c-.7.7-1.7 1-2.7.9-3.5-.5-6.8-2.4-9.4-5.1C3.4 13.9 1.5 10.6 1 7.1c-.1-1 .2-2 .9-2.7L3.4 2.9c.9-.9 2.3-.9 3.2 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </NavIcon>
          Contacts
        </button>
        <button
          type="button"
          className={`home-navItem${active === 'available' ? ' active' : ''}`}
          onClick={() => navigate('/available')}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <path d="M20 21a8 8 0 1 0-16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </NavIcon>
          Available Doctors
        </button>
        <button
          type="button"
          className="home-navItem home-navItemLogout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <NavIcon>
            <svg viewBox="0 0 24 24">
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </NavIcon>
          Log out
        </button>
      </nav>
    </>
  );
}
