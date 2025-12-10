import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/RequestForm.css";
import "../css/UserDashboard.css";
import PhotoPreviewModal from "./PhotoPreviewModal";
import AddressAutocomplete from "./AddressAutocomplete";

// --- Sidebar Icons ---
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

// --- Constants ---
const customPhotoLabels = [
  "Top Side (Required)",
  "Bottom Side",
  "Front Side",
  "Back Side",
  "Side Wall",
];

const deviceConditions = [
  { value: "Working", label: "Working Condition", icon: "✅" },
  { value: "Damaged", label: "Damaged but Functional", icon: "⚠️" },
  { value: "Dead", label: "Not Working", icon: "❌" }
];

const deviceTypes = [
  { value: "Laptop", icon: "💻", category: "Computers" },
  { value: "Mobile", icon: "📱", category: "Phones" },
  { value: "T.V.", icon: "📺", category: "TVs" },
  { value: "Printer", icon: "🖨️", category: "Printers" },
  { value: "Motor", icon: "⚡", category: "Motors" },
  { value: "Monitor", icon: "🖥️", category: "Monitors" },
  { value: "Tablet", icon: "📟", category: "Tablets" },
  { value: "Camera", icon: "📷", category: "Cameras" },
  { value: "Router", icon: "📡", category: "Network" },
  { value: "Battery", icon: "🔋", category: "Batteries" },
  { value: "Keyboard", icon: "⌨️", category: "Accessories" },
  { value: "Speaker", icon: "🔊", category: "Audio" },
  { value: "Other", icon: "📦", category: "Others" }
];

const API_BASE_URL = "http://localhost:8080";

export default function RequestForm() {
  // --- 1. HOOKS ---
  const navigate = useNavigate();

  // --- Get User Data and Initial Values ---
  const [user, setUser] = useState(null);
  const initialAddress = user?.pickupAddress || "";

  // --- 2. STATE ---
  const [type, setType] = useState("Laptop");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState(initialAddress);
  const [files, setFiles] = useState([null, null, null, null, null]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('new-request');
  const [notifications, setNotifications] = useState([]);

  // New fields
  const [brandModel, setBrandModel] = useState("");
  const [condition, setCondition] = useState("Working");
  const [quantity, setQuantity] = useState(1);
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({});

  // --- 3. USER AUTHENTICATION & DATA LOADING ---
  useEffect(() => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    setPickupLocation(currentUser.pickupAddress || "");
    
    // Fetch notifications (mock)
    const mockNotifications = [
      { id: 1, title: 'New Feature', message: 'Request form updated with new features', time: '2 min ago', read: false },
      { id: 2, title: 'Guidelines', message: 'Check new photo upload guidelines', time: '10 min ago', read: true },
    ];
    setNotifications(mockNotifications);
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- 4. EARLY RETURN CHECK ---
  if (!user || !user.id) {
    return (
      <div className="request-form-error">
        <div className="error-container">
          <div className="error-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>Please log in to submit a request.</p>
          <button 
            className="login-redirect-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const userId = user.id;

  // --- Handlers ---
  const handleAddressChange = (address) => {
    setPickupLocation(address);
    setMessage("");
  };

  const handleFileChange = (e, index) => {
    const selectedFile = e.target.files[0];
    const newFiles = [...files];
    
    // Validate file size (max 5MB)
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setMessage("❌ File size must be less than 5MB");
      return;
    }
    
    newFiles[index] = selectedFile || null;
    setFiles(newFiles);
    setMessage("");
    
    // Simulate upload progress
    if (selectedFile) {
      setUploadProgress(prev => ({
        ...prev,
        [index]: { loading: true, progress: 0 }
      }));
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({
          ...prev,
          [index]: { loading: true, progress }
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(prev => ({
              ...prev,
              [index]: { loading: false, progress: 100 }
            }));
          }, 300);
        }
      }, 100);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handlePreview = (file) => {
    if (file) {
      setPreviewFile(URL.createObjectURL(file));
    }
  };

  const handleClosePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setPreviewFile(null);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!type || !brandModel.trim()) {
        setMessage("❌ Please select device type and enter brand/model");
        return;
      }
    }
    if (currentStep === 2) {
      if (!description.trim() || !pickupLocation.trim()) {
        setMessage("❌ Please provide description and pickup address");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
    setMessage("");
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const selectedFiles = files.filter((file) => file !== null);

    // Validation
    if (files[0] === null) {
      setMessage("❌ Top Side photo is required for submission.");
      setLoading(false);
      return;
    }

    if (!pickupLocation || pickupLocation.trim() === "") {
      setMessage("❌ Pickup location is required.");
      setLoading(false);
      return;
    }

    if (!description || description.trim() === "") {
      setMessage("❌ Item description is required.");
      setLoading(false);
      return;
    }

    if (!brandModel.trim()) {
      setMessage("❌ Brand & Model is required.");
      setLoading(false);
      return;
    }

    if (!quantity || quantity <= 0) {
      setMessage("❌ Please enter a valid quantity (minimum 1).");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("deviceType", type);
    formData.append("description", description);
    formData.append("pickupLocation", pickupLocation);
    formData.append("brandModel", brandModel);
    formData.append("condition", condition);
    formData.append("quantity", quantity);
    formData.append("additionalRemarks", additionalRemarks);

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/user/${userId}/request`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );
      
      setMessage("✅ Request submitted successfully! We will schedule it soon.");
      
      // Reset form
      setTimeout(() => {
        setDescription("");
        setBrandModel("");
        setCondition("Working");
        setQuantity(1);
        setAdditionalRemarks("");
        setFiles([null, null, null, null, null]);
        setCurrentStep(1);
        
        setTimeout(() => {
          navigate(`/profile/${userId}/history`);
        }, 2000);
      }, 1500);
      
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit request. Check file size or server status.";
      setMessage(`❌ ${errorMessage}`);
      console.error("Request submission error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDeviceIcon = () => {
    const device = deviceTypes.find(d => d.value === type);
    return device ? device.icon : "📦";
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar - Same as Dashboard */}
      <div className="dashboard-sidebar">
       
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="user-info">
            <h4>{user.firstName} {user.lastName}</h4>
            <p>{user.email}</p>
            <span className="user-role">Standard User</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to={`/dashboard/${userId}`}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to={`/profile/${userId}`}
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="nav-icon" />
            <span>My Profile</span>
          </Link>
          
          <Link 
            to={`/request/submit/${userId}`}
            className={`nav-item ${activeTab === 'new-request' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-request')}
          >
            <FaBoxOpen className="nav-icon" />
            <span>New Request</span>
          </Link>
          
          <Link 
            to={`/profile/${userId}/history`}
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="nav-icon" />
            <span>Request History</span>
          </Link>
          
          <Link 
            to={`/certificate/${userId}`}
            className={`nav-item ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            <FaCertificate className="nav-icon" />
            <span>Certificates</span>
          </Link>
          
          <Link 
            to={`/report/${userId}`}
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FaChartLine className="nav-icon" />
            <span>Reports</span>
          </Link>
          
          <div className="sidebar-divider"></div>
          
         <Link 
  to={`/profile/${userId}/edit`}
  className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
  onClick={() => setActiveTab('settings')}
>
  <FaCog className="nav-icon" />
  <span>Settings</span>
</Link>
          <Link 
            to={`/support/${userId}`}
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
            <h1 className="page-title">Submit E-Waste Pickup Request</h1>
            <p className="page-subtitle">
              Fill in the details below to schedule your e-waste pickup
            </p>
          </div>

          <div className="topbar-right">
           <Link to={`/dashboard/${userId}`} className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Request Form Content */}
        <main className="dashboard-content">
          <div className="request-form-container glass-card">
            {previewFile && (
              <PhotoPreviewModal imageUrl={previewFile} onClose={handleClosePreview} />
            )}

            {/* Progress Stepper */}
            <div className="form-stepper">
              <div className="stepper-progress">
                <div 
                  className="stepper-progress-bar" 
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                ></div>
              </div>
              <div className="stepper-steps">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step} 
                    className={`stepper-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
                  >
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                      {step === 1 ? "Device Details" : step === 2 ? "Description" : "Photos"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
              
              {/* Step 1: Device Details */}
              {currentStep === 1 && (
                <div className="form-step slide-in">
                  <div className="step-header">
                    <span className="step-icon">💻</span>
                    <h3>Device Information</h3>
                    <p className="step-description">Tell us about the device you want to recycle</p>
                  </div>

                  {/* Device Type Selection */}
                  <div className="form-section">
                    <label className="section-label">
                      <span className="label-icon">📱</span>
                      Select Device Type
                    </label>
                    <div className="device-type-grid">
                      {deviceTypes.map((device) => (
                        <button
                          key={device.value}
                          type="button"
                          className={`device-type-card ${type === device.value ? 'selected' : ''}`}
                          onClick={() => setType(device.value)}
                        >
                          <span className="device-icon">{device.icon}</span>
                          <span className="device-name">{device.value}</span>
                          <span className="device-category">{device.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand & Model */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🏷️</span>
                      Brand & Model
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        value={brandModel}
                        onChange={(e) => setBrandModel(e.target.value)}
                        placeholder="e.g., Dell Inspiron 5520, Samsung S21, LG 42-inch LED"
                        required
                        className="modern-input"
                      />
                      <span className="input-icon">💡</span>
                    </div>
                    <p className="input-hint">Please provide exact model if possible</p>
                  </div>

                  {/* Condition & Quantity Row */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>
                        <span className="label-icon">📊</span>
                        Condition
                      </label>
                      <div className="condition-buttons">
                        {deviceConditions.map((cond) => (
                          <button
                            key={cond.value}
                            type="button"
                            className={`condition-btn ${condition === cond.value ? 'selected' : ''}`}
                            onClick={() => setCondition(cond.value)}
                          >
                            <span className="condition-icon">{cond.icon}</span>
                            <span className="condition-label">{cond.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔢</span>
                        Quantity
                      </label>
                      <div className="quantity-selector">
                        <button 
                          type="button" 
                          className="quantity-btn"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        >
                          −
                        </button>
                        <div className="quantity-display">
                          <span className="quantity-value">{quantity}</span>
                          <span className="quantity-unit">item(s)</span>
                        </div>
                        <button 
                          type="button" 
                          className="quantity-btn"
                          onClick={() => setQuantity(prev => prev + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Description & Address */}
              {currentStep === 2 && (
                <div className="form-step slide-in">
                  <div className="step-header">
                    <span className="step-icon">📝</span>
                    <h3>Description & Location</h3>
                    <p className="step-description">Provide details and pickup location</p>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📋</span>
                      Detailed Description
                    </label>
                    <div className="textarea-container">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the items, accessories, any damage, special handling requirements, etc."
                        required
                        className="modern-textarea"
                        rows="4"
                      />
                      <div className="textarea-footer">
                        <span className="char-count">{description.length}/500</span>
                        <span className="char-hint">Include all relevant details</span>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📍</span>
                      Pickup Address
                    </label>
                    <div className="address-input-container">
                      <AddressAutocomplete
                        initialValue={pickupLocation}
                        onPlaceSelect={handleAddressChange}
                        placeholder="Search for pickup address..."
                      />
                      <div className="address-hint">
                        <span className="hint-icon">💡</span>
                        We'll use this address for scheduling pickup
                      </div>
                    </div>
                  </div>

                  {/* Additional Remarks */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📝</span>
                      Additional Instructions
                    </label>
                    <textarea
                      value={additionalRemarks}
                      onChange={(e) => setAdditionalRemarks(e.target.value)}
                      placeholder="Any special instructions for pickup partner (landmark, floor, timing, contact person, etc.)"
                      className="modern-textarea remarks"
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {currentStep === 3 && (
                <div className="form-step slide-in">
                  <div className="step-header">
                    <span className="step-icon">📸</span>
                    <h3>Upload Photos</h3>
                    <p className="step-description">Photos help us assess the condition</p>
                  </div>

                  {/* Selected Device Preview */}
                  <div className="selected-device-preview">
                    <div className="preview-card">
                      <div className="preview-icon">{getSelectedDeviceIcon()}</div>
                      <div className="preview-details">
                        <h4>{type}</h4>
                        <p>{brandModel || "No brand/model specified"}</p>
                        <div className="preview-tags">
                          <span className="preview-tag condition">{condition}</span>
                          <span className="preview-tag quantity">{quantity} item(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="photo-upload-section-modern">
                    <div className="upload-header">
                      <h4>Upload Device Photos</h4>
                      <p className="upload-hint">Upload clear photos from different angles</p>
                    </div>
                    
                    <div className="photo-grid">
                      {files.map((file, index) => (
                        <div key={index} className="photo-upload-card">
                          <div className="photo-label">
                            <span className="photo-icon">📷</span>
                            {customPhotoLabels[index]}
                          </div>
                          
                          {file ? (
                            <div className="photo-preview">
                              <div className="preview-image">
                                <div className="image-placeholder">
                                  <span className="image-icon">🖼️</span>
                                  <span className="file-name">{file.name}</span>
                                </div>
                                {uploadProgress[index]?.loading && (
                                  <div className="upload-progress">
                                    <div 
                                      className="progress-bar" 
                                      style={{ width: `${uploadProgress[index].progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                              <div className="photo-actions">
                                <button
                                  type="button"
                                  className="action-btn preview"
                                  onClick={() => handlePreview(file)}
                                >
                                  👁️ Preview
                                </button>
                                <button
                                  type="button"
                                  className="action-btn remove"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="upload-area" htmlFor={`file-${index + 1}`}>
                              <input
                                id={`file-${index + 1}`}
                                type="file"
                                accept="image/*"
                                required={index === 0}
                                onChange={(e) => handleFileChange(e, index)}
                                className="file-input-hidden"
                              />
                              <div className="upload-placeholder">
                                <span className="upload-icon">⬆️</span>
                                <span className="upload-text">Click to upload</span>
                                <span className="upload-subtext">Max 5MB • JPEG, PNG</span>
                              </div>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="upload-stats">
                      <div className="stat">
                        <span className="stat-value">{files.filter(f => f).length}</span>
                        <span className="stat-label">Photos Uploaded</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">5</span>
                        <span className="stat-label">Max Photos</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">5MB</span>
                        <span className="stat-label">Max per file</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="nav-btn prev-btn"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    ← Previous
                  </button>
                )}
                
                <div className="nav-right">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="nav-btn next-btn"
                      onClick={handleNextStep}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {message && (
                <div className={`form-message ${message.startsWith("✅") ? 'success' : 'error'}`}>
                  <span className="message-icon">
                    {message.startsWith("✅") ? "✅" : "❌"}
                  </span>
                  <span className="message-text">{message}</span>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}