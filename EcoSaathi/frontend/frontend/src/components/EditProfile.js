import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/EditProfile.css";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    api(`/api/auth/user/${id}`).then((data) => {
      setEmail(data.email);
      setPhone(data.phone);
    });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const body = { email, phone };
    if (password) body.password = password;
    await api(`/api/auth/user/${id}`, { method: "PUT", body });
    navigate(`/profile/${id}`);
  };

  return (
    <div className="container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleUpdate}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input
          type="password"
          placeholder="New Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
