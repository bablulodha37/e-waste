import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/UserDashboard.css";

// 📈 Recharts import
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function UserDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchUser = () => {
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  };

  // ✅ Fetch real stats from backend
  const fetchStats = () => {
    api(`/api/auth/user/${id}/stats`)
      .then(setStats)
      .catch(console.error);
  };

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, [id]);

  if (!user || !stats) return <div className="container">Loading...</div>;

  // 🔢 Monthly line chart ke liye synthetic monthly data
  //    (last month tak values stats ke equal ho jayengi)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthsCount = months.length;

  const monthlyData = months.map((month, index) => {
    const factor = (index + 1) / monthsCount; // 1/6, 2/6, ... 6/6
    return {
      month,
      total: Math.round((stats.total || 0) * factor),
      pending: Math.round((stats.pending || 0) * factor),
      approved: Math.round((stats.approved || 0) * factor),
      completed: Math.round((stats.completed || 0) * factor),
    };
  });

  // Y-axis ticks 0,10,20,... style
  const maxStat = Math.max(
    stats.total || 0,
    stats.pending || 0,
    stats.approved || 0,
    stats.completed || 0
  );
  const maxYAxis = Math.max(10, Math.ceil(maxStat / 10) * 10);

  const yTicks = [];
  for (let t = 0; t <= maxYAxis; t += 10) {
    yTicks.push(t);
  }

  return (
    <div className="container dashboard-page">
      <h2>Good morning, {user.firstName || user.email}!</h2>
      <p className="dashboard-subheading">
        Here's your e-waste management overview
      </p>

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

        <Link to={`/support/${id}`} className="action-card">
          <span className="action-icon">🛠</span>
          <h4>Help & Support</h4>
          <p>Raise tickets & issues</p>
        </Link>
      </div>

      {/* 📉 Stats ke niche multi-line stock-type graph */}
      <div className="stats-graph-wrapper">
        <h3 className="graph-title">Monthly Request Trend</h3>

        <div className="stats-graph-legend">
          <span className="legend-line total"></span> Total
          <span className="legend-line pending"></span> Pending
          <span className="legend-line approved"></span> Approved
          <span className="legend-line completed"></span> Completed
        </div>

        <div className="line-chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis ticks={yTicks} domain={[0, maxYAxis]} />
              <Tooltip />

              {/* Colors stat-card colors se match */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#86967e"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="rgb(94, 145, 127)"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="rgb(201, 156, 255)"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="rgb(94, 188, 229)"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

     
    </div>
  );
}
