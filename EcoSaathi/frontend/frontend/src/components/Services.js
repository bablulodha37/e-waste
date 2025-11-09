import React from "react";
import "../css/Services.css";

export default function Services() {
  return (
    <div className="services-modern">
      <header className="services-header">
        <h1 className="services-title">Our Services</h1>
        <p className="services-subtitle">
          Making sustainability effortless, accessible, and impactful.
        </p>
      </header>

      <section className="services-grid">
        <div className="service-card">
          <div className="icon">♻️</div>
          <h3>Smart Waste Collection</h3>
          <p>
            Schedule eco-friendly pickups directly from your dashboard and let
            our team handle waste segregation and recycling efficiently.
          </p>
        </div>

        <div className="service-card">
          <div className="icon">🚛</div>
          <h3>Doorstep Pickup Scheduling</h3>
          <p>
            Book pickups in seconds — track, reschedule, and view your waste
            history all from one place.
          </p>
        </div>

        <div className="service-card">
          <div className="icon">🏅</div>
          <h3>Digital Eco Certificates</h3>
          <p>
            Receive digital recognition for every contribution you make toward
            environmental conservation.
          </p>
        </div>

        <div className="service-card">
          <div className="icon">📊</div>
          <h3>Personal Impact Reports</h3>
          <p>
            Track your environmental footprint and see how your actions are
            helping the planet in real time.
          </p>
        </div>

        <div className="service-card">
          <div className="icon">💬</div>
          <h3>Community Awareness</h3>
          <p>
            Join workshops and awareness drives to educate others about waste
            reduction and sustainability.
          </p>
        </div>

        <div className="service-card">
          <div className="icon">🌿</div>
          <h3>Partnership Programs</h3>
          <p>
            Collaborate with EcoSaathi to expand green initiatives within your
            organization or community.
          </p>
        </div>
      </section>
    </div>
  );
}
