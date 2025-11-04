import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import "../css/VerifyOtp.css"; // You will create this CSS file

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email from the state passed during registration
  const userEmail = location.state?.email; 

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if no email is found (user navigated directly here)
  if (!userEmail) {
    navigate('/register', { replace: true });
    return null;
  }

  const handleVerification = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/api/auth/verify-otp", {
        method: "POST",
        body: { email: userEmail, otp },
      });
      
      alert("Verification successful! You can now log in.");
      navigate("/login");
      
    } catch (err) {
      console.error(err);
      setError("Verification failed. Check your OTP or if it has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container verify-otp-container">
      <h2>Verify Your Account</h2>
      <p>A verification code (OTP) has been sent to:</p>
      <p className="email-display"><strong>{userEmail}</strong></p>

      <form onSubmit={handleVerification}>
        <input
          type="text"
          placeholder="Enter 6-Digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      
      <p className="note">
          Please check your email inbox (and spam folder) for the code.
      </p>
    </div>
  );
}