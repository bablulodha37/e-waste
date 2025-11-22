import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/PickupDashboard.css";

export default function PickupRequestManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  // Fetch all assigned requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/${id}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // === Final Mark Complete Logic (same as Dashboard version) ===
  const completeRequest = async (requestId) => {
    if (!window.confirm("Mark this request as completed?")) return;

    try {
      await axios.put(`${API_BASE_URL}/request/complete/${requestId}`);
      alert("Request marked as completed!");
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error completing request:", err);
      alert("Failed to complete request. Try again.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [id]);

  return (
    <div className="pickup-container">
      <h2>Request Management</h2>

      {requests.length === 0 ? (
        <p>No assigned requests.</p>
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
                <td>
                  {req.user?.firstName} {req.user?.lastName}
                </td>
                <td>{req.user?.pickupAddress || "N/A"}</td>
                <td>
                  {req.scheduledTime
                    ? req.scheduledTime.replace("T", " ")
                    : "Not Scheduled"}
                </td>

                <td>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>

                <td>
                  {/* Show Mark Complete only if not completed */}
                  {req.status?.toLowerCase() !== "completed" && (
                    <button
                      className="complete-btn"
                      onClick={() => completeRequest(req.id)}
                    >
                      Mark Complete
                    </button>
                  )}

                  <button
                    className="track-btn"
                    onClick={() => navigate(`/track/user/${req.id}`)}
                  >
                    Track User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
