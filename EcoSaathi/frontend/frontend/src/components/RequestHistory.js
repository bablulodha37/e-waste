// src/components/RequestHistory.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import "../css/RequestHistory.css";

export default function RequestHistory() {
  const { id } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [expandedId, setExpandedId] = useState(null);

  // Order of flow steps
  const flowSteps = ["PENDING", "APPROVED", "SCHEDULED", "COMPLETED"];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api(`/api/auth/user/${id}/requests`);
        setRequests(data);
      } catch (err) {
        setError("Failed to load request history.");
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequests();
  }, [id]);

  const toggleExpand = (reqId) => {
    setExpandedId(expandedId === reqId ? null : reqId);
  };

  const filteredRequests = requests.filter(
    (req) => filterStatus === "ALL" || req.status === filterStatus
  );

  // 👉 Stepper ke liye class decide karna
  const getFlowClass = (step) => {
    const base = "step";

    if (!expandedId) return `${base} step-upcoming`;

    const activeReq = filteredRequests.find((r) => r.id === expandedId);
    const activeStatus = activeReq?.status?.toUpperCase() || "";

    const currentIndex = flowSteps.indexOf(activeStatus);
    const stepIndex = flowSteps.indexOf(step.toUpperCase());

    if (stepIndex === -1) return base;

    if (stepIndex < currentIndex) return `${base} step-completed`; // green tick style
    if (stepIndex === currentIndex) return `${base} step-current`; // current
    return `${base} step-upcoming`; // grey
  };

  if (loading) return <div className="container">Loading requests...</div>;
  if (error) return <div className="container error-msg">{error}</div>;

  return (
    <div className="history-main-container">
      {/* LEFT — REQUEST LIST */}
      <div className="request-list-container">
        <h2>Your Requests</h2>

        {/* Filter */}
        <div className="status-filter">
          <label>Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">ALL ({requests.length})</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* REQUEST CARD GRID (2 Cards per row) */}
        <div className="request-card-grid">
          {filteredRequests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`request-card ${
                  expandedId === req.id ? "expanded" : ""
                }`}
                onClick={() => toggleExpand(req.id)}
              >
                <div className="request-card-header">
                  <div>
                    <h3>Request #{req.id}</h3>
                    <p className="req-type">
                      Device: {req.deviceType || req.type}
                    </p>
                  </div>

                  <span
                    className={`status-tag status-${req.status.toLowerCase()}`}
                  >
                    {req.status}
                  </span>
                </div>

                {expandedId === req.id && (
                  <div className="request-details">
                    <p>
                      <strong>Brand &amp; Model:</strong>{" "}
                      {req.brandModel || "N/A"}
                    </p>

                    <p>
                      <strong>Condition:</strong> {req.condition || "N/A"}
                    </p>

                    <p>
                      <strong>Quantity:</strong> {req.quantity || 1}
                    </p>

                    <p>
                      <strong>Description:</strong> {req.description}</p>

                    <p>
                      <strong>Pickup Location:</strong> {req.pickupLocation}
                    </p>

                    <p>
                      <strong>Additional Remarks:</strong>{" "}
                      {req.additionalRemarks || "No remarks"}
                    </p>

                    <p>
                      <strong>Pickup OTP:</strong>{" "}
                      {req.pickupOtp || "Not generated yet"}
                    </p>

                    <p>
                      <strong>Scheduled Time:</strong>{" "}
                      {req.scheduledTime
                        ? new Date(req.scheduledTime).toLocaleString()
                        : "Not Scheduled"}
                    </p>

                    <p>
                      <strong>Pickup Person:</strong>{" "}
                      {req.assignedPickupPerson
                        ? `${req.assignedPickupPerson.name} (${req.assignedPickupPerson.phone})`
                        : "Not Assigned Yet"}
                    </p>

                    {/* 🔥 Photos from backend (photoUrls) */}
                    {req.photoUrls && req.photoUrls.length > 0 && (
                      <div className="image-preview-box">
                        <strong>Uploaded Photos:</strong>
                        <div className="image-row">
                          {req.photoUrls.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`photo-${i}`}
                              className="thumb-img"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {req.status === "SCHEDULED" && (
                      <button
                        className="track-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/track/pickup/${req.id}`, "_blank");
                        }}
                      >
                        🚛 Track Pickup
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT — FLOW CHART (Stepper style like screenshot) */}
      <div className="request-flow-container">
        <h3>Request Progress</h3>

        <ul className="flow-chart">
          <li className={getFlowClass("PENDING")}>Request Submitted</li>
          <li className={getFlowClass("APPROVED")}>Request Approved</li>
          <li className={getFlowClass("SCHEDULED")}>Pickup Scheduled</li>
          <li className={getFlowClass("COMPLETED")}>Pickup Completed</li>
        </ul>

        {expandedId && (
          <div className="active-flow-status">
            <h4>Current Status:</h4>
            <p className="highlight-status">
              {filteredRequests.find((r) => r.id === expandedId)?.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
