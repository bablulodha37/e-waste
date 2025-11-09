import React from "react";
import "../css/AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-modern">
      <header className="about-header">
        <h1 className="about-heading">About EcoSaathi</h1>
        <p className="about-subtitle">
          Building a cleaner, smarter, and greener planet — together.
        </p>
      </header>

      <section className="about-intro">
        <p>
          EcoSaathi is a purpose-driven initiative dedicated to transforming how
          communities manage waste. Our platform connects users, pickup partners,
          and administrators to make recycling smarter and sustainability easier.
        </p>
        <p>
          We believe every individual can be an agent of change. Through our
          collective efforts, we strive to make sustainability not just a goal,
          but a lifestyle.
        </p>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2>🌍 Our Mission</h2>
          <p>
            To empower every home and organization to manage their waste
            responsibly. EcoSaathi provides awareness, tools, and eco-friendly
            services that make waste management simple and impactful — one step
            at a time.
          </p>
        </div>

        <div className="about-card">
          <h2>🌱 Our Vision</h2>
          <p>
            To build a zero-waste ecosystem powered by technology and
            collaboration. We dream of a future where every citizen participates
            in protecting the planet through sustainable actions.
          </p>
          <p>
            Today, we proudly serve <strong>10,000+ active users</strong>, work
            alongside <strong>500+ pickup partners</strong>, and collaborate with
            <strong> 50+ organizations</strong> across India. Together, we are
            shaping a cleaner, greener tomorrow.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-item">
          <h3>👥 10,000+</h3>
          <p>Active EcoSaathi Users</p>
        </div>
        <div className="stat-item">
          <h3>🚛 500+</h3>
          <p>Pickup Partners Nationwide</p>
        </div>
        <div className="stat-item">
          <h3>🏢 50+</h3>
          <p>Organizations Collaborating</p>
        </div>
        <div className="stat-item">
          <h3>🌿 100+</h3>
          <p>Communities Impacted</p>
        </div>
      </section>

      <section className="values-modern">
        <h2>💚 Our Core Values</h2>
        <div className="values-grid">
          <div className="value-box">
            <h4>Transparency</h4>
            <p>We believe in clarity, honesty, and open collaboration.</p>
          </div>
          <div className="value-box">
            <h4>Impact</h4>
            <p>We focus on real, measurable change for people and the planet.</p>
          </div>
          <div className="value-box">
            <h4>Community</h4>
            <p>Our strength lies in unity — people working towards one goal.</p>
          </div>
          <div className="value-box">
            <h4>Sustainability</h4>
            <p>We act responsibly for a future where nothing goes to waste.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
