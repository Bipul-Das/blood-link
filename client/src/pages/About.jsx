import React from "react";
import { Link } from "react-router-dom";
import "../styles/about.css";

const About = () => {
  // --- TEAM DATA ---
  const founders = [
    {
      id: 1,
      name: "Bipul Das",
      role: "Founder & Lead Developer",
      bio: "A passionate technologist dedicated to solving the critical logistics gap in emergency healthcare. Built BloodLink to ensure no life is lost due to a lack of connection.",
      // Using a random person image for placeholder
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    // You can add more team members here
  ];

  return (
    <div className="about-container">
      {/* 1. HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="subtitle">OUR STORY</span>
          <h1>
            Rewriting the Future of <br /> Emergency Response
          </h1>
          <p>
            We are building the digital infrastructure that powers the world's
            most critical supply chain: <strong>Life itself.</strong>
          </p>
        </div>
      </section>

      {/* 2. THE PROBLEM & SOLUTION */}
      <section className="about-narrative">
        <div className="narrative-grid">
          <div className="narrative-text">
            <h2>The Gap We Bridge</h2>
            <p>
              Every two seconds, someone needs blood. Yet, the systems
              connecting willing donors to hospitals are often fragmented,
              relying on manual calls and outdated databases. This inefficiency
              isn't just an inconvenience; it costs lives.
            </p>
            <p>
              <strong>BloodLink</strong> was born from a simple yet powerful
              idea: What if technology could remove the friction? We utilize
              real-time geolocation, automated inventory balancing, and instant
              notifications to ensure that when a request is made, the network
              responds immediately.
            </p>
          </div>
          <div className="narrative-stat-box">
            <h3>Zero</h3>
            <p>
              The amount of time that should be wasted when a life is on the
              line.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="values-section">
        <div className="section-header">
          <h2>Our Core Principles</h2>
          <p>The code of ethics that drives our technology.</p>
        </div>
        <div className="values-grid">
          <div className="value-card">
            <div className="icon">⚡</div>
            <h3>Velocity</h3>
            <p>
              In emergencies, speed is survival. Our architecture is optimized
              for millisecond-latency matches.
            </p>
          </div>
          <div className="value-card">
            <div className="icon">🛡️</div>
            <h3>Integrity</h3>
            <p>
              We handle sensitive medical data with enterprise-grade encryption
              and strict privacy standards.
            </p>
          </div>
          <div className="value-card">
            <div className="icon">🤝</div>
            <h3>Community</h3>
            <p>
              We are more than a platform; we are a movement of everyday heroes
              willing to step up.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOUNDER / TEAM SECTION */}
      <section className="team-section">
        <h2>Meet the Minds Behind BloodLink</h2>
        <p className="team-intro">
          Driven by engineering excellence and human empathy.
        </p>

        <div className="team-grid">
          {founders.map((member) => (
            <div key={member.id} className="team-card">
              {/* Circular Image Wrapper */}
              <div className="image-wrapper">
                <img src={member.image} alt={member.name} />
              </div>

              <div className="team-info">
                <h3>{member.name}</h3>
                <span className="role">{member.role}</span>
                <p>{member.bio}</p>

                {/* Professional Social Links with Icons */}
                <div className="connect-block">
                  <span className="connect-label">Connect via</span>
                  <div className="social-icons-row">
                    {/* LinkedIn */}
                    <a href="#" className="social-icon" aria-label="LinkedIn">
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a href="#" className="social-icon" aria-label="Facebook">
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>

                    {/* Twitter / X */}
                    <a href="#" className="social-icon" aria-label="Twitter">
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a href="#" className="social-icon" aria-label="Instagram">
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TRUST & SECURITY */}
      <section className="security-section">
        <div className="security-content">
          <h2>Uncompromising Security</h2>
          <p>
            Trust is the currency of healthcare. BloodLink is built with a{" "}
            <strong>Privacy-First</strong> architecture. We ensure that donor
            anonymity is preserved until a match is confirmed, and hospital
            inventory data is encrypted at rest and in transit.
          </p>
        </div>
      </section>

      {/* 6. FOOTER CTA */}
      <section className="about-cta">
        <h2>Be Part of the Solution</h2>
        <p>
          Whether you write code, donate blood, or manage a hospital—there is a
          place for you here.
        </p>
        <div className="cta-buttons">
          <Link to="/auth" className="btn-primary">
            Join the Network
          </Link>
          <Link to="/contribute" className="btn-outline">
            Support Our Mission
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
