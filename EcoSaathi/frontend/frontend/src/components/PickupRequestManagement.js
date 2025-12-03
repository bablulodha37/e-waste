import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/PickupRequestManagement.css";

export default function PickupRequestManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  // Fetch all assigned pickup requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/${id}/requests`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Navigate to OTP Page
  const completeRequest = (requestId) => {
    navigate(`/pickup/verify-otp/${requestId}`);
  };

  useEffect(() => {
    fetchRequests();
  }, [id]);

  return (
    <div className="pickup-card-main">
      <h2 className="pickup-title">Assigned Pickup Requests</h2>

      <div className="pickup-card-grid">
        {requests.length === 0 ? (
          <p>No assigned requests.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="pickup-card">
              {/* HEADER */}
              <div className="pickup-card-header">
                <h3>Request #{req.id}</h3>
                <span className={`pickup-status status-${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </div>

              {/* CARD CONTENT */}
              <div className="pickup-info">
                <p>
                  <strong>User:</strong> {req.user?.firstName} {req.user?.lastName}
                </p>
                <p>
                  <strong>Pickup Address:</strong> {req.pickupLocation}
                </p>
                <p>
                  <strong>Scheduled Time:</strong>{" "}
                  {req.scheduledTime
                    ? req.scheduledTime.replace("T", " ")
                    : "Not Scheduled"}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pickup-card-actions">
                {req.status?.toLowerCase() !== "completed" && (
                  <button
                    className="pickup-complete-btn"
                    onClick={() => completeRequest(req.id)}
                  >
                    Mark Complete
                  </button>
                )}

                <button
                  className="pickup-track-btn"
                  onClick={() =>
                    (window.location.href = `/track/user/${req.id}`)
                  }
                >
                  Track User
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
