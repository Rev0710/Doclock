import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/whitelogo.png'
import { goLandingHome } from '../utils/goLandingHome.js'
import './Footer.css'

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const navigate = useNavigate()
  const location = useLocation()
  const landingTop = (e) => goLandingHome(navigate, location.pathname, e)

  return (
    <footer id="landing-footer" className="doclock-site-footer">
      <div className="doclock-site-footer-inner">
        <div className="doclock-site-footer-grid">
          <div className="doclock-site-footer-brand">
            <a href="/" className="doclock-site-footer-logo-link" onClick={landingTop}>
              <img src={logo} alt="Doclock" className="doclock-site-footer-logo-img" />
            </a>
            <p className="doclock-site-footer-about">
              DocClock is the trusted healthcare group focused on quality care, modern medicine and the well-being of
              each patient we serve.
            </p>
          </div>

          <div className="doclock-site-footer-col">
            <h2 className="doclock-site-footer-heading">Contact Us</h2>
            <ul className="doclock-site-footer-contact">
              <li>
                <span className="doclock-site-footer-icon-wrap" aria-hidden="true">
                  <IconMail />
                </span>
                <a href="mailto:DocClock@gmail.com">DocClock@gmail.com</a>
              </li>
              <li>
                <span className="doclock-site-footer-icon-wrap" aria-hidden="true">
                  <IconPhone />
                </span>
                <a href="tel:+639090542972">+639090542972</a>
              </li>
              <li>
                <span className="doclock-site-footer-icon-wrap" aria-hidden="true">
                  <IconPin />
                </span>
                <span>Local address, Philippines, Lapaz, Iloilo</span>
              </li>
            </ul>
          </div>

          <div className="doclock-site-footer-col">
            <h2 className="doclock-site-footer-heading">Links</h2>
            <ul className="doclock-site-footer-links">
              <li>
                <a href="/" onClick={landingTop}>
                  Home
                </a>
              </li>
              <li>
                <a href="/#landing-about">About us</a>
              </li>
              <li>
                <a href="/#landing-services">Services</a>
              </li>
              <li>
                <a href="/#landing-gallery">Gallery</a>
              </li>
              <li>
                <a href="/#landing-footer">Contact Us</a>
              </li>
            </ul>
          </div>

          <div className="doclock-site-footer-col">
            <h2 className="doclock-site-footer-heading">Get in Touch</h2>
            <div className="doclock-site-footer-social">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="doclock-site-footer-social-btn"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="doclock-site-footer-social-btn"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="doclock-site-footer-bottom">
          <p className="doclock-site-footer-copy">© {year} Doclock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
