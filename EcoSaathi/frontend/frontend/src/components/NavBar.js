import React from "react";
// Import necessary hooks from react-router-dom
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import "../css/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  // Get the current location object to check the active page
  const location = useLocation(); 
  
  // Attempt to parse the user object from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Check if the user is an admin
  const isAdmin = user && user.isAdmin; 
  
  // Page path check
  const isHomePage = location.pathname === '/'; 
  
  // Logic for Quick Links (Services, About, Contact) AND now the HOME link:
  // Show if: 1. User is logged in OR 2. User is NOT logged in AND current page IS the Home page
  const showQuickLinks = user || (!user && isHomePage);

  const logout = () => {
    localStorage.removeItem("user");
    // Navigate to the login page after successful logout
    navigate("/login"); 
  };
  // ✅ NEW LOGIC: Destination for Logo and Home Link
  const homeDestination = user 
    ? (isAdmin ? "/admin" : `/profile/${user.id}`) // If logged in, go to admin or user profile
    : "/"; // If logged out, go to public home page
  // Flag to check if the Admin link is visible
  const isAdminLinkShown = isAdmin;
  
  // Flag to check if the Home link will be the first link on the right.
  // This is true if the Admin link is NOT shown AND Home link IS shown.
  const homeNeedsAutoMargin = showQuickLinks && !isAdminLinkShown;

  // Flag to check if the Login link will be the first link on the right.
  // This is true if Admin and Quick Links are NOT shown AND Login IS shown.
  // Note: If Home link is not shown, Quick Links are also not shown, so we simplify this check.
  const loginNeedsAutoMargin = !user && !isHomePage && !isAdminLinkShown;

  return (
    <nav className="navbar">
      <h2 className="logo">EcoSaathi</h2>
      <div className="nav-links">

        {/* ----------------- Left Group ----------------- */}
        {/* Admin Link: Stays on the left side of the auto-margin gap */}
        {isAdmin && <Link to="/admin">Users Request</Link>}

        {/* ----------------- Far Right Group ----------------- */}
        
        {/* NEW: HOME Link - Now follows the 'showQuickLinks' logic. 
           It gets auto-margin if it's the first link after the logo/Admin Link. */}
        {showQuickLinks && 
         <Link 
            // ✅ CHANGE 1: Use the conditional homeDestination
            to={homeDestination}
            style={homeNeedsAutoMargin ? { marginLeft: 'auto' } : {}}
          >
            Home
          </Link>
        }
        
        
        {/* 1. SERVICES: Follows Home link. No extra margin needed. */}
        {showQuickLinks && <Link to="/services">Services</Link>}
        
        {/* 2. ABOUT US and CONTACT: Follow Services. */}
        {showQuickLinks && <Link to="/about">About Us</Link>}
        {showQuickLinks && <Link to="/contact">Contact</Link>}

        {/* 3. LOGIN: Gets auto-margin if it is the first visible link. */}
        {!user && !isHomePage && 
          <Link 
            to="/login"
            // Login needs auto margin if Admin is hidden AND Quick Links (including Home) are hidden
            style={loginNeedsAutoMargin ? { marginLeft: 'auto' } : {}}
          >
            Sign In
          </Link>
        }
        
        {/* 4. REGISTER: Follows the Login link. */}
        {!user && !isHomePage && <Link to="/register">Sign Up</Link>}

        {/* ----------------- Profile/Logout ----------------- */}
        
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