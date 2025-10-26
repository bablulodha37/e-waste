import React from "react";
import { Link } from "react-router-dom";
// ✅ Import the icons you need
import { FaRecycle, FaTruck, FaBatteryEmpty, FaChartLine, FaBook, FaWrench } from "react-icons/fa"; 
import "../css/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <header className="hero-section">
        
        <div className="hero-content">
          <h1>Ecosaathi: Your Partner for a Sustainable Future</h1>
          <p>Connecting you with eco-friendly solutions and a greener tomorrow.</p>
          <a 
            href="https://en.wikipedia.org/wiki/Natural_environment" 
            className="cta-button" 
            target="_blank" 
            rel="noopener noreferrer" 
          >
            Learn More
          </a>
        </div>
      </header>

      <section className="features-section">
        
        {/* Card 1: E-Waste Collection Drives (FaTruck) */}
        <div className="feature-card">
          <div className="feature-icon"><FaTruck /></div> 
          <h3>E-Waste Collection Drives</h3>
          <p>Easily find nearby drop-off points or schedule a free pickup for your old electronics.</p>
        </div>

        {/* Card 2: Certified Safe Recycling (FaRecycle) */}
        <div className="feature-card">
          <div className="feature-icon"><FaRecycle /></div>
          <h3>Certified Safe Recycling</h3>
          <p>We partner with certified recyclers to ensure zero-landfill and responsible material recovery.</p>
        </div>

        {/* Card 3: Reduce, Repair, & Reuse (FaWrench) */}
        <div className="feature-card">
          <div className="feature-icon"><FaWrench /></div>
          <h3>Reduce, Repair, & Reuse</h3>
          <p>Discover tips and services to extend the lifespan of your devices before disposal.</p>
        </div>

        {/* Card 4: Safe Disposal of Batteries (FaBatteryEmpty) */}
        <div className="feature-card">
          <div className="feature-icon"><FaBatteryEmpty /></div>
          <h3>Safe Disposal of Batteries</h3>
          <p>Guidance on disposing of batteries and other hazardous components safely and legally.</p>
        </div>

        {/* Card 5: Corporate E-Waste Reports (FaChartLine) */}
        <div className="feature-card">
          <div className="feature-icon"><FaChartLine /></div>
          <h3>Corporate E-Waste Reports</h3>
          <p>Track your business's environmental impact with detailed e-waste recycling reports.</p>
        </div>

        {/* Card 6: Learn the Impact (FaBook) */}
        <div className="feature-card">
          <div className="feature-icon"><FaBook /></div>
          <h3>Learn the Impact</h3>
          <p>Access articles and videos on the global impact of e-waste and how you can help.</p>
        </div>
      </section>

      <section className="call-to-action">
        <h2>Ready to Make a Difference?</h2>
        <p>Start your journey towards a more sustainable life with Ecosaathi today!</p>
        
        <Link to="/register" className="cta-button secondary"> 
          Get Started
        </Link>
      </section>

      <footer className="footer">
        <p>&copy; 2025 EcoSaathi. All rights reserved.</p>
      </footer>
    </div>
  );
}