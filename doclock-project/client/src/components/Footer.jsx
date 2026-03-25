import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Doc<span>Lock</span></Link>
            <p className="footer-tagline">
              Your trusted platform for seamless healthcare appointment management.
              Connecting patients with top specialists since 2024.
            </p>
            <div className="footer-social">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(s => (
                <a key={s} href="#" className="social-icon" aria-label={s}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Services</h4>
            <ul className="footer-links">
              <li><Link to="/book">Book Appointment</Link></li>
              <li><Link to="/book">Find Specialists</Link></li>
              <li><a href="#">Teleconsultation</a></li>
              <li><a href="#">Health Records</a></li>
              <li><a href="#">Lab Results</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Doctors</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-icon">📍</span>
                Iznart Street, Iloilo City, Philippines
              </li>
              <li>
                <span className="contact-icon">📞</span>
                +63 33 337 0000
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                hello@doclock.ph
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                Mon–Fri, 8:00 AM – 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} DocLock. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}