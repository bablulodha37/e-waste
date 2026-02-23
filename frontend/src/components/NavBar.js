import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavBar.css";

const API_BASE_URL = "http://localhost:8080";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🔔 Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setNotifDropdownOpen(false); // close notif dropdown if open
  };

  const toggleNotifDropdown = () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    setUserDropdownOpen(false); // close user dropdown if open
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "ADMIN";
  const isPickupPerson = user && user.role === "PICKUP_PERSON";

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const homeDestination = user
    ? isAdmin
      ? "/admin"
      : isPickupPerson
      ? `/pickup-dashboard/${user.id}`
      : `/dashboard/${user.id}`
    : "/";

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigateTo = (path) => {
    navigate(path);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  };

  const profileImageUrl =
    user && user.profilePictureUrl
      ? user.profilePictureUrl.startsWith("./images/")
        ? `${API_BASE_URL}${user.profilePictureUrl}`
        : user.profilePictureUrl
      : null;

  const userInitial =
    (user && (user.firstName?.[0] || user.email?.[0]))?.toUpperCase() || "U";

  const userFullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  // 🔔 FETCH NOTIFICATIONS (real data)
  useEffect(() => {
    if (!user || !user.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setIsLoadingNotifications(true);

        // Get notifications list
        const notifRes = await fetch(
          `${API_BASE_URL}/api/notifications/user/${user.id}`
        );
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(Array.isArray(data) ? data : []);
        }

        // Get unread count
        const countRes = await fetch(
          `${API_BASE_URL}/api/notifications/user/${user.id}/unread-count`
        );
        if (countRes.ok) {
          const count = await countRes.json();
          setUnreadCount(typeof count === "number" ? count : 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // 🔔 Mark single notification as read
  const handleNotificationClick = async (notification) => {
    if (!notification || notification.read || notification.isRead) return;

    try {
      await fetch(
        `${API_BASE_URL}/api/notifications/${notification.id}/read`,
        {
          method: "PUT",
        }
      );

      // Update in UI
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read: true, isRead: true }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // 🔁 Clear all notifications
  const handleClearAllNotifications = async () => {
    if (!user || !user.id) return;

    try {
      await fetch(
        `${API_BASE_URL}/api/notifications/user/${user.id}`,
        {
          method: "DELETE",
        }
      );
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Helper: show badge text like 9+ if big
  const badgeText =
    unreadCount > 99 ? "99+" : unreadCount > 9 ? "9+" : unreadCount;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {/* Left Section - Logo */}
      <div className="nav-left">
        <Link to={homeDestination} className="logo-container">
          <div className="logo-img-wrapper">
            <img src="/logo.webp" alt="EcoSaathi Logo" className="logo-img" />
          </div>
          <div className="logo-text">
            <span className="logo-primary">EcoSaathi</span>
            <span className="logo-subtitle">
              ♻️ Sustainable E-Waste Solutions
            </span>
          </div>
        </Link>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="nav-center">
        {!user ? (
          <>
            <Link to="/" className={`nav-link ${isHomePage ? "active" : ""}`}>
              <span className="nav-link-icon">🏠</span>
              Home
            </Link>
            <Link to="/services" className="nav-link">
              <span className="nav-link-icon">⚡</span>
              Services
            </Link>
            <Link to="/about" className="nav-link">
              <span className="nav-link-icon">ℹ️</span>
              About
            </Link>
            <Link to="/contact" className="nav-link">
              <span className="nav-link-icon">📞</span>
              Contact
            </Link>
          </>
        ) : (
          <>
            {!isAdmin && !isPickupPerson && (
              <Link
                to={`/dashboard/${user.id}`}
                className={`nav-link ${
                  location.pathname.includes("dashboard") ? "active" : ""
                }`}
              >
                <span className="nav-link-icon">📊</span>
                Dashboard
              </Link>
            )}

            {isPickupPerson && (
              <Link
                to={`/pickup-dashboard/${user.id}`}
                className={`nav-link ${
                  location.pathname.includes("pickup-dashboard")
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-link-icon">🚚</span>
                Pickup Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                <span className="nav-link-icon">🛡️</span>
                Admin
              </Link>
            )}

            {/* Profile always visible */}
            <Link
              to={
                isPickupPerson
                  ? `/pickup-profile/${user.id}`
                  : `/profile/${user.id}`
              }
              className="nav-link"
            >
              <span className="nav-link-icon">👤</span>
              Profile
            </Link>

            {/* New Request only normal user */}
            {!isAdmin && !isPickupPerson && (
              <Link to={`/request/submit/${user.id}`} className="nav-link">
                <span className="nav-link-icon">➕</span>
                New Request
              </Link>
            )}

            {/* SUPPORT ONLY FOR NORMAL USER */}
            {!isAdmin && !isPickupPerson && (
              <Link to={`/support/${user.id}`} className="nav-link">
                <span className="nav-link-icon">🛠️</span>
                Support
              </Link>
            )}
          </>
        )}
      </div>

      {/* Right Section - Auth & User */}
      <div className="nav-right">
        {!user ? (
          <>
            {!isHomePage && (
              <>
                <Link to="/login" className="btn btn-outline">
                  <span className="btn-icon">🔑</span>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <span className="btn-icon">✨</span>
                  Get Started
                </Link>
              </>
            )}
            {isHomePage && (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Join Now
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="user-section">
            {/* 🔔 Notification Bell + Dropdown */}
            <div className="notification-wrapper">
              <button
                className="notification-btn"
                aria-label="Notifications"
                onClick={toggleNotifDropdown}
              >
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{badgeText}</span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <span className="notification-title">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notification-unread-count">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <div className="notification-content">
                    {isLoadingNotifications ? (
                      <div className="notification-empty">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">
                        No notifications yet.
                      </div>
                    ) : (
                      <ul className="notification-list">
                        {notifications.map((notif) => {
                          const isUnread =
                            !notif.read && !notif.isRead; // backend likely sends "read"
                          return (
                            <li
                              key={notif.id}
                              className={`notification-item ${
                                isUnread ? "unread" : ""
                              }`}
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="notification-message">
                                {notif.message}
                              </div>
                              <div className="notification-meta">
                                <span className={`notification-type ${notif.type?.toLowerCase() || ""}`}>
                                  {notif.type || "INFO"}
                                </span>
                                {notif.createdAt && (
                                  <span className="notification-time">
                                    {new Date(notif.createdAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="notification-footer">
                      <button
                        className="notification-clear-btn"
                        onClick={handleClearAllNotifications}
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div
              className="user-profile"
              onMouseLeave={() => {
                setUserDropdownOpen(false);
              }}
            >
              <button
                className="user-profile-btn"
                onClick={toggleUserDropdown}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="user-avatar-img"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {userInitial}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {userFullName || user.email}
                  </span>
                  <span className="user-role">
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
                <span className="dropdown-arrow">⌄</span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="user-avatar small">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="user-avatar-img"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="dropdown-user-name">
                          {userFullName || user.email}
                        </div>
                        <div className="dropdown-user-email">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-links">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => navigateTo("/admin")}
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">🛡️</span>
                          Admin Dashboard
                        </button>
                        <button
                          onClick={() => navigateTo(`/admin?tab=users`)}
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">👥</span>
                          User Management
                        </button>
                        <button
                          onClick={() => navigateTo(`/admin?tab=requests`)}
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">📦</span>
                          Request Management
                        </button>
                      </>
                    ) : isPickupPerson ? (
                      <>
                        <button
                          onClick={() =>
                            navigateTo(`/pickup-dashboard/${user.id}`)
                          }
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">🚚</span>
                          Pickup Dashboard
                        </button>
                        <button
                          onClick={() =>
                            navigateTo(`/pickup/requests/${user.id}`)
                          }
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">📦</span>
                          My Pickups
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            navigateTo(`/dashboard/${user.id}`)
                          }
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">📊</span>
                          Dashboard
                        </button>
                        <button
                          onClick={() =>
                            navigateTo(`/request/submit/${user.id}`)
                          }
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">➕</span>
                          New Request
                        </button>
                        <button
                          onClick={() =>
                            navigateTo(`/profile/${user.id}/history`)
                          }
                          className="dropdown-link"
                        >
                          <span className="dropdown-link-icon">📋</span>
                          My Requests
                        </button>
                      </>
                    )}

                    {/* Profile for all */}
                    <button
                      onClick={() =>
                        navigateTo(
                          isPickupPerson
                            ? `/pickup-profile/${user.id}`
                            : `/profile/${user.id}`
                        )
                      }
                      className="dropdown-link"
                    >
                      <span className="dropdown-link-icon">👤</span>
                      Profile
                    </button>

                    {/* Settings only normal user */}
                    {!isAdmin && !isPickupPerson && (
                      <button
                        onClick={() => navigateTo(`/profile/${user.id}/edit`)}
                        className="dropdown-link"
                      >
                        <span className="dropdown-link-icon">⚙️</span>
                        Settings
                      </button>
                    )}

                    {/* Support only normal user */}
                    {!isAdmin && !isPickupPerson && (
                      <button
                        onClick={() => navigateTo(`/support/${user.id}`)}
                        className="dropdown-link"
                      >
                        <span className="dropdown-link-icon">🛠️</span>
                        Support
                      </button>
                    )}
                  </div>

                  <div className="dropdown-divider"></div>

                  <button onClick={logout} className="dropdown-link logout-link">
                    <span className="dropdown-link-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
