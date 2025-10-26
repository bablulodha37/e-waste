import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Profile.css";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>User Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Verified:</strong> {String(user.verified)}</p>
      <button onClick={() => navigate(`/profile/${id}/edit`)}>Edit</button>
    </div>
  );
}
