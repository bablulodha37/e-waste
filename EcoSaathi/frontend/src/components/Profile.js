import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Profile.css";
import ProfilePictureUploader from "./ProfilePictureUploader";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiXCircle, FiEdit2, FiLogOut } from "react-icons/fi";

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        setLoading(true);
        api(`/api/auth/user/${id}`)
            .then(setUser)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) return (
        <div className="container">
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        </div>
    );

    if (!user) return <div className="container">User not found</div>;

    const renderDetails = () => {
        return (
            <div className="profile-details-card">
                <div className="card-header">
                    <h3>User Details</h3>
                    <div className="verification-badge">
                        {user.verified ? (
                            <span className="verified-badge">
                                <FiCheckCircle /> Verified Account
                            </span>
                        ) : (
                            <span className="unverified-badge">
                                <FiXCircle /> Unverified Account
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="details-grid">
                    <div className="detail-item">
                        <div className="detail-icon">
                            <FiUser />
                        </div>
                        <div className="detail-content">
                            <label>Full Name</label>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <div className="detail-icon">
                            <FiMail />
                        </div>
                        <div className="detail-content">
                            <label>Email Address</label>
                            <p>{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <div className="detail-icon">
                            <FiPhone />
                        </div>
                        <div className="detail-content">
                            <label>Phone Number</label>
                            <p>{user.phone || "Not provided"}</p>
                        </div>
                    </div>
                    
                    <div className="detail-item">
                        <div className="detail-icon">
                            <FiMapPin />
                        </div>
                        <div className="detail-content">
                            <label>Pickup Address</label>
                            <p className="address-text">{user.pickupAddress || "Not specified"}</p>
                        </div>
                    </div>
                </div>
                
                <div className="profile-actions">
                    <button className="edit-btn" onClick={() => navigate(`/profile/${id}/edit`)}>
                        <FiEdit2 /> Edit Profile
                    </button>
                    <button className="logout-profile-btn" onClick={logout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container profile-container">
            <div className="profile-header">
                <div className="profile-info">
                    <h1>{user.firstName || user.email}'s Profile</h1>
                    <p className="profile-subtitle">Manage your account information and preferences</p>
                </div>
            </div>
            
            <div className="profile-content">
                <div className="profile-left">
                    <div className="profile-card picture-card">
                        <h3>Profile Picture</h3>
                        <ProfilePictureUploader
                            userId={user.id}
                            currentUrl={user.profilePictureUrl}
                            onUploadSuccess={fetchUser}
                        />
                    </div>
                </div>
                
                <div className="profile-right">
                    {renderDetails()}
                </div>
            </div>
        </div>
    );
}