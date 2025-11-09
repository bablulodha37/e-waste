import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";


export default function Home() {
  // --- 1. TOP BANNER TYPING ANIMATION LOGIC (H1) ---
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
    
    // Typing effect logic for H1
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setDisplayText((prev) => prev + currentText.charAt(i));
        i++;
      } else {
        // Typing khatam hone ke baad
        clearInterval(interval);
        setTimeout(() => {
          // Agla phrase seedha shuru karo
          setBannerTextIndex((prev) => (prev + 1) % bannerTexts.length);
        }, 1000); // 2 seconds ka pause
      }
    }, 80); 
    
    setDisplayText(currentText.charAt(0)); // Naya phrase shuru karne se pehle
    
    return () => clearInterval(interval);
  }, [bannerTextIndex]);

  // --- 2. CTA HEADING TYPING ANIMATION LOGIC (H2) ---
  const ctaTexts = [
    "Start Making a Difference Today!", 
    "Schedule Your E-Waste Pickup Now!",
  ];
  const [ctaTextIndex, setCtaTextIndex] = useState(0);
  const [ctaDisplayText, setCtaDisplayText] = useState(""); 

  useEffect(() => {
    let i = 0;
    // H2 ke liye current text
    const currentText = ctaTexts[ctaTextIndex]; 

    // Typing effect logic for H2
    const interval = setInterval(() => {
      if (i < currentText.length) {
        setCtaDisplayText((prev) => prev + currentText.charAt(i));
        i++;
      } else {
        // Typing khatam hone ke baad
        clearInterval(interval);
        setTimeout(() => {
          setCtaTextIndex((prev) => (prev + 1) % ctaTexts.length);
        }, 2000); // 2 seconds ka pause
      }
    }, 80); 
    
    // Naya phrase shuru karne se pehle reset
    setCtaDisplayText(currentText.charAt(0));

    return () => clearInterval(interval);
  }, [ctaTextIndex]); 


  return (
    <div className="home-container">
      {/* --- TOP ENVIRONMENT BANNER --- */}
      <div className="hero-banner">
        <img
          src="/homeimage.png"
          alt="Green environment and nature background"
          className="hero-image"
        />
     {/* --- NEW BRANDING LOGO & TEXT ADDED HERE --- */}
   <div className="branding-logo">
       <span className="logo-icon" role="img" aria-label="Recycle symbol">♻️</span>
     <div className="logo-text">
       <span className="main-text">EcoSaathi</span>
      <span className="domain-text">.com</span>
     </div>
   </div>
    {/* ---------------------------------------- */}

        <div className="hero-overlay">
          <h1 className="hero-dialogue">{displayText}</h1> 
        </div>
      </div>

      {/* --- IMAGE-FOCUSED INFO SECTION --- */}
      <section className="info-cards-section">
        
        <h2>How We Work: Your E-Waste Recycling Journey</h2>
        <p className="section-subtitle">
          Give your old electronics a responsible new life with EcoSaathi.
        </p>

        {/* Step 1 */}
        <section className="info-card left-image-layout" aria-label="E-waste pickup step 1">
          <div className="info-image-container">
            <img
              src="/step1.webp"
              alt="Team collecting e-waste from home"
            />
          </div>
          <div className="info-content">
            <h3>Submit a Request and Schedule Pickup</h3>
            <p>
              Simply fill in your e-waste details (old laptops, phones, batteries) on our platform
              and choose a pickup time. Our team will collect it from your address{" "}
              <strong>free of charge</strong>.
            </p>
          </div>
        </section>

        {/* Step 2 */}
        <section className="info-card right-image-layout" aria-label="Sorting and dismantling step 2">
          <div className="info-content">
            <h3>Responsible Sorting and Dismantling</h3>
            <p>
              The collected e-waste is taken to our certified facility. There, skilled professionals
              separate hazardous and valuable components, preventing{" "}
              <strong>environmental damage</strong>.
            </p>
          </div>
          <div className="info-image-container">
            <img
              src="/step2.jpg"
              alt="Sorting and dismantling e-waste materials"
            />
          </div>
        </section>

        {/* Step 3 */}
        <section className="info-card left-image-layout" aria-label="Material recovery step 3">
          <div className="info-image-container">
            
            <img
              src="/step3.png"
              alt="Material recovery process at recycling plant"
            />
          </div>
          <div className="info-content">
            <h3>Recovery of Valuable Materials</h3>
            <p>
              Dismantled components are sent to specialized refineries where{" "}
              <strong>copper</strong>, <strong>gold</strong>, <strong>platinum</strong>, and
              plastics are extracted. This reduces the need for{" "}
              <strong>new raw materials</strong>.
            </p>
          </div>
        </section>

        {/* Step 4 */}
        <section className="info-card right-image-layout" aria-label="Reuse and impact step 4">
          <div className="info-content">
            <h3>New Life and Environmental Impact</h3>
            <p>
              Recovered materials are used to make new products. Our goal is{" "}
              <strong>zero landfill</strong>. Every contribution helps conserve natural resources
              and reduce <strong>carbon emissions</strong>.
            </p>
          </div>
          <div className="info-image-container">
            <img
              src="/step 4.jpeg"
              alt="Sustainable future with green energy and recycling"
            />
          </div>
        </section>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="call-to-action">
        {/* H2 animated */}
        <h2>{ctaDisplayText}</h2>
        <p>
          Submit your first recycling request with EcoSaathi and help make our planet cleaner and
          greener.
        </p>
        <Link to="/register" className="cta-button secondary">
          Get Started
        </Link>
      </section>
    </div>
  );
}