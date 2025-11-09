import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>EcoSaathi</h3>
          <p>
            Committed to a cleaner planet by providing responsible and efficient
            e-waste recycling services.
          </p>
          {/* Copyright line ko niche rakhne ke liye yahan se hatakar
             alag div mein daal dete hain, ya ismein rehne dete hain */}
          
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Reach Us</h3>
          <p>Email: info@ecosaathi.com</p>
          <p>Phone: +91-6261610574</p>
          <p>Address: 123 Green Way, Recycling City Bhopal</p>
        </div>
        
        {/* ✅ नया सोशल मीडिया सेक्शन */}
        <div className="footer-section social">
          <h3>Connect</h3>
          <div className="social-icons">
            {/* Fa: Font Awesome icons se hai */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="icon" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF className="icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn className="icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}