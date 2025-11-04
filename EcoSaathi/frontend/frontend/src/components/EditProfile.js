import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/EditProfile.css";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Variables for name and address
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Fetch current user details
    api(`/api/auth/user/${id}`).then((data) => {
      setFirstName(data.firstName || ""); // Handle potential null/undefined
      setLastName(data.lastName || "");
      setPickupAddress(data.pickupAddress || "");
      setEmail(data.email);
      setPhone(data.phone);
    });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const body = { 
        firstName, 
        lastName,
        pickupAddress, 
        email, 
        phone 
    };
    if (password) body.password = password;
    
    await api(`/api/auth/user/${id}`, { method: "PUT", body });
    alert("Profile updated successfully!");
    navigate(`/profile/${id}`);
  };

  return (
    <div className="container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleUpdate}>
        {/*Name Fields */}
        <input 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder="First Name"
        />
        <input 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder="Last Name"
        />
        {/* Pickup Address Field */}
        <textarea 
            value={pickupAddress} 
            onChange={(e) => setPickupAddress(e.target.value)} 
            placeholder="Pickup Address"
        ></textarea>
        
        {/* Existing Fields */}
        <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email"
        />
        <input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Phone"
        />
        
        {/* Password */}
        <input
          type="password"
          placeholder="New Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}