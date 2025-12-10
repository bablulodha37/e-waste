import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  /* -------------------------------------------------- */
  /* 1. TOP BANNER TYPING ANIMATION (H1) */
  /* -------------------------------------------------- */
  const bannerTexts = [
    " Let's build a cleaner, greener planet together 🌍",
    " Recycle today for a better tomorrow ♻️",
    " Every small step counts toward sustainability 🌱",
  ];
  const [bannerTextIndex, setBannerTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    setDisplayText("");
    let i = 0;
    const currentText = bannerTexts[bannerTextIndex];
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setDisplayText((prev) => prev + currentText.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        setTimeout(() => {
          setBannerTextIndex((prev) => (prev + 1) % bannerTexts.length);
        }, 3000);
      }
    }, 80);

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
        }, 3000);
      }
    }, 80);

    setCtaDisplayText(currentText.charAt(0));

    return () => clearInterval(interval);
  }, [ctaTextIndex]);

  /* -------------------------------------------------- */
  /* 3. FEEDBACK CAROUSEL */
  /* -------------------------------------------------- */
  const feedbackData = [
    {
      id: 1,
      text: "Super smooth pickup and very professional team! They even sanitized everything.",
      author: "Sanjana Kumari",
      role: "Environmental Activist",
      rating: 5,
      avatarColor: "#4f46e5"
    },
    {
      id: 2,
      text: "Got instant payment for my old laptop. The process was transparent and quick!",
      author: "Bablu lodha",
      role: "Tech Professional",
      rating: 5,
      avatarColor: "#10b981"
    },
    {
      id: 3,
      text: "EcoSaathi is revolutionizing e-waste management in India. Highly recommended!",
      author: "Aditi Rao",
      role: "Sustainability Consultant",
      rating: 5,
      avatarColor: "#f59e0b"
    },
    {
      id: 4,
      text: "Their data destruction certification gave me peace of mind. Excellent service!",
      author: "Abhishek kumar",
      role: "Corporate Client",
      rating: 4,
      avatarColor: "#ef4444"
    }
  ];

  const [currentFeedback, setCurrentFeedback] = useState(0);

  const nextFeedback = () => {
    setCurrentFeedback((prev) => (prev + 1) % feedbackData.length);
  };

  const prevFeedback = () => {
    setCurrentFeedback((prev) => (prev - 1 + feedbackData.length) % feedbackData.length);
  };

  useEffect(() => {
    const interval = setInterval(nextFeedback, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------- */
  /* 4. COUNTER ANIMATIONS */
  /* -------------------------------------------------- */
  const [animatedValues, setAnimatedValues] = useState({
    households: 0,
    ewaste: 0,
    value: 0,
    tons: 0,
    items: 0,
    co2: 0
  });

  const impactSectionRef = useRef(null);
  const statsSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;

            const targetValues = {
              households: 50000,
              ewaste: 1200,
              value: 250,
              tons: 1000,
              items: 1000000,
              co2: 5000
            };

            let step = 0;
            const timer = setInterval(() => {
              step++;
              const progress = step / steps;
              const easeOut = 1 - Math.pow(1 - progress, 3);

              setAnimatedValues({
                households: Math.floor(targetValues.households * easeOut),
                ewaste: Math.floor(targetValues.ewaste * easeOut),
                value: Math.floor(targetValues.value * easeOut),
                tons: Math.floor(targetValues.tons * easeOut),
                items: Math.floor(targetValues.items * easeOut),
                co2: Math.floor(targetValues.co2 * easeOut)
              });

              if (step >= steps) clearInterval(timer);
            }, interval);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (impactSectionRef.current) {
      observer.observe(impactSectionRef.current);
    }
    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------- */
  /* 5. SCROLL ANIMATION FOR CARDS */
  /* -------------------------------------------------- */
  const [visibleCards, setVisibleCards] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all cards
    document.querySelectorAll('.animate-on-scroll').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container">

      {/* -------------------------------------------------- */}
      {/* HERO BANNER - Modern Glassmorphism Design */}
      {/* -------------------------------------------------- */}
      <div className="hero-banner-modern">
        {/* Animated Background Gradient */}
        <div className="hero-gradient"></div>
        
        {/* Logo with Animation */}
        <div className="branding-logo-modern animate-fade-in">
          <div className="logo-icon-modern">
            <span className="recycle-icon">♻️</span>
          </div>
          <div className="logo-text-modern">
            <span className="main-text-modern">EcoSaathi</span>
            <span className="domain-text-modern">.com</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content-modern">
          {/* Typing Text with Cursor */}
          <div className="typing-container">
            <h1 className="hero-title-modern">
              {displayText}
              <span className={`typing-cursor ${isTyping ? 'blinking' : ''}`}>|</span>
            </h1>
          </div>

          {/* Glassmorphism Card */}
          <div className="glass-card-modern slide-up">
            <p className="glass-subtitle">
              Join EcoSaathi in responsible e-waste recycling with secure data destruction and planet-friendly processing.
            </p>

            <div className="glass-buttons-modern">
              <Link to="/register" className="glass-btn-primary">
                Get Started <span className="btn-icon">→</span>
              </Link>
              <Link to="/about" className="glass-btn-secondary">
                Learn More
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="stats-grid-modern" ref={statsSectionRef}>
              <div className="stat-item-modern">
                <div className="stat-value">{animatedValues.tons}+</div>
                <div className="stat-label">Tons Recycled</div>
              </div>
              <div className="stat-item-modern">
                <div className="stat-value">{animatedValues.items.toLocaleString()}+</div>
                <div className="stat-label">Items Processed</div>
              </div>
              <div className="stat-item-modern">
                <div className="stat-value">{animatedValues.co2}+</div>
                <div className="stat-label">CO₂ Saved (tons)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* IMPACT SECTION - Modern Cards with Hover Effects */}
      {/* -------------------------------------------------- */}
      <section className="impact-section-modern" ref={impactSectionRef}>
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            Impact <span className="gradient-text">We're Creating</span> Together
          </h2>
          <p className="section-subtitle-modern">
            Every pickup with EcoSaathi helps recover valuable materials and keeps harmful toxins away from our soil and water.
          </p>
        </div>

        <div className="impact-grid-modern">
          {[
            { 
              value: animatedValues.households.toLocaleString(), 
              label: "Households Served",
              icon: "♻️",
              color: "var(--primary)" 
            },
            { 
              value: `${animatedValues.ewaste}K kg`, 
              label: "E-Waste Recycled",
              icon: "🌱",
              color: "var(--success)" 
            },
            { 
              value: `₹${animatedValues.value}L+`, 
              label: "Value Distributed",
              icon: "💰",
              color: "var(--warning)" 
            },
            { 
              value: "100%", 
              label: "Secure Data Destruction",
              icon: "🔒",
              color: "var(--danger)" 
            }
          ].map((item, index) => (
            <div 
              key={index}
              id={`impact-card-${index}`}
              className={`impact-card-modern animate-on-scroll ${visibleCards[`impact-card-${index}`] ? 'visible' : ''}`}
            >
              <div className="impact-icon" style={{ backgroundColor: `${item.color}15` }}>
                <span style={{ color: item.color, fontSize: "2rem" }}>{item.icon}</span>
              </div>
              <h3 className="impact-value">{item.value}</h3>
              <p className="impact-label">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* WHAT WE COLLECT SECTION - Modern Grid */}
      {/* -------------------------------------------------- */}
      <section className="collect-section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            What <span className="gradient-text">We Collect</span>
          </h2>
          <p className="section-subtitle-modern">
            From tiny batteries to bulky appliances, we handle and recycle almost every type of electronic device with care.
          </p>
        </div>

        <div className="collect-grid-modern">
          {[
            {
              icon: "💻",
              title: "Laptops & PCs",
              description: "Recovering metals, plastics and reusable components through safe dismantling.",
              color: "#6366f1"
            },
            {
              icon: "📱",
              title: "Mobile Phones",
              description: "Extracting precious metals from smartphones and tablets with zero waste policy.",
              color: "#10b981"
            },
            {
              icon: "🧊",
              title: "Home Appliances",
              description: "Safe processing of appliances to prevent harmful gas and oil leaks.",
              color: "#f59e0b"
            },
            {
              icon: "🔋",
              title: "Batteries & Accessories",
              description: "Handling under strict safety norms to prevent toxic material leakage.",
              color: "#ef4444"
            }
          ].map((item, index) => (
            <div 
              key={index}
              id={`collect-card-${index}`}
              className={`collect-card-modern animate-on-scroll ${visibleCards[`collect-card-${index}`] ? 'visible' : ''}`}
            >
              <div className="collect-icon-modern" style={{ backgroundColor: `${item.color}15` }}>
                <span style={{ fontSize: "2.5rem" }}>{item.icon}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 4-STEP PROCESS - Timeline Style */}
      {/* -------------------------------------------------- */}
      <section className="process-section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            Simple <span className="gradient-text">4-Step Process</span>
          </h2>
          <p className="section-subtitle-modern">
            Give your old electronics a responsible new life with EcoSaathi.
          </p>
        </div>

        <div className="process-timeline">
          {[
            {
              step: "01",
              icon: "🚚",
              title: "Book Pickup",
              description: "Choose a convenient time slot via our website or app.",
              color: "#6366f1"
            },
            {
              step: "02",
              icon: "🛡️",
              title: "Doorstep Collection",
              description: "Our partner verifies items and confirms secure pickup.",
              color: "#10b981"
            },
            {
              step: "03",
              icon: "🏭",
              title: "Eco Processing",
              description: "Safe dismantling at our authorized facilities.",
              color: "#f59e0b"
            },
            {
              step: "04",
              icon: "📜",
              title: "Certified Recycling",
              description: "Materials recovered and kept out of landfills.",
              color: "#8b5cf6"
            }
          ].map((item, index) => (
            <div 
              key={index}
              id={`process-step-${index}`}
              className={`process-step animate-on-scroll ${visibleCards[`process-step-${index}`] ? 'visible' : ''}`}
            >
              <div className="step-number">{item.step}</div>
              <div className="step-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <span style={{ fontSize: "2rem" }}>{item.icon}</span>
              </div>
              <div className="step-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* USER FEEDBACK - Carousel Style */}
      {/* -------------------------------------------------- */}
      <section className="feedback-section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <div className="carousel-controls">
            <button onClick={prevFeedback} className="carousel-btn">
              ←
            </button>
            <button onClick={nextFeedback} className="carousel-btn">
              →
            </button>
          </div>
        </div>

        <div className="feedback-carousel">
          {feedbackData.map((feedback, index) => (
            <div 
              key={feedback.id}
              className={`feedback-card-modern ${index === currentFeedback ? 'active' : ''}`}
            >
              <div className="feedback-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < feedback.rating ? 'star-filled' : 'star-empty'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="feedback-text">"{feedback.text}"</p>
              <div className="feedback-author">
                <div 
                  className="author-avatar"
                  style={{ backgroundColor: feedback.avatarColor }}
                >
                  {feedback.author.charAt(0)}
                </div>
                <div>
                  <h4>{feedback.author}</h4>
                  <p>{feedback.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-dots">
          {feedbackData.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentFeedback ? 'active' : ''}`}
              onClick={() => setCurrentFeedback(index)}
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* FINAL CTA - Gradient Background */}
      {/* -------------------------------------------------- */}
      <section className="cta-section-modern">
        <div className="cta-gradient"></div>
        <div className="cta-content-modern">
          <div className="typing-container">
            <h2 className="cta-title-modern">
              {ctaDisplayText}
              <span className="typing-cursor">|</span>
            </h2>
          </div>
          
          <p className="cta-subtitle">
            Submit your first recycling request and help make our planet greener.
          </p>
          
          <div>
            <Link to="/register" className="cta-button-modern">
              Start Recycling Now <span className="btn-icon">→</span>
            </Link>
          </div>
          
          <div className="cta-stats">
            <div className="cta-stat">
              <div className="cta-stat-number">24/7</div>
              <div className="cta-stat-label">Support</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-number">100%</div>
              <div className="cta-stat-label">Secure</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-number">Free</div>
              <div className="cta-stat-label">Pickup</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}