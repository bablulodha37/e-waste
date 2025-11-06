import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/UserDashboard.css"; // We will create this CSS file next

export default function UserDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null); // To hold the count for Pending, Approved, etc.

  // Fetch User Details
  const fetchUser = () => {
    // Assuming the user object is already in localStorage/context for a logged-in user,
    // but we'll fetch it again for freshness and safety.
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  };
  
  // 🔥 Placeholder: Fetch Request Stats (You'll implement this API later)
  const fetchStats = () => {
    // This API call would fetch counts for 'total', 'pending', 'approved', 'completed'
    // For now, we use mock data.
    setTimeout(() => {
        setStats({
            total: 5,
            pending: 1,
            approved: 3,
            completed: 1,
        });
    }, 500);
    // api(`/api/requests/stats/${id}`).then(setStats).catch(console.error); 
  };

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, [id]);

  if (!user || !stats) return <div className="container">Loading...</div>;

  return (
    <div className="container dashboard-page">
      {/* Welcome Section */}
      <h2>Welcome back, {user.firstName || user.email}!</h2>
      <p className="dashboard-subheading">Here's your e-waste management overview</p>

      {/* 1. Stats Cards (Matching the image style) */}
      <div className="stats-cards-container">
        <div className="stat-card total">
          <h3>Total Requests</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <div className="value">{stats.pending}</div>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <div className="value">{stats.approved}</div>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <div className="value">{stats.completed}</div>
        </div>
      </div>

{/* 2. Quick Links */}
<h3 className="quick-actions-title">Quick Links</h3>
<div className="quick-actions-container">
  {/* Create Request */}
  <Link to={`/request/submit/${id}`} className="action-card">
    <span className="action-icon">➕</span>
    <h4>Submit Request</h4>
    <p>Submit a new e-waste request</p>
  </Link>
  
  {/* My Requests (History) */}
  <Link to={`/profile/${id}/history`} className="action-card">
    <span className="action-icon">📋</span>
    <h4>My Requests</h4>
    <p>View all your requests and status</p>
  </Link>
  
  {/* Profile Details */}
  <Link to={`/profile/${id}`} className="action-card">
    <span className="action-icon">👤</span>
    <h4>Profile</h4>
    <p>Update your information</p>
  </Link>
    <div></div>
  {/* Certificate (Moved inside the container for consistency) */}
  <Link to={`/certificate/${id}`} className="action-card">
    <span className="action-icon">🏅</span> {/* Changed icon to one related to certificate/award */}
    <h4>Certificate</h4>
    <p>Download your certificate</p>
  </Link>

  {/* **NEW: Report** */}
  <Link to={`/report/${id}`} className="action-card">
    <span className="action-icon">📊</span> {/* Icon for reports/analytics */}
    <h4>Reports</h4>
    <p>View analytics and detailed reports</p>
  </Link>

</div>
    </div>
  );
}