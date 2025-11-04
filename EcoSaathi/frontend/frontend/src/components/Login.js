// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Assuming 'api' returns the full user object including 'isAdmin'
      const user = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      
      // Store user object (must contain the isAdmin flag)
      localStorage.setItem("user", JSON.stringify(user));
      
      // Check for Admin role and redirect
      if (user.isAdmin) {
        navigate("/admin"); // Redirect admin to the Admin Dashboard
      } else {
        navigate(`/profile/${user.id}`); // Redirect regular user to their profile
      }
      
    } catch (err) {
      setError("Invalid credentials or server error");
      console.error(err);
    }
  };

 return (
<div className="container">
<h2>Sign In</h2> {/* Changed to Sign In to match image */}
<form onSubmit={handleLogin}>
<input
 type="email"
 placeholder="Username" // Changed to Username to match image (though using email state)
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 <input
 type="password"
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 />
        
        {/* 🆕 Image में दिखाए गए Forgot Password/Signup लिंक्स */}
        <div className="link-group">
            <a href="/forgot-password">Forgot Password</a>
            <a href="/register">Signup</a> 
        </div>

 <button type="submit">Sing In</button>
 {error && <p className="error">{error}</p>}
 </form>
 </div>
 );
}