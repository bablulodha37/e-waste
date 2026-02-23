import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Register.css";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const body = {
      firstName,
      lastName,
      email,
      phone,
      password,
      pickupAddress,
    };

    try {
      await api("/api/auth/register", {
        method: "POST",
        body,
      });

      alert("Registration successful! You can now log in.");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError("Registration failed. Email might be already in use.");
    }
  };

  return (
    <div className="register-page">

      {/* LEFT GREEN PANEL */}
      <div className="register-left">
        <div className="register-left-inner">
          <h2 className="brand-title">EcoSaathi</h2>
          <p className="brand-sub">Sustainable E-Waste Management</p>

          <h1 className="main-heading">
            Join the <span>Eco Movement</span> & Recycle Responsibly
          </h1>

          <p className="main-sub">
            Create your account and start contributing to a greener future.
          </p>

          <div className="stats">
            <div className="stat-box">
              <h3>800+</h3>
              <p>New Recyclers</p>
            </div>
            <div className="stat-box">
              <h3>12K+</h3>
              <p>Pickups Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="register-right">
        <div className="register-card">
          <h2>Create Your Account</h2>
          <p className="register-sub">Join the EcoSaathi community</p>

          <form onSubmit={handleRegister}>

            {/* FIRST + LAST NAME ROW */}
            <div className="name-row">

              <div className="name-field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="user"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                
              </div>

              <div className="name-field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="lodha"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

            </div>

            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Phone Number</label>
            <input
              type="text"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Pickup Address</label>
            <textarea
              placeholder="Your default pickup address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
            ></textarea>

            <button type="submit" className="register-btn">
              Create Account
            </button>

            {error && <p className="error">{error}</p>}

            <p className="signup-text">
              Already have an account?
              <a href="/login"> Login here</a>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}
