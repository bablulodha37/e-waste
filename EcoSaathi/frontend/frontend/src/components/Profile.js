import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../css/Profile.css";
// new components we will create
import RequestForm from "./RequestForm"; 
import RequestHistory from "./RequestHistory"; 
import ProfilePictureUploader from "./ProfilePictureUploader";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'submit' | 'history'

  const fetchUser = () => {
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (!user) return <div className="container">Loading...</div>;

  const renderContent = () => {
      switch (activeTab) {
          case 'details':
              return (
                  <div className="profile-details-card">
                      <h3>User Details</h3>
                      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <p><strong>Verified:</strong> {user.verified ? '✅ Yes' : '❌ No'}</p>
                      <p>
                          <strong>Default Pickup Address:</strong> 
                          <span className="address-text">{user.pickupAddress}</span>
                      </p>
                      <button className="edit-btn" onClick={() => navigate(`/profile/${id}/edit`)}>
                          Edit Profile Details
                      </button>
                  </div>
              );
          case 'submit':
              // Pass the user ID and default address to the form
              return <RequestForm userId={user.id} defaultAddress={user.pickupAddress} />;
          case 'history':
              return <RequestHistory userId={user.id} />;
          default:
              return null;
      }
  };


  return (
    <div className="container profile-container">
      <h2>Welcome, {user.firstName || user.email}!</h2>
      
      <div className="profile-header-section">
          <ProfilePictureUploader 
              userId={user.id} 
              currentUrl={user.profilePictureUrl} 
              onUploadSuccess={fetchUser} 
          />
      </div>

      <div className="profile-tabs">
          <button 
              className={activeTab === 'details' ? 'active' : ''} 
              onClick={() => setActiveTab('details')}>
              My Details
          </button>
          <button 
              className={activeTab === 'submit' ? 'active' : ''} 
              onClick={() => setActiveTab('submit')}>
              Submit New Request
          </button>
          <button 
              className={activeTab === 'history' ? 'active' : ''} 
              onClick={() => setActiveTab('history')}>
              Request History
          </button>
      </div>
      
      <div className="profile-content-area">
          {renderContent()}
      </div>
    </div>
  );
}