import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Profile.css";
import ProfilePictureUploader from "./ProfilePictureUploader";

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const fetchUser = () => {
        api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    if (!user) return <div className="container">Loading...</div>;

    const renderDetails = () => {
        return (
            <div className="profile-details-card">
                <h3>User Details</h3>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Verified:</strong> {user.verified ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Address:</strong> {user.pickupAddress}</p>
                <div className="profile-actions">
                    <button className="edit-btn" onClick={() => navigate(`/profile/${id}/edit`)}>Edit Profile</button>
                    <button className="logout-profile-btn" onClick={logout}>Logout</button>
                </div>
            </div>
        );
    };

    return (
        <div className="container profile-container">
            <h2>Profile Details for {user.firstName || user.email}</h2>
            <div className="profile-header-section">
                <ProfilePictureUploader
                    userId={user.id}
                    currentUrl={user.profilePictureUrl}
                    onUploadSuccess={fetchUser}
                />
            </div>
            <div className="profile-content-area">
                {renderDetails()}
            </div>
        </div>
    );
}
