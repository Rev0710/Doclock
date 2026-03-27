import { useState } from 'react';
import logo from '../assets/doc2.png';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav>
        <div className="logo">
          <img src={logo} alt="" />
        </div>
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <ul className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
          <li>
            <a href="#" onClick={() => setMenuOpen(false)}>
              Home
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setMenuOpen(false)}>
              Our Blog
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setMenuOpen(false)}>
              Services
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setMenuOpen(false)}>
              Contact Us
            </a>
          </li>
        </ul>
        <Link
          to="/login"
          className="btn-book"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          onClick={() => setMenuOpen(false)}
        >
          Book Now
        </Link>
      </nav>
    </>
  );
}

export default Navbar
