import React, { useState } from 'react'; // Added useState import
import logo from '../assets/doc2.png';
import heroImg from '../assets/hero_img.png';
import stethoscope from '../assets/stethoscope-icon.png';
import crossIcon from '../assets/cross-png.png';
import aboutImg from '../assets/aboutImg.png';
import MarketingNavbar from '../components/MarketingNavbar.jsx';

const Landing = () => {
  // 1. Move State to the top
  const [activeIndex, setActiveIndex] = useState(1);

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  // 2. Define your data arrays here
  const services = [
    { label: 'Surgical Services' },
    { label: 'Emergency Care' },
    { label: 'Home Health Caring' },
  ];

  const features = [
    {
      label: 'Easy Booking',
      description: 'Schedule appointments instantly, anytime from your device.',
      icon: (
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      )
    },
    {
      label: '24/7 Access',
      description: 'Around-the-clock support and medical assistance whenever you need it most.',
      featured: true,
      icon: (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" /></svg>
      )
    },
    {
      label: 'Near You',
      description: 'Find certified clinics and specialists close to your location.',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
      )
    }
  ];

  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <MarketingNavbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-image">
          
          <img src={heroImg} alt="Doctor" />
        </div>
          <img className="crossIcon" src={crossIcon} alt="" />
        <div className="hero-copy">
          <h1 className="hero-title">
            Fast to <em>book</em>, no more waiting.
          </h1>
          <p>Providing compassionate, world-class healthcare tailored to every patient. Your health, our priority — every step of the way.</p>
          <button className="btn-consult">Book a Consultation</button>
        </div>
        <img className="stethoscope" src={stethoscope} alt="" />
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-text">
          <p className="eyebrow">About Us</p>
          <h2>Leading the Way<br />in Healthcare</h2>
          <p>Our team of dedicated specialists has been serving patients with expertise and compassion since 2020.</p>

          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-num">80%</span>
              <span className="stat-label">Returning Patients</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">10+</span>
              <span className="stat-label">Years of Service</span>
            </div>
             <div className="stat-card">

              <span className="stat-num">24</span>

              <span className="stat-label">Hours Received</span>

            </div>

            <div className="stat-card">

              <span className="stat-num">150+</span>

              <span className="stat-label">Hospital Rooms</span>

            </div>
          </div>
        </div>

        <div className="about-image">
          <img src={aboutImg} alt="Medical team" />
        </div>
      </section>

      {/* SERVICES - Logic cleaned up here */}
      <section className="services">
        <div className="services-block">
          <p className="eyebrow">Our Services</p>
          <h2>Your Complete Medical Guide</h2>
          <p className="desc">Comprehensive healthcare solutions tailored to your needs.</p>

          <div className="cards-row">
            {services.map((service, index) => (
              <div
                key={index}
                className={`svc-card ${activeIndex === index ? 'active' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="dot"></div>
                <span className="card-label">{service.label}</span>
              </div>
            ))}
          </div>

          <div className="view-btn">
            <button className="btn-view">View All Services</button>
          </div>
        </div>

        {/* WHY CHOOSING US */}
        <div className="why-block">
          <div className="why-text">
            <p className="eyebrow">Why Choosing us</p>
            <h2>Reason for choose us for your Medical Consultant</h2>
            <button className="btn-learn">Learn More</button>
          </div>

          <div className="features-panel">
            <div className="features-row">
              {features.map((feature, index) => (
                <div key={index} className={`feat-card ${feature.featured ? 'featured' : ''}`}>
                  <div className="feat-icon-wrap">
                    <div className="feat-icon">{feature.icon}</div>
                  </div>
                  <span className="feat-label">{feature.label}</span>
                  <p className={feature.featured ? "feat-desc" : "feat-desc-hover"}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to take the next step in your health journey?</h2>
        <div className="cta-btns">
          <button className="btn-outline">Learn More</button>
          <button className="btn-consult">Book a Consultation</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">Doclock</div>
        <span>© 2025 Doclock. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Landing;