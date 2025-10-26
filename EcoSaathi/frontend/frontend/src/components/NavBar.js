import React from "react";
// ✅ Import useLocation
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import "../css/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  // ✅ Get the current location object
  const location = useLocation(); 
  
  // Attempt to parse the user object from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  // New variable to check if the user is an admin
  const isAdmin = user && user.isAdmin; 
  
  // ✅ New variable: Check if the current path is exactly the root ("/")
  const isHomePage = location.pathname === '/'; 

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">EcoSaathi</h2>
      <div className="nav-links">
        
        {/* New Links Added Here */}
        <Link to="/services">Services</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        {/* --------------------------- */}

        {/* Admin Link - Only show if isAdmin is true */}
        {isAdmin && <Link to="/admin">Admin</Link>}

        {/* ----------------------------------------------- */}
        {/* ✅ Conditional Rendering Logic: Show Login/Register ONLY if: */}
        {/* 1. The user is NOT logged in (!user) */}
        {/* 2. The current page is NOT the home page (!isHomePage) */}
        
        {!user && !isHomePage && <Link to="/login">Login</Link>}
        {!user && !isHomePage && <Link to="/register">Register</Link>}

        {/* ----------------------------------------------- */}
        
        {user && <Link to={`/profile/${user.id}`}>Profile</Link>}
        {user && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
