import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PickupProfile.css";

export default function PickupProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/pickup/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Error fetching pickup profile:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pickup-profile">Loading profile...</div>;
  if (!profile) return <div className="pickup-profile">Profile not found</div>;

  return (
    <div className="pickup-profile">
      <h2>👤 Pickup Person Profile</h2>
      <div className="profile-card">
        <p><strong>ID:</strong> {profile.id}</p>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <hr/>
        <h4>Vehicle Details</h4>
        <p><strong>Type:</strong> {profile.vehicleType || "N/A"}</p>
        <p><strong>Number:</strong> {profile.vehicleNumber || "N/A"}</p>
      </div>
    </div>
  );
}