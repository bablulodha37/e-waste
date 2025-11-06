import React from "react";
// Import necessary hooks from react-router-dom
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "ADMIN";
  
  const isHomePage = location.pathname === '/';

  const showQuickLinks = user || (!user && isHomePage);
  const showPublicQuickLinks = !user && isHomePage;

  const logout = () => {
    localStorage.removeItem("user");
    // Navigate to the login page after successful logout
    navigate("/login");
  };
  
  // Destination logic remains the same
  const homeDestination = user
    ? (isAdmin ? "/admin" : `/dashboard/${user.id}`)
    : "/";
    
  const homeLinkText = user ? "Dashboard" : "Home";

  const isAdminLinkShown = isAdmin;
  const homeNeedsAutoMargin = showQuickLinks && !isAdminLinkShown;
  const loginNeedsAutoMargin = !user && !isHomePage && !isAdminLinkShown;

  // NEW: Handlers for button-based navigation
  const navigateToProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };
  const navigateToHomeDestination = () => {
      navigate(homeDestination);
  };
  const navigateToAdmin = () => {
      navigate("/admin");
  };

  return (
    <nav className="navbar">
      {/* *** LOGO CHANGE START ***
        Replaced <h2> with <img> tag.
        The path "/logo.webp" refers directly to the file in the public folder.
      */}
      <Link to={homeDestination} className="logo-link">
        <img src="/logo.webp" alt="EcoSaathi Logo" className="logo-img" />
      </Link>
      {/* *** LOGO CHANGE END *** */}
      
      <div className="nav-links">

        {/* ----------------- Left Group ----------------- */}
        {/* FIX: Admin is now a button */}
        {isAdmin && 
          <button className="nav-btn" onClick={navigateToAdmin}>Admin</button>
        }

        {/* ----------------- Far Right Group ----------------- */}

        {/* FIX: HOME/DASHBOARD is now a button when logged in */}
        {showQuickLinks &&
            (user ? (
              <button
                className="nav-btn"
                onClick={navigateToHomeDestination}
                style={homeNeedsAutoMargin ? { marginLeft: 'auto' } : {}}
              >
                {homeLinkText} {/* Will be "Dashboard" when logged in */}
              </button>
            ) : (
              // Public 'Home' link remains a Link
              <Link
                to={homeDestination}
                style={homeNeedsAutoMargin ? { marginLeft: 'auto' } : {}}
              >
                {homeLinkText}
              </Link>
            ))}


        {/* 1. SERVICES: Link (Public Links remain Links) */}
        {showPublicQuickLinks && <Link to="/services">Services</Link>}

        {/* 2. ABOUT US and CONTACT: Link */}
        {showPublicQuickLinks && <Link to="/about">About Us</Link>}
        {showPublicQuickLinks && <Link to="/contact">Contact</Link>}

        {/* 3. LOGIN: Link */}
        {!user && !isHomePage &&
          <Link
            to="/login"
            style={loginNeedsAutoMargin ? { marginLeft: 'auto' } : {}}
          >
            Sign In
          </Link>
        }

        {/* 4. REGISTER: Link */}
        {!user && !isHomePage && <Link to="/register">Sign Up</Link>}

        {/* ----------------- Profile/Logout ----------------- */}

        {/* FIX: Profile is now a button */}
        {user && 
          <button className="nav-btn" onClick={navigateToProfile}>Profile</button>
        }
        
        {user && (
          // Logout button uses the nav-btn style
          <button className="nav-btn logout-btn" onClick={logout}> 
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}