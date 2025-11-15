import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/PickupDashboard.css";

export default function PickupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  // ✅ Fetch assigned requests
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

  // ✅ Mark request as completed
  const completeRequest = async (requestId) => {
    if (!window.confirm("Mark this request as completed?")) return;
    try {
      await axios.put(`${API_BASE_URL}/request/complete/${requestId}`);
      alert("✅ Request marked as completed!");
      fetchRequests(); // refresh after update
    } catch (err) {
      console.error("Error completing request:", err);
      alert("❌ Failed to complete request. Try again.");
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

  return (
    <div className="pickup-container">
      <h1>🚛 Pickup Dashboard</h1>
      <p className="subtitle">All requests assigned to you</p>

      {requests.length === 0 ? (
        <p className="no-requests">No requests assigned yet.</p>
      ) : (
        <table className="pickup-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>User Name</th>
              <th>Pickup Address</th>
              <th>Scheduled Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.user?.firstName} {req.user?.lastName}</td>
                <td>{req.user?.pickupAddress || "N/A"}</td>
                <td>{req.scheduledTime ? req.scheduledTime.replace("T", " ") : "Not Scheduled"}</td>
                <td>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status !== "COMPLETED" && (
                    <button
                      className="complete-btn"
                      onClick={() => completeRequest(req.id)}
                    >
                      ✅ Mark Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
