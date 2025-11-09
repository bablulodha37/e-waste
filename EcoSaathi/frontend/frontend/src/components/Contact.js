import React from "react";

import "../css/Contact.css";

export default function Contact() {
  return (
    <div className="contact-modern">
      <header className="contact-header">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">
          Have questions or ideas? Let’s work together for a cleaner tomorrow.
        </p>
      </header>

      <section className="contact-info">
        <div className="info-card">
          <span className="icon">📧</span>
          <h3>Email</h3>
          <p>
            <a href="mailto:support@ecosaathi.com">support@ecosaathi.com</a>
          </p>
        </div>
        <div className="info-card">
          <span className="icon">📞</span>
          <h3>Phone</h3>
          <p>
            <a href="tel:+919876543210">+91 62616 10574</a>
          </p>
        </div>
        <div className="info-card">
          <span className="icon">🏢</span>
          <h3>Office</h3>
          <p>EcoSaathi HQ, Green Street, Bhopal, India</p>
        </div>
      </section>

      <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Send us a Message</h2>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Your Name"
            className="form-input"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="form-input"
            required
          />
        </div>
        <textarea
          className="form-textarea"
          placeholder="Your Message"
          rows="5"
          required
        ></textarea>
        <button type="submit" className="submit-btn">
          Send Message 🌿
        </button>
      </form>

      <footer className="contact-footer">
        <p>🌱 We aim to respond within 24 hours. Thank you for caring!</p>
      </footer>
    </div>
  );
}
