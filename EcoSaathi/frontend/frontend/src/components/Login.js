import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("user", JSON.stringify(user));

      if (user.isAdmin) navigate("/admin");
      else navigate(`/Dashboard/${user.id}`);
    } catch (err) {
      setError("Invalid credentials or server error");
      console.error(err);
    }
  };

  return (
    <div className="login-wrapper">
      {/* 🌳 Animated Tree (SVG, no PNG) */}
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

      {/* 🌿 Login Box */}
      <div className="container fadeIn">
        <h2>Welcome Back 🌱</h2>
        <p className="tagline">Sign in and grow with nature</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
