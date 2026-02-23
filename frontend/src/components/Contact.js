import React, { useState } from "react";
import "../css/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after submission
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      content: "support@ecosaathi.com",
      link: "mailto:support@ecosaathi.com",
      color: "#0b8457"
    },
    {
      icon: "📞",
      title: "Phone",
      content: "+91 62616 10574",
      link: "tel:+916261610574",
      color: "#0a9989"
    },
    {
      icon: "🏢",
      title: "Office",
      content: "EcoSaathi HQ, Green Street, Bhopal, India",
      link: "https://maps.google.com",
      color: "#2e8bc0"
    }
  ];

  return (
    <div className="contact-modern">
      <div className="contact-background">
        <div className="floating-element leaf1">🌿</div>
        <div className="floating-element leaf2">🌱</div>
        <div className="floating-element recycle">♻️</div>
      </div>
      
      <header className="contact-header">
        <div className="header-decoration">
          <div className="accent-dot"></div>
          <div className="accent-line"></div>
        </div>
        <h1 className="contact-title">
          <span className="title-gradient">Get in Touch</span>
        </h1>
        <p className="contact-subtitle">
          Have questions or ideas? Let's work together for a cleaner tomorrow.
        </p>
        <div className="header-illustration">💌</div>
      </header>

      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <a 
              href={info.link} 
              key={index}
              className="info-card"
              style={{ '--card-color': info.color }}
              target={info.link.includes('http') ? '_blank' : '_self'}
              rel={info.link.includes('http') ? 'noopener noreferrer' : ''}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="icon-wrapper">
                  <div className="icon-backdrop"></div>
                  <span className="icon">{info.icon}</span>
                </div>
                <div className="info-text">
                  <h3>{info.title}</h3>
                  <p>{info.content}</p>
                </div>
              </div>
              <div className="card-hover-indicator">
                <span className="arrow">→</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Send us a Message</h2>
            <p className="form-subtitle">We're here to help and will respond promptly</p>
          </div>
          
          {isSubmitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button 
                className="new-message-btn"
                onClick={() => setIsSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  placeholder="Tell us about your inquiry or idea..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <span className="send-icon">✉️</span>
                    </>
                  )}
                </button>
                
                <div className="response-time">
                  <span className="time-icon">⏱️</span>
                  Average response time: 4 hours
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="contact-footer">
        <div className="footer-content">
          <div className="footer-icon">🌱</div>
          <p>
            We're committed to responding within 24 hours. 
            <span className="highlight"> Thank you for caring about our planet!</span>
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Twitter">
              <span className="social-icon">𝕏</span>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <span className="social-icon">in</span>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <span className="social-icon">📷</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}