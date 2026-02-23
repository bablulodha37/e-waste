import React, { useEffect, useState } from "react";
import "../css/AboutUs.css";

export default function AboutUs() {
  const [visibleStats, setVisibleStats] = useState(Array(4).fill(false));
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleStats([true, false, false, false]);
    }, 300);
    
    const intervals = [
      setTimeout(() => setVisibleStats([true, true, false, false]), 600),
      setTimeout(() => setVisibleStats([true, true, true, false]), 900),
      setTimeout(() => setVisibleStats([true, true, true, true]), 1200)
    ];
    
    return () => {
      clearTimeout(timer);
      intervals.forEach(clearTimeout);
    };
  }, []);

  const stats = [
    { icon: "👥", value: "10,000+", label: "Active EcoSaathi Users", color: "#0b8457" },
    { icon: "🚛", value: "500+", label: "Pickup Partners Nationwide", color: "#0a9989" },
    { icon: "🏢", value: "50+", label: "Organizations Collaborating", color: "#2e8bc0" },
    { icon: "🌿", value: "100+", label: "Communities Impacted", color: "#27ae60" }
  ];

  const values = [
    { 
      title: "Transparency", 
      desc: "We believe in clarity, honesty, and open collaboration.",
      icon: "🔍",
      color: "#0b8457"
    },
    { 
      title: "Impact", 
      desc: "We focus on real, measurable change for people and the planet.",
      icon: "📈",
      color: "#0a9989"
    },
    { 
      title: "Community", 
      desc: "Our strength lies in unity — people working towards one goal.",
      icon: "🤝",
      color: "#2e8bc0"
    },
    { 
      title: "Sustainability", 
      desc: "We act responsibly for a future where nothing goes to waste.",
      icon: "♻️",
      color: "#27ae60"
    }
  ];

  return (
    <div className="about-modern">
      <header className="about-header">
        <div className="header-content">
          <div className="accent-line"></div>
          <h1 className="about-heading">
            <span className="heading-gradient">About EcoSaathi</span>
          </h1>
          <p className="about-subtitle">
            Building a cleaner, smarter, and greener planet — together.
          </p>
          <div className="animated-leaf">🌿</div>
        </div>
      </header>

      <section className="about-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Transforming Waste into Worth</h2>
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
          </div>
          <div className="hero-visual">
            <div className="earth-visual">🌍</div>
            <div className="floating-icons">
              <span className="icon-leaf">🌿</span>
              <span className="icon-recycle">♻️</span>
              <span className="icon-hand">🤝</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="mv-card mission">
          <div className="mv-header">
            <div className="mv-icon">🌍</div>
            <h2>Our Mission</h2>
          </div>
          <div className="mv-content">
            <p>
              To empower every home and organization to manage their waste
              responsibly. EcoSaathi provides awareness, tools, and eco-friendly
              services that make waste management simple and impactful — one step
              at a time.
            </p>
            <div className="highlight-strip">
              <span className="highlight">Simple</span>
              <span className="highlight">Impactful</span>
              <span className="highlight">Accessible</span>
            </div>
          </div>
        </div>

        <div className="mv-card vision">
          <div className="mv-header">
            <div className="mv-icon">🌱</div>
            <h2>Our Vision</h2>
          </div>
          <div className="mv-content">
            <p>
              To build a zero-waste ecosystem powered by technology and
              collaboration. We dream of a future where every citizen participates
              in protecting the planet through sustainable actions.
            </p>
            <div className="impact-highlight">
              <div className="impact-item">
                <div className="impact-value">10,000+</div>
                <div className="impact-label">Active Users</div>
              </div>
              <div className="impact-item">
                <div className="impact-value">500+</div>
                <div className="impact-label">Pickup Partners</div>
              </div>
              <div className="impact-item">
                <div className="impact-value">50+</div>
                <div className="impact-label">Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h2 className="section-title">Our Impact in Numbers</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`stat-item ${visibleStats[index] ? 'visible' : ''}`}
              style={{ '--stat-color': stat.color }}
            >
              <div className="stat-glow"></div>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
              <div className="stat-wave"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="values-section">
        <div className="section-header">
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">The principles that guide our journey</p>
        </div>
        <div className="values-grid">
          {values.map((value, index) => (
            <div 
              key={index}
              className="value-card"
              style={{ '--value-color': value.color }}
            >
              <div className="value-icon">{value.icon}</div>
              <div className="value-content">
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
              <div className="value-ribbon"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Join Our Green Revolution</h2>
          <p>Be part of the movement towards a sustainable future</p>
          <button className="cta-button">Become an EcoSaathi</button>
        </div>
        <div className="cta-decoration">
          <span className="decoration-leaf">🌿</span>
          <span className="decoration-earth">🌍</span>
        </div>
      </section>
    </div>
  );
}