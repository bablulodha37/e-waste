// src/components/NavBar.js  (Final Corrected – unchanged logic)
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "ADMIN";

  const isHomePage = location.pathname === "/";
  const showQuickLinks = user || (!user && isHomePage);
  const showPublicQuickLinks = !user && isHomePage;

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const homeDestination = user
    ? isAdmin
      ? "/admin"
      : `/dashboard/${user.id}`
    : "/";
  const homeLinkText = user ? "Dashboard" : "Home";

  const isAdminLinkShown = isAdmin;
  const homeNeedsAutoMargin = showQuickLinks && !isAdminLinkShown;
  const loginNeedsAutoMargin = !user && !isHomePage && !isAdminLinkShown;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // --- Navigation helpers for users ---
  const navigateTo = (path) => {
    navigate(path);
    closeMenu();
  };

  const navigateToProfile = () => navigateTo(`/profile/${user.id}`);
  const navigateToDashboard = () => navigateTo(`/dashboard/${user.id}`);
  const navigateToRequestSubmit = () => navigateTo(`/request/submit/${user.id}`);
  const navigateToHistory = () => navigateTo(`/profile/${user.id}/history`);
  const navigateToCertificate = () => navigateTo(`/certificate/${user.id}`);
  const navigateToReport = () => navigateTo(`/report/${user.id}`);

  // --- ADMIN NAVIGATION HELPERS ---
  const handleAdminTab = (tab) => {
    window.dispatchEvent(new CustomEvent("adminTabChange", { detail: tab }));
    navigate("/admin");
    closeMenu();
  };

  return (
    <nav className="navbar">
      {user && (
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
      )}

      <Link to={homeDestination} className="logo-link">
        <img src="/logo.webp" alt="EcoSaathi Logo" className="logo-img" />
      </Link>

      <div className="nav-links">
        {/* ✅ Changed from "Admin" to "Admin Dashboard" */}
        {isAdmin && (
          <button className="nav-btn" onClick={() => navigate("/admin")}>
            Admin Dashboard
          </button>
        )}

        {/* 👇 Dashboard/Home logic */}
        {showQuickLinks &&
          (!user || (user && !isAdmin)) &&
          (user ? (
            <button
              className="nav-btn"
              onClick={navigateToDashboard}
              style={homeNeedsAutoMargin ? { marginLeft: "auto" } : {}}
            >
              {homeLinkText}
            </button>
          ) : (
            <Link
              to={homeDestination}
              style={homeNeedsAutoMargin ? { marginLeft: "auto" } : {}}
            >
              {homeLinkText}
            </Link>
          ))}

        {showPublicQuickLinks && <Link to="/services">Services</Link>}
        {showPublicQuickLinks && <Link to="/about">About Us</Link>}
        {showPublicQuickLinks && <Link to="/contact">Contact</Link>}

        {!user && !isHomePage && (
          <Link
            to="/login"
            style={loginNeedsAutoMargin ? { marginLeft: "auto" } : {}}
          >
            Sign In
          </Link>
        )}

        {!user && !isHomePage && <Link to="/register">Sign Up</Link>}

        {user && (
          <>
            <button className="nav-btn" onClick={navigateToProfile}>
              Profile
            </button>
            <button className="nav-btn logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>

      {/* --- USER DROPDOWN MENU --- */}
      {user && !isAdmin && menuOpen && (
        <div className="dropdown-menu">
          <button onClick={navigateToDashboard}>🏠 Dashboard</button>
          <button onClick={navigateToRequestSubmit}>➕ Submit Request</button>
          <button onClick={navigateToHistory}>📋 My Requests</button>
          <button onClick={navigateToProfile}>👤 Profile</button>
          <button onClick={navigateToCertificate}>🏅 Certificate</button>
          <button onClick={navigateToReport}>📊 Reports</button>
          <hr className="menu-divider" />
          <button onClick={logout}>🚪 Logout</button>
        </div>
      )}

      {/* --- ADMIN DROPDOWN MENU --- */}
      {user && isAdmin && menuOpen && (
        <div className="dropdown-menu">
          <button onClick={() => handleAdminTab("dashboard")}>
            🏠 Admin Dashboard
          </button>
          <button onClick={() => handleAdminTab("users")}>🧑‍💼 User Management</button>
          <button onClick={() => handleAdminTab("requests")}>📦 Request Management</button>
          <button onClick={() => handleAdminTab("pickups")}>🚛 Pickup Persons</button>
          <hr className="menu-divider" />
          <button onClick={logout}>🚪 Logout</button>
        </div>
      )}
    </nav>
  );
}
