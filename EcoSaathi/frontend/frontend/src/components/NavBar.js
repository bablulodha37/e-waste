import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavBar.css";


const API_BASE_URL = "http://localhost:8080";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userSidebarOpen, setUserSidebarOpen] = useState(false);
  const [pickupSidebarOpen, setPickupSidebarOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  const openUserSidebar = () => setUserSidebarOpen(true);
  const closeUserSidebar = () => setUserSidebarOpen(false);

  const openPickupSidebar = () => setPickupSidebarOpen(true);
  const closePickupSidebar = () => setPickupSidebarOpen(false);

  const openAdminSidebar = () => setAdminSidebarOpen(true);
  const closeAdminSidebar = () => setAdminSidebarOpen(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "ADMIN";
  const isPickupPerson = user && user.role === "PICKUP_PERSON";

  const isHomePage = location.pathname === "/";

  const showQuickLinks = user || (!user && isHomePage);
  const showPublicQuickLinks = !user && isHomePage;

  const homeDestination = user
    ? isAdmin
      ? "/admin"
      : isPickupPerson
      ? `/pickup-dashboard/${user.id}`
      : `/dashboard/${user.id}`
    : "/";

  const homeLinkText = user ? "Dashboard" : "Home";

  const isAdminLinkShown = isAdmin;
  const homeNeedsAutoMargin = showQuickLinks && !isAdminLinkShown;
  const loginNeedsAutoMargin = !user && !isHomePage && !isAdminLinkShown;

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Profile image URL (same idea as ProfilePictureUploader)
  const profileImageUrl =
    user && user.profilePictureUrl
      ? user.profilePictureUrl.startsWith("./images/")
        ? `${API_BASE_URL}${user.profilePictureUrl}`
        : user.profilePictureUrl
      : null;

  const userInitial =
    (user && (user.firstName?.[0] || user.email?.[0]))?.toUpperCase() || "U";

  return (
    <nav className="navbar">
      {/* ☰ MENU ICON – opens correct sidebar AFTER LOGIN */}
      {user && (
        <div
          className="menu-icon"
          onClick={
            isAdmin
              ? openAdminSidebar
              : isPickupPerson
              ? openPickupSidebar
              : openUserSidebar
          }
        >
          ☰
        </div>
      )}

      {/* LOGO */}
      <Link to={homeDestination} className="logo-link">
        <img src="/logo.webp" alt="EcoSaathi Logo" className="logo-img" />
      </Link>

      <div className="nav-links">
        {/* ======================== */}
        {/* 🔹 PRE-LOGIN NAV */}
        {/* ======================== */}
        {!user && (
          <>
            {showQuickLinks &&
              (!user || (user && !isAdmin && !isPickupPerson)) &&
              (user ? (
                <button
                  className="nav-btn"
                  onClick={() => navigate(`/dashboard/${user.id}`)}
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

            {/* Public links on Home page */}
            {showPublicQuickLinks && <Link to="/services">Services</Link>}
            {showPublicQuickLinks && <Link to="/about">About Us</Link>}
            {showPublicQuickLinks && <Link to="/contact">Contact</Link>}

            {/* Sign in / Sign up when not on home page */}
            {!user && !isHomePage && (
              <Link
                to="/login"
                style={loginNeedsAutoMargin ? { marginLeft: "auto" } : {}}
              >
                Sign In
              </Link>
            )}
            {!user && !isHomePage && <Link to="/register">Sign Up</Link>}
          </>
        )}

        {/* ======================== */}
        {/* 🔹 AFTER LOGIN NAV */}
        {/* ======================== */}
        {user && (
          <>
            {!isAdmin && !isPickupPerson && (
              <button
                className="nav-btn"
                onClick={() => navigate(`/dashboard/${user.id}`)}
              >
                Dashboard
              </button>
            )}

            {isPickupPerson && (
              <button
                className="nav-btn"
                onClick={() => navigate(`/pickup-dashboard/${user.id}`)}
              >
                Pickup Dashboard
              </button>
            )}

            {isAdmin && (
              <button className="nav-btn" onClick={() => navigate("/admin")}>
                Admin Dashboard
              </button>
            )}

            <button className="nav-btn logout-btn" onClick={logout}>
              Logout
            </button>

            {/* 👉 Logout ke aage user photo + notification */}
            <div className="nav-user-section">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="nav-user-avatar"
                />
              ) : (
                <div className="nav-user-avatar nav-user-avatar-placeholder">
                  {userInitial}
                </div>
              )}
              
            </div>
          </>
        )}
      </div>

      {/* ===================================================== */}
      {/* ⭐⭐ USER SIDEBAR ⭐⭐ (NORMAL USER, AFTER LOGIN) */}
      {/* ===================================================== */}
      {user && !isAdmin && !isPickupPerson && userSidebarOpen && (
        <div className="pickup-sidebar-overlay" onClick={closeUserSidebar}>
          <div
            className="pickup-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Yahan pe user ka name + gmail */}
            <div className="sidebar-user-header">
              <div className="sidebar-user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>

            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/dashboard/${user.id}`)}
            >
              🏠 Dashboard
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/request/submit/${user.id}`)}
            >
              ➕ Submit Request
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/profile/${user.id}/history`)}
            >
              📋 My Requests
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/profile/${user.id}`)}
            >
              👤 Profile
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/certificate/${user.id}`)}
            >
              🏅 Certificate
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/report/${user.id}`)}
            >
              📊 Reports
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/support/${user.id}`)}
            >
              🛠 Support
            </button>

            {/* Support ke niche Settings → Edit Profile */}
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/profile/${user.id}/edit`)}
            >
              ⚙️ Settings
            </button>

            <div className="sidebar-bottom">
              <button className="sidebar-logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* ⭐⭐ PICKUP PERSON SIDEBAR ⭐⭐ */}
      {/* ===================================================== */}
      {user && isPickupPerson && pickupSidebarOpen && (
        <div className="pickup-sidebar-overlay" onClick={closePickupSidebar}>
          <div
            className="pickup-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="sidebar-title">Pickup Menu</h3>

            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/pickup-dashboard/${user.id}`)}
            >
              🚛 Pickup Dashboard
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/pickup-profile/${user.id}`)}
            >
              👤 Profile
            </button>
            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/pickup/requests/${user.id}`)}
            >
              📦 Request Management
            </button>

            <div className="sidebar-bottom">
              <button className="sidebar-logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* ⭐⭐ ADMIN SIDEBAR ⭐⭐ */}
      {/* ===================================================== */}
      {user && isAdmin && adminSidebarOpen && (
        <div className="pickup-sidebar-overlay" onClick={closeAdminSidebar}>
          <div
            className="pickup-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="sidebar-title">Admin Menu</h3>

            <button
              className="sidebar-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("adminTabChange", { detail: "dashboard" })
                );
                navigate("/admin");
              }}
            >
              🏠 Dashboard
            </button>

            <button
              className="sidebar-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("adminTabChange", { detail: "users" })
                );
                navigate("/admin");
              }}
            >
              👥 User Management
            </button>

            <button
              className="sidebar-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("adminTabChange", { detail: "requests" })
                );
                navigate("/admin");
              }}
            >
              📦 Request Management
            </button>

            <button
              className="sidebar-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("adminTabChange", { detail: "pickups" })
                );
                navigate("/admin");
              }}
            >
              🚛 Pickup Person Management
            </button>

            <button
              className="sidebar-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("adminTabChange", { detail: "issues" })
                );
                navigate("/admin");
              }}
            >
              📩 Issues Management
            </button>

            <button
              className="sidebar-btn"
              onClick={() => navigateTo(`/profile/${user.id}`)}
            >
              👤 Profile
            </button>

            <div className="sidebar-bottom">
              <button className="sidebar-logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
