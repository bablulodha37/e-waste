import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/EditProfile.css";
import "../css/UserDashboard.css";

// Icons for Sidebar
import {
  FaHome,
  FaUser,
  FaBoxOpen,
  FaHistory,
  FaCertificate,
  FaChartLine,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBell,
  FaTimes
} from "react-icons/fa";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pickupAddress: "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Dashboard state
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [notifications, setNotifications] = useState([]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        const data = await api(`/api/auth/user/${id}`);
        setUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          pickupAddress: data.pickupAddress || "",
          password: "",
          confirmPassword: ""
        });
        
        // Mock notifications
        const mockNotifications = [
          { id: 1, title: 'Profile Update', message: 'Remember to save your changes', time: '2 min ago', read: false },
          { id: 2, title: 'Security Alert', message: 'Profile settings updated successfully', time: '1 hour ago', read: true },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        pickupAddress: formData.pickupAddress
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await api(`/api/auth/user/${id}`, {
        method: "PUT",
        body: updateData
      });
      
      // Update localStorage with new data
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/profile/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar - Same as Dashboard */}
      <div className="dashboard-sidebar">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="user-info">
            <h4>{user?.firstName} {user?.lastName}</h4>
            <p>{user?.email}</p>
            <span className="user-role">Standard User</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to={`/dashboard/${id}`}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to={`/profile/${id}`}
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="nav-icon" />
            <span>My Profile</span>
          </Link>
          
          <Link 
            to={`/request/submit/${id}`}
            className={`nav-item ${activeTab === 'new-request' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-request')}
          >
            <FaBoxOpen className="nav-icon" />
            <span>New Request</span>
          </Link>
          
          <Link 
            to={`/profile/${id}/history`}
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="nav-icon" />
            <span>Request History</span>
          </Link>
          
          <Link 
            to={`/certificate/${id}`}
            className={`nav-item ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            <FaCertificate className="nav-icon" />
            <span>Certificates</span>
          </Link>
          
          <Link 
            to={`/report/${id}`}
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FaChartLine className="nav-icon" />
            <span>Reports</span>
          </Link>
          
          <div className="sidebar-divider"></div>
          
          <Link 
            to={`/profile/${id}/edit`}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
          
          <Link 
            to={`/support/${id}`}
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <FaQuestionCircle className="nav-icon" />
            <span>Help & Support</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout" 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="page-title">Edit Profile</h1>
            <p className="page-subtitle">
              Update your personal information and preferences
            </p>
          </div>

          <div className="topbar-right">
            <Link to={`/dashboard/${id}`} className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Edit Profile Content */}
        <main className="dashboard-content">
          <div className="edit-profile-page">
            <div className="edit-profile-container glass-card">
              {/* Form */}
              <form onSubmit={handleSubmit} className="edit-profile-form">
                {/* Personal Information Section */}
                <div className="form-group">
                  <label>
                    <span className="label-icon">👤</span>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your first name"
                    required
                  />
                  {errors.firstName && (
                    <span className="validation-message">⚠️ {errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">👥</span>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                  {errors.email && (
                    <span className="validation-message">⚠️ {errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">📱</span>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Address Section */}
                <div className="form-group full-width">
                  <label>
                    <span className="label-icon">📍</span>
                    Pickup Address
                  </label>
                  <textarea
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Enter your complete pickup address..."
                    rows="4"
                  />
                  <div className={`char-counter ${formData.pickupAddress.length > 200 ? 'warning' : ''}`}>
                    {formData.pickupAddress.length}/200 characters
                  </div>
                </div>

                {/* Password Section */}
                <div className="form-group full-width">
                  <div className="section-header">
                    <h4>Change Password (Optional)</h4>
                    <p className="section-subtitle">Leave blank to keep current password</p>
                  </div>
                  
                  <div className="password-fields">
                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔒</span>
                        New Password
                      </label>
                      <div className="password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="validation-message">⚠️ {errors.password}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">✅</span>
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Confirm new password"
                      />
                      {errors.confirmPassword && (
                        <span className="validation-message">⚠️ {errors.confirmPassword}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions full-width">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/profile/${id}`)}
                    disabled={saving}
                  >
                    <span className="btn-icon">←</span>
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💾</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {showSuccess && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  <span>Profile updated successfully!</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}