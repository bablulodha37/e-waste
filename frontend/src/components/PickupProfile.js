import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PickupProfile.css";

export default function PickupProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/pickup/${id}`)
      .then((res) => {
        setProfile(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching pickup profile:", err);
        setError("Unable to load profile. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pickup-profile">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="pickup-profile">
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="pickup-profile">
      <div className="not-found">
        <div className="not-found-icon">👤</div>
        <h3>Profile Not Found</h3>
        <p>The pickup person profile you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <div className="pickup-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon">🚚</span>
        </div>
        <div className="profile-title">
          <h1>{profile.name}</h1>
          <p className="profile-subtitle">Pickup Person</p>
        </div>
        <div className="profile-status">
          <span className="status-badge active">Active</span>
        </div>
      </div>

      <div className="profile-content">
        <div className="info-section">
          <h3 className="section-title">
            <span className="section-icon">📋</span>
            Personal Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">ID</div>
              <div className="info-value">{profile.id}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Name</div>
              <div className="info-value">{profile.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">
                <a href={`mailto:${profile.email}`} className="email-link">
                  {profile.email}
                </a>
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Phone</div>
              <div className="info-value">
                <a href={`tel:${profile.phone}`} className="phone-link">
                  {profile.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="section-title">
            <span className="section-icon">🚗</span>
            Vehicle Details
          </h3>
          <div className="vehicle-card">
            <div className="vehicle-icon">
              {profile.vehicleType?.includes("truck") ? "🚚" : 
               profile.vehicleType?.includes("van") ? "🚐" : "🚗"}
            </div>
            <div className="vehicle-details">
              <div className="vehicle-type">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{profile.vehicleType || "Not specified"}</span>
              </div>
              <div className="vehicle-number">
                <span className="detail-label">Number:</span>
                <span className="detail-value badge">{profile.vehicleNumber || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-footer">
        <button className="action-btn primary">
          <span className="btn-icon">✏️</span>
          Edit Profile
        </button>
        <button className="action-btn secondary">
          <span className="btn-icon">📱</span>
          Contact Now
        </button>
        <button className="action-btn ghost">
          <span className="btn-icon">📋</span>
          View History
        </button>
      </div>
    </div>
  );
}
