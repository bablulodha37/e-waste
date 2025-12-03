import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import PickupLiveSender from "../components/PickupLiveSender";
import "../css/PickupDashboard.css";

// 📈 Recharts for line graph
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PickupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/${id}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load assigned requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "PICKUP_PERSON") {
      alert("Access Denied: Only Pickup Persons can view this page.");
      navigate("/", { replace: true });
      return;
    }
    fetchRequests();
  }, [id, navigate]);

  if (loading) return <div className="pickup-container">Loading assigned requests...</div>;
  if (error) return <div className="pickup-container error">{error}</div>;

  const user = JSON.parse(localStorage.getItem("user"));

  // === REAL DASHBOARD STATS ===
  const total = requests.length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const assigned = total - completed;

  // 📊 Synthetic Monthly Graph Data (Based on real stats)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const m = months.length;

  const graphData = months.map((month, i) => {
    const f = (i + 1) / m;
    return {
      month,
      total: Math.round(total * f),
      pending: Math.round(pending * f),
      assigned: Math.round(assigned * f),
      completed: Math.round(completed * f),
    };
  });

  const maxStat = Math.max(total, pending, assigned, completed, 10);
  const maxY = Math.ceil(maxStat / 10) * 10;

  const yTicks = [];
  for (let t = 0; t <= maxY; t += 10) yTicks.push(t);

  return (
    <div className="dashboard-page container">
      {/* Live GPS Sender */}
      <PickupLiveSender pickupPersonId={user.id} />

      <h2>🚛 Pickup Dashboard</h2>
      <p className="dashboard-subheading">Overview of your assigned pickups</p>

      {/* === STAT CARDS === */}
      <div className="stats-cards-container">
        <div className="stat-card total">
          <h3>Total Requests</h3>
          <div className="value">{total}</div>
        </div>

        <div className="stat-card pending">
          <h3>Pending</h3>
          <div className="value">{pending}</div>
        </div>

        <div className="stat-card approved">
          <h3>Assigned</h3>
          <div className="value">{assigned}</div>
        </div>

        <div className="stat-card completed">
          <h3>Completed</h3>
          <div className="value">{completed}</div>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <h3 className="quick-actions-title">Quick Actions</h3>

      <div className="quick-actions-container">
        <Link to={`/pickup-profile/${user.id}`} className="action-card">
          <div className="action-icon">👤</div>
          <p>Profile</p>
        </Link>

        <Link to={`/track/user/${user.id}`} className="action-card">
          <div className="action-icon">🗺️</div>
          <p>View Map</p>
        </Link>

        <Link to={`/pickup/requests/${user.id}`} className="action-card">
          <div className="action-icon">📦</div>
          <p>Request Management</p>
        </Link>
      </div>

      {/* === 📉 STOCK STYLE MULTI LINE GRAPH === */}
      <div className="pickup-graph-wrapper">
        <h3 className="pickup-graph-title">Monthly Request Overview</h3>

        <div className="pickup-graph-legend">
          <span className="legend-line total"></span> Total Requests
          <span className="legend-line pending"></span> Pending
          <span className="legend-line assigned"></span> Assigned
          <span className="legend-line completed"></span> Completed
        </div>

        <div className="pickup-line-chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis ticks={yTicks} domain={[0, maxY]} />
              <Tooltip />

              <Line type="monotone" dataKey="total" stroke="#6f8f73" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="pending" stroke="#4b6559" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="assigned" stroke="#b48cef" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="completed" stroke="#54a8e4" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
