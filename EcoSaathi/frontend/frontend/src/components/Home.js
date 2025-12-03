
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  /* -------------------------------------------------- */
  /* 1. TOP BANNER TYPING ANIMATION (H1) */
  /* -------------------------------------------------- */
  const bannerTexts = [
    "Let's build a cleaner, greener planet together 🌍",
    "Recycle today for a better tomorrow ♻️",
    "Every small step counts toward sustainability 🌱",
  ];
  const [bannerTextIndex, setBannerTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const currentText = bannerTexts[bannerTextIndex];
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setDisplayText((prev) => prev + currentText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBannerTextIndex((prev) => (prev + 1) % bannerTexts.length);
        }, 1000);
      }
    }, 80);

    setDisplayText(currentText.charAt(0));

    return () => clearInterval(interval);
  }, [bannerTextIndex]);

  /* -------------------------------------------------- */
  /* 2. CTA HEADING TYPING ANIMATION (H2) */
  /* -------------------------------------------------- */
  const ctaTexts = ["Start Making a Difference Today!", "Schedule Your E-Waste Pickup Now!"];
  const [ctaTextIndex, setCtaTextIndex] = useState(0);
  const [ctaDisplayText, setCtaDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const currentText = ctaTexts[ctaTextIndex];
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setCtaDisplayText((prev) => prev + currentText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCtaTextIndex((prev) => (prev + 1) % ctaTexts.length);
        }, 2000);
      }
    }, 80);

    setCtaDisplayText(currentText.charAt(0));

    return () => clearInterval(interval);
  }, [ctaTextIndex]);

  return (
    <div className="home-container">

      {/* -------------------------------------------------- */}
      {/* HERO BANNER */}
      {/* -------------------------------------------------- */}
      <div className="hero-banner">
        <img src="/homeimage.png" alt="EcoSaathi nature banner" className="hero-image" />

        {/* Logo */}
        <div className="branding-logo">
          <span className="logo-icon">♻️</span>
          <div className="logo-text">
            <span className="main-text">EcoSaathi</span>
            <span className="domain-text">.com</span>
          </div>
        </div>

        <div className="hero-overlay">
  <div className="hero-content">

    {/* pehle wala typing dialogue – same hi hai */}
    <h1 className="hero-dialogue">{displayText}</h1>

    {/* NEW glass card – line + 2 buttons + stats */}
    <div className="hero-glass-box">
      <p className="hero-subtitle">
        Join EcoSaathi in responsible e-waste recycling with secure data destruction and planet-friendly processing.
      </p>

      <div className="hero-glass-buttons">
        <Link to="/register" className="hero-glass-btn primary">
          Get Started
        </Link>
        <Link to="/contact" className="hero-glass-btn secondary">
          Support
        </Link>
      </div>

      <div className="hero-glass-stats">
        <div className="glass-stat">
          <h3>1000+ tons</h3>
          <p>Recycled</p>
        </div>
        <div className="glass-stat">
          <h3>1M+ items</h3>
          <p>Processed</p>
        </div>
        <div className="glass-stat">
          <h3>5000+ tons</h3>
          <p>CO₂ Saved</p>
        </div>
      </div>
    </div>

  </div>
</div>

      </div>


      {/* -------------------------------------------------- */}
      {/* IMPACT WE'RE CREATING TOGETHER */}
      {/* -------------------------------------------------- */}
      <section className="impact-section">
        <h2>Impact We're Creating Together</h2>
        <p>Every pickup with EcoSaathi helps recover valuable materials and keeps harmful toxins away from our soil and water.</p>

        <div className="impact-grid">
          <div className="impact-card">
            <h3>50,000+</h3>
            <p>Households Served</p>
          </div>

          <div className="impact-card">
            <h3>1.2M kg</h3>
            <p>E-Waste Recycled</p>
          </div>

          <div className="impact-card">
            <h3>₹2.5 Cr+</h3>
            <p>Value Distributed</p>
          </div>

          <div className="impact-card">
            <h3>100%</h3>
            <p>Secure Data Destruction</p>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------- */}
      {/* WHAT WE COLLECT SECTION */}
      {/* -------------------------------------------------- */}
      <section className="collect-section">
        <h2>What We Collect</h2>
        <p>From tiny batteries to bulky appliances, our team is trained to handle and recycle almost every type of electronic device.</p>

        <div className="collect-grid">
          <div className="collect-card">
            <div className="icon">💻</div>
            <h3>Laptops & PCs</h3>
            <p>Old laptops, desktops, monitors and accessories are dismantled to recover metals, plastics and reusable components.</p>
          </div>

          <div className="collect-card">
            <div className="icon">📱</div>
            <h3>Mobile Phones</h3>
            <p>Smartphones and tablets contain precious metals. We ensure they are safely extracted and recycled.</p>
          </div>

          <div className="collect-card">
            <div className="icon">🧊</div>
            <h3>Home Appliances</h3>
            <p>From mixers to refrigerators — all processed safely so gases and oils don't harm the environment.</p>
          </div>

          <div className="collect-card">
            <div className="icon">🔋</div>
            <h3>Batteries & Accessories</h3>
            <p>Batteries, chargers, and cables handled under strict safety norms to prevent toxic leaks.</p>
          </div>
        </div>
        </section>


      {/* -------------------------------------------------- */}
{/* 4-STEP PROCESS (Now same style as What We Collect) */}
{/* -------------------------------------------------- */}

<section className="collect-section">
  <h2>How We Work – Simple 4-Step Process</h2>
  <p className="section-subtitle">
    Give your old electronics a responsible new life with EcoSaathi.
  </p>

  <div className="collect-grid">

    <div className="collect-card">
      <div className="icon">
        <img src="/step1.webp" alt="Book Pickup" style={{ width: "80px", borderRadius: "10px" }} />
      </div>
      <h3>Book Pickup</h3>
      <p>Choose a convenient time slot via our website or app.</p>
    </div>

    <div className="collect-card">
      <div className="icon">
        <img src="/step2.jpg" alt="Doorstep Collection" style={{ width: "80px", borderRadius: "10px" }} />
      </div>
      <h3>Doorstep Collection</h3>
      <p>Our field partner verifies items and confirms pricing.</p>
    </div>

    <div className="collect-card">
      <div className="icon">
        <img src="/step3.png" alt="Eco Processing" style={{ width: "80px", borderRadius: "10px" }} />
      </div>
      <h3>Eco Processing</h3>
      <p>Items are safely dismantled at our authorised facilities.</p>
    </div>

    <div className="collect-card">
      <div className="icon">
        <img src="/step4.jpeg" alt="Certified Recycling" style={{ width: "80px", borderRadius: "10px" }} />
      </div>
      <h3>Certified Recycling</h3>
      <p>Materials recovered, reused — kept out of landfills.</p>
    </div>

  </div>
</section>



      {/* -------------------------------------------------- */}
      {/* USER FEEDBACK (MODERN STYLE) */}
      {/* -------------------------------------------------- */}
      <section className="feedback-section">
        <h2>What Users Say</h2>
        <div className="feedback-grid">
          <div className="feedback-card">
            <p>“Super smooth pickup and very professional team!”</p>
            <h4>— Priya Sharma</h4>
          </div>

          <div className="feedback-card">
            <p>“Got money for my old laptop instantly. Loved it!”</p>
            <h4>— Manish Verma</h4>
          </div>

          <div className="feedback-card">
            <p>“EcoSaathi is the best e-waste service I’ve used.”</p>
            <h4>— Aditi Rao</h4>
          </div>

          <div className="feedback-card">
            <p>“Very eco-friendly process. Highly recommended.”</p>
            <h4>— Sameer Khan</h4>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------- */}
      {/* CALL TO ACTION */}
      {/* -------------------------------------------------- */}
      <section className="call-to-action">
        <h2>{ctaDisplayText}</h2>
        <p>Submit your first recycling request and help make our planet greener.</p>
        <Link to="/register" className="cta-button secondary">Get Started</Link>
      </section>

    </div>
  );
}
