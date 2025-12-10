import React, { useState, useEffect } from "react";
import "../css/Services.css";

export default function Services() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: 1,
      icon: "♻️",
      title: "Smart Waste Collection",
      description: "Schedule eco-friendly pickups directly from your dashboard and let our team handle waste segregation and recycling efficiently.",
      color: "#0b8457"
    },
    {
      id: 2,
      icon: "🚛",
      title: "Doorstep Pickup Scheduling",
      description: "Book pickups in seconds — track, reschedule, and view your waste history all from one place.",
      color: "#0a9989"
    },
    {
      id: 3,
      icon: "🏅",
      title: "Digital Eco Certificates",
      description: "Receive digital recognition for every contribution you make toward environmental conservation.",
      color: "#2e8bc0"
    },
    {
      id: 4,
      icon: "📊",
      title: "Personal Impact Reports",
      description: "Track your environmental footprint and see how your actions are helping the planet in real time.",
      color: "#0b8457"
    },
    {
      id: 5,
      icon: "💬",
      title: "Community Awareness",
      description: "Join workshops and awareness drives to educate others about waste reduction and sustainability.",
      color: "#0a9989"
    },
    {
      id: 6,
      icon: "🌿",
      title: "Partnership Programs",
      description: "Collaborate with EcoSaathi to expand green initiatives within your organization or community.",
      color: "#2e8bc0"
    }
  ];

  return (
    <div className="services-modern">
      <header className="services-header">
        <div className="title-wrapper">
          <div className="accent-line"></div>
          <h1 className="services-title">
            <span className="title-gradient">Our Services</span>
          </h1>
          <p className="services-subtitle">
            Making sustainability effortless, accessible, and impactful.
          </p>
        </div>
        
        <div className="stats-container">
          <div className="stat">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat">
            <div className="stat-number">500+</div>
            <div className="stat-label">Pickups Monthly</div>
          </div>
          <div className="stat">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </header>

      <section className="services-grid">
        {services.map((service, index) => (
          <div 
            key={service.id}
            className={`service-card ${hoveredCard === service.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              '--card-color': service.color,
              '--delay': `${index * 0.1}s`
            }}
          >
            <div className="card-glow"></div>
            <div className="icon-container">
              <div className="icon-wrapper">
                <div className="icon-backdrop"></div>
                <div className="icon">{service.icon}</div>
              </div>
            </div>
            
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            
            <div className="card-footer">
              <button className="learn-more-btn">
                Learn More
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="cta-section">
        <h3>Ready to make a difference?</h3>
        <p>Join thousands of eco-conscious individuals and businesses</p>
        <button className="cta-button">
          Get Started Today
        </button>
      </div>
    </div>
  );
}