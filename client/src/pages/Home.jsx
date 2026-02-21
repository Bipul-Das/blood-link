import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  // --- STATE: Live System Statistics ---
  const [stats, setStats] = useState({
    donors: 1200,
    units: 850,
    campaigns: 12,
    partners: 45,
    volunteers: 150,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // --- EFFECT: Fetch Live Stats ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/public/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to load live stats, using fallbacks.", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="badge-pill">
            🚀 The #1 Digital Blood Donation Platform
          </span>
          <h1>
            Bridging the Gap Between <br />{" "}
            <span className="highlight-text">Hope & Survival</span>
          </h1>
          <p className="hero-subtext">
            BloodLink utilizes advanced geolocation and real-time inventory
            management to connect patients with donors and hospitals in seconds,
            not hours.
          </p>
          <div className="hero-buttons">
            <Link to="/auth" className="btn-primary">
              Register as Donor <span className="arrow">→</span>
            </Link>
            {/* Replaced Emergency link with Contribute link */}
            <Link to="/contribute" className="btn-secondary">
              Support Our Mission
            </Link>
          </div>
          <div className="trust-indicator">
            <span>Trusted by 50+ Medical Institutes</span>
          </div>
        </div>
        <div className="hero-visual"></div>
      </section>

      {/* 2. LIVE IMPACT TRACKER */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Our Impact in Real-Time</h2>
          <p>Transparency is at our core. Watch our community grow.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.donors.toLocaleString()}+</h3>
            <p>Registered Donors</p>
          </div>
          <div className="stat-card">
            <h3>{stats.units.toLocaleString()}</h3>
            <p>Units Collected</p>
          </div>
          <div className="stat-card highlight">
            <h3>{stats.partners}</h3>
            <p>Partner Hospitals & Banks</p>
          </div>
          <div className="stat-card">
            <h3>{stats.campaigns}</h3>
            <p>Active Campaigns</p>
          </div>
          <div className="stat-card">
            <h3>{stats.volunteers}</h3>
            <p>Volunteers Mobilized</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="process-section">
        <h2>How BloodLink Works</h2>
        <div className="process-grid">
          <div className="process-step">
            <div className="step-icon">🩸</div>
            <h4>1. Register</h4>
            <p>
              Create a profile as a donor, hospital, or volunteer in under 2
              minutes.
            </p>
          </div>
          <div className="process-step">
            <div className="step-icon">🔍</div>
            <h4>2. Connect</h4>
            <p>
              Our algorithm matches urgency with the nearest available verified
              stock or donor.
            </p>
          </div>
          <div className="process-step">
            <div className="step-icon">🚑</div>
            <h4>3. Save Lives</h4>
            <p>
              Coordinate logistics instantly and track the donation until it
              reaches the patient.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PARTNERS SECTION */}
      <section className="partners-section">
        <h3>Trusted by Leading Healthcare Providers</h3>
        <div className="partners-logos">
          <div className="logo-placeholder">City Hospital</div>
          <div className="logo-placeholder">Red Cross (Partner)</div>
          <div className="logo-placeholder">MediCare Group</div>
          <div className="logo-placeholder">Global Health</div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to be a Hero?</h2>
          <p>
            You don't need a cape to save the world. You just need to show up.
          </p>
          <Link to="/contribute" className="btn-white">
            Join the Movement
          </Link>
        </div>
      </section>

      {/* 6. PROFESSIONAL FOOTER */}
      <footer className="footer-preview">
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-column brand-col">
            <h4>BloodLink</h4>
            <p>
              Innovating the supply chain of life. We are dedicated to ensuring
              blood is available to everyone, everywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h5>Company</h5>
            <Link to="/about">About Us</Link>
            <Link to="/contribute">Volunteering</Link>
            <Link to="/contribute">Donate Money</Link>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h5>Contact Us</h5>
            <div className="contact-row">
              <span>📧</span>
              <a href="mailto:hello@bloodlink.com">hello@bloodlink.com</a>
            </div>
            <div className="contact-row">
              <span>📞</span>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className="contact-row">
              {/* WhatsApp Icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: "#25D366" }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <a href="https://wa.me/1234567890">Chat on WhatsApp</a>
            </div>
          </div>

          {/* Social Media */}
          <div className="footer-column">
            <h5>Follow Us</h5>
            <div className="social-icons">
              {/* LinkedIn */}
              <a href="#" className="social-link">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="social-link">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="social-link">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 BloodLink Systems. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
