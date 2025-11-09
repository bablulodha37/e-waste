import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/UserDashboard.css";

export default function UserDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchUser = () => {
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  };

  const fetchStats = () => {
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
      <h2>Welcome back, {user.firstName || user.email}!</h2>
      <p className="dashboard-subheading">Here's your e-waste management overview</p>

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

      <h3 className="quick-actions-title">Quick Links</h3>
      <div className="quick-actions-container">
        <Link to={`/request/submit/${id}`} className="action-card">
          <span className="action-icon">➕</span>
          <h4>Submit Request</h4>
          <p>Submit a new e-waste request</p>
        </Link>

        <Link to={`/profile/${id}/history`} className="action-card">
          <span className="action-icon">📋</span>
          <h4>My Requests</h4>
          <p>View all your requests and status</p>
        </Link>

        <Link to={`/profile/${id}`} className="action-card">
          <span className="action-icon">👤</span>
          <h4>Profile</h4>
          <p>Update your information</p>
        </Link>

        <Link to={`/certificate/${id}`} className="action-card">
          <span className="action-icon">🏅</span>
          <h4>Certificate</h4>
          <p>Download your certificate</p>
        </Link>

        <Link to={`/report/${id}`} className="action-card">
          <span className="action-icon">📊</span>
          <h4>Reports</h4>
          <p>View analytics and detailed reports</p>
        </Link>
      </div>
    </div>
  );
}
