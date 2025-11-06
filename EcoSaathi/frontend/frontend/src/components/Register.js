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
    setError(""); // Clear previous errors

    //  the registration body
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

      // ✅ UPDATED: Registration successful message (No OTP mentioned)
      alert("Registration successful! You can now log in.");

      // 🚀 KEY CHANGE: Go to the login page directly
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError("Registration failed. Email might be already in use.");
    }
  };

  return (
    <div className="container">
      <h2>Create an account</h2>
      <form onSubmit={handleRegister}>
        {/* Name Fields */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {/* Existing Fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Pickup Address */}
        <textarea
          placeholder="Default Pickup Address"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          required
        ></textarea>

        <button type="submit">Create</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}