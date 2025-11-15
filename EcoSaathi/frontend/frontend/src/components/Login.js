import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Login.css";
import axios from "axios";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let user = null;

      // 1️⃣ Try to login as Pickup Person (using email)
      try {
        const pickupResponse = await axios.post(
          `http://localhost:8080/api/pickup/login?email=${emailOrPhone}&password=${password}`
        );
        if (pickupResponse.data && pickupResponse.data.id) {
          user = pickupResponse.data;
          user.role = "PICKUP_PERSON";
        }
      } catch {
        // ignore if not found, try next
      }

      // 2️⃣ Try to login as Normal User/Admin (backend /api/auth/login)
      if (!user) {
        user = await api("/api/auth/login", {
          method: "POST",
          body: { email: emailOrPhone, password },
        });
      }

      if (!user) throw new Error("Invalid credentials");

      // ✅ Save user to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect based on role
      if (user.role === "ADMIN" || user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "PICKUP_PERSON") {
        navigate(`/pickup-dashboard/${user.id}`);
      } else {
        navigate(`/dashboard/${user.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="tree-container">
        <svg
          className={`tree-svg ${isPasswordFocused ? "sleep" : "watch"}`}
          viewBox="0 0 200 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="90" y="160" width="20" height="80" rx="5" fill="#6B4F3B" />
          <circle cx="100" cy="120" r="60" fill="#2E8B57" />
          <circle cx="60" cy="110" r="45" fill="#3CB371" />
          <circle cx="140" cy="110" r="45" fill="#3CB371" />
          <circle cx="100" cy="70" r="35" fill="#2E8B57" />
          <g className="eyes">
            <circle cx="80" cy="120" r="6" fill="#000" />
            <circle cx="120" cy="120" r="6" fill="#000" />
          </g>
          <g className="eyes-closed">
            <path d="M74,120 q6,4 12,0" stroke="#000" strokeWidth="2" fill="none" />
            <path d="M114,120 q6,4 12,0" stroke="#000" strokeWidth="2" fill="none" />
          </g>
          <path
            d="M85 140 q15 10 30 0"
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="container fadeIn">
        <h2>Welcome Back 🌱</h2>
        <p className="tagline">Sign in with your email (User, Admin, or Pickup Person)</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            onFocus={() => setIsPasswordFocused(false)}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            onFocus={() => setIsPasswordFocused(true)}
          />

          <div className="link-group">
            <a href="/forgot-password">Forgot Password?</a>
            <a href="/register">Create Account</a>
          </div>

          <button type="submit">Sign In</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
