import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/services.css";
import donorImg from "../assets/donor.png";
import bankImg from "../assets/bank.png";
const Services = () => {
  const footerRef = useRef(null);
  const [highlightContact, setHighlightContact] = useState(false);

  // --- HANDLER: Scroll to Footer & Glow ---
  const handleScrollToContact = (e) => {
    e.preventDefault();
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth" });
      setHighlightContact(true);
      // Remove glow after 2 seconds
      setTimeout(() => setHighlightContact(false), 2000);
    }
  };

  return (
    <div className="services-container">
      {/* 1. HERO SECTION: Value Proposition */}
      <section className="services-hero">
        <div className="services-hero-content">
          <span className="overline">ECOSYSTEM OF CARE</span>
          <h1>
            Advanced Infrastructure for <br /> Critical Healthcare
          </h1>
          <p>
            BloodLink combines real-time data orchestration with hyper-local
            community mobilization to solve the "last mile" problem in blood
            logistics.
          </p>
        </div>
      </section>

      {/* 2. CORE SOLUTIONS GRID */}
      <section className="solutions-section">
        <div className="section-header">
          <h2>Our Core Solutions</h2>
          <p>Engineered for speed, reliability, and scalability.</p>
        </div>

        <div className="solutions-grid">
          {/* Card 1: The Matching Engine */}
          <div className="solution-card">
            <div className="card-icon">⚡</div>
            <h3>Rapid Response Engine</h3>
            <p className="card-desc">
              Our proprietary matchmaking algorithm analyzes blood type
              compatibility, location proximity, and traffic patterns to connect
              patients with the nearest viable donor or blood bank in
              milliseconds.
            </p>
            <ul className="feature-list">
              <li>📍 Geospatial Donor Tracking</li>
              <li>🔔 Instant SMS & Push Notifications</li>
              <li>🚑 Automated Compatibility Checks</li>
            </ul>
          </div>

          {/* Card 2: Inventory Management */}
          <div className="solution-card">
            <div className="card-icon">📊</div>
            <h3>Smart Inventory & FIFO</h3>
            <p className="card-desc">
              We empower hospitals to eliminate wastage. Our system tracks
              shelf-life in real-time, enforcing{" "}
              <strong>First-In-First-Out (FIFO)</strong> logic to ensure the
              oldest viable units are utilized first.
            </p>
            <ul className="feature-list">
              <li>📉 Waste Reduction Analytics</li>
              <li>📅 Automated Expiry Alerts</li>
              <li>🔄 Inter-Hospital Stock Exchange</li>
            </ul>
          </div>

          {/* Card 3: Campaigns */}
          <div className="solution-card">
            <div className="card-icon">📣</div>
            <h3>Community Mobilization</h3>
            <p className="card-desc">
              Turn individual goodwill into collective action. Our campaign
              tools allow organizations to plan, execute, and analyze
              large-scale blood donation drives with ease.
            </p>
            <ul className="feature-list">
              <li>🗓️ Event Scheduling & RSVP</li>
              <li>📈 Live Donation Tracking</li>
              <li>🏅 Digital Volunteer Certificates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. WHO WE SERVE (Segmented Approach) */}
      <section className="segments-section">
        <div className="segment-row">
          <div className="segment-content">
            <h3>For Hospitals & Blood Banks</h3>
            <p>
              Optimize your supply chain. Reduce critical shortages by tapping
              into a verified network of on-call donors and visualizing regional
              stock levels.
            </p>
            {/* UPDATED LINK TO TRIGGER SCROLL */}
            <a
              href="#contact"
              onClick={handleScrollToContact}
              className="text-link"
            >
              Contact Us to Register Organization
            </a>
          </div>
          <div className="segment-image-placeholder">
            {/* 2. USE THE VARIABLE IN BRACES */}
            <img src={bankImg} alt="Donor App Experience" />
          </div>
        </div>

        <div className="segment-row reverse">
          <div className="segment-content">
            <h3>For Individual Donors</h3>
            <p>
              Be a hero on your own schedule. Manage your donation history,
              receive health insights, and get notified only when your specific
              blood type is urgently needed nearby.
            </p>
            <Link to="/auth" className="text-link">
              Become a Donor →
            </Link>
          </div>
          <div className="segment-image-placeholder">
            {/* 2. USE THE VARIABLE IN BRACES */}
            <img src={donorImg} alt="Donor App Experience" />
          </div>
        </div>
      </section>

      {/* 4. TECHNOLOGY STACK HIGHLIGHT */}
      <section className="tech-highlight">
        <div className="tech-content">
          <h2>Powered by Innovation</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>End-to-End Encryption</h4>
              <p>HIPAA-compliant data standards ensuring donor privacy.</p>
            </div>
            <div className="tech-item">
              <h4>Real-Time WebSocket</h4>
              <p>Live updates for emergency requests without page refreshes.</p>
            </div>
            <div className="tech-item">
              <h4>AI-Driven Analytics</h4>
              <p>
                Predictive modeling to forecast shortages before they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="services-cta">
        <h2>Ready to modernize your blood supply chain?</h2>
        <div className="cta-buttons">
          <Link to="/auth" className="btn-primary">
            Join the Network
          </Link>
          <Link to="/contribute" className="btn-secondary">
            Support Our Mission
          </Link>
        </div>
      </section>

      {/* 6. NEW FOOTER SECTION */}
      <footer ref={footerRef} className="services-footer">
        <div className="footer-content">
          {/* Brand Col */}
          <div className="footer-col brand">
            <h3>BloodLink</h3>
            <p>
              Innovating the supply chain of life. We are dedicated to ensuring
              blood is available to everyone, everywhere.
            </p>
          </div>

          {/* Links Col */}
          <div className="footer-col links">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contribute">Volunteering</Link>
            <Link to="/contribute">Donate Money</Link>
          </div>

          {/* Contact Col (GLOW TARGET) */}
          <div
            className={`footer-col contact ${
              highlightContact ? "glow-active" : ""
            }`}
          >
            <h4>Contact Us</h4>
            <div className="contact-item">
              <span>📧</span>
              <a href="mailto:hello@bloodlink.com">hello@bloodlink.com</a>
            </div>
            <div className="contact-item">
              <span>📞</span>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className="contact-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: "#25D366" }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <a href="#">Chat on WhatsApp</a>
            </div>
          </div>

          {/* Social Col */}
          <div className="footer-col social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#">
                <svg
                  fill="currentColor"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#">
                <svg
                  fill="currentColor"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#">
                <svg
                  fill="currentColor"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 BloodLink Systems. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Services;
