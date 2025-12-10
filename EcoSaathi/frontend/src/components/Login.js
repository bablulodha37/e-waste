import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../api";
import "../css/Login.css";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let user = null;

      // 1️⃣ Pickup Person login
      try {
        const pickupResponse = await axios.post(
          `http://localhost:8080/api/pickup/login?email=${emailOrPhone}&password=${password}`
        );
        if (pickupResponse.data && pickupResponse.data.id) {
          user = pickupResponse.data;
          user.role = "PICKUP_PERSON";
        }
      } catch {}

      // 2️⃣ Normal / Admin login
      if (!user) {
        user = await api("/api/auth/login", {
          method: "POST",
          body: { email: emailOrPhone, password },
        });
      }

      if (!user) throw new Error("Invalid credentials");

      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN" || user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "PICKUP_PERSON") {
        navigate(`/pickup-dashboard/${user.id}`);
      } else {
        navigate(`/dashboard/${user.id}`);
      }
    } catch (err) {
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="login-page">

      {/* LEFT GREEN PANEL */}
      <div className="login-left">
        <div className="login-left-inner">
          <h2 className="brand-title">EcoSaathi</h2>
          <p className="brand-sub">Sustainable E-Waste Management</p>

          <h1 className="main-heading">
            Turn Your <span>E-Waste</span> Into Environmental Impact
          </h1>

          <p className="main-sub">
            Join thousands of environmentally conscious users making a
            difference, one device at a time.
          </p>

          <div className="stats">
            <div className="stat-box">
              <h3>15K+</h3>
              <p>Devices Recycled</p>
            </div>
            <div className="stat-box">
              <h3>2.5K+</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-sub">Sign in to your account to continue</p>

          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="login-options">
              <label className="remember-label">
                <input type="checkbox" /> <span>Remember me</span>
              </label>

              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Sign in to your account
            </button>

            {error && <p className="error">{error}</p>}

            <p className="signup-text">
              Don&apos;t have an account?
              <a href="/register"> Create one here</a>
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}
