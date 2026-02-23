import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/PickupOTPVerify.css";

export default function PickupOTPVerify() {
  const { requestId } = useParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080/api/pickup";

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {
      await axios.put(`${API_BASE}/request/complete/${requestId}`, { otp });
      alert("✅ Pickup Completed Successfully!");
      navigate(-1); // go back
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Verify Pickup OTP</h2>
        <p>
          Request ID: <strong>{requestId}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter pickup OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="otp-input"
        />

        {error && <p className="otp-error">{error}</p>}

        <button className="otp-submit-btn" onClick={handleVerify}>
          Verify OTP
        </button>

        <button className="otp-cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}