import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/RequestHistory.css";
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
  FaBars,
  FaTimes,
  FaCalendarAlt,
  FaEnvelope,
  FaTruck,
  FaRecycle
} from "react-icons/fa";

export default function RequestHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Main state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);
  
  // Dashboard state
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [notifications, setNotifications] = useState([]);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    scheduled: 0,
    completed: 0,
    rejected: 0
  });

  // Order of flow steps
  const flowSteps = ["PENDING", "APPROVED", "SCHEDULED", "COMPLETED"];

  // Fetch user data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Mock notifications
    const mockNotifications = [
      { id: 1, title: 'Request Update', message: 'Your request #123 is now approved', time: '5 min ago', read: false },
      { id: 2, title: 'Pickup Scheduled', message: 'Pickup scheduled for tomorrow', time: '2 hours ago', read: true },
    ];
    setNotifications(mockNotifications);
  }, [navigate]);

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api(`/api/auth/user/${id}/requests`);
        setRequests(data);
        
        // Calculate stats
        const statsData = {
          total: data.length,
          pending: data.filter(r => r.status === "PENDING").length,
          approved: data.filter(r => r.status === "APPROVED").length,
          scheduled: data.filter(r => r.status === "SCHEDULED").length,
          completed: data.filter(r => r.status === "COMPLETED").length,
          rejected: data.filter(r => r.status === "REJECTED").length
        };
        setStats(statsData);
      } catch (err) {
        setError("Failed to load request history.");
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequests();
  }, [id]);

  const toggleExpand = (reqId) => {
    setExpandedId(expandedId === reqId ? null : reqId);
  };

  const filteredRequests = requests.filter(
    (req) => filterStatus === "ALL" || req.status === filterStatus
  );

  // 👉 Stepper ke liye class decide karna
  const getFlowClass = (step) => {
    const base = "flow-step";

    if (!expandedId) return `${base} flow-step-upcoming`;

    const activeReq = filteredRequests.find((r) => r.id === expandedId);
    const activeStatus = activeReq?.status?.toUpperCase() || "";

    const currentIndex = flowSteps.indexOf(activeStatus);
    const stepIndex = flowSteps.indexOf(step.toUpperCase());

    if (stepIndex === -1) return base;

    if (stepIndex < currentIndex) return `${base} flow-step-completed`;
    if (stepIndex === currentIndex) return `${base} flow-step-current`;
    return `${base} flow-step-upcoming`;
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'scheduled': return '📅';
      case 'completed': return '🎯';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'scheduled': return '#6366f1';
      case 'completed': return '#8b5cf6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDeviceIcon = (type) => {
    const deviceIcons = {
      'laptop': '💻',
      'mobile': '📱',
      't.v.': '📺',
      'printer': '🖨️',
      'motor': '⚡',
      'monitor': '🖥️',
      'tablet': '📟',
      'camera': '📷',
      'router': '📡',
      'battery': '🔋',
      'keyboard': '⌨️',
      'speaker': '🔊',
      'other': '📦'
    };
    return deviceIcons[type?.toLowerCase()] || '📦';
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
        <p>Loading your request history...</p>
      </div>
    );
  }

  if (error) return <div className="request-history-error">{error}</div>;
  
  if (!user) return null;

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
            <span className="badge">{stats.pending || 0}</span>
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
            <h1 className="page-title">Request History</h1>
            <p className="page-subtitle">
              Track and manage all your e-waste pickup requests
            </p>
          </div>

          <div className="topbar-right">
   <Link to={`/request/submit/${id}`} className="btn btn-primary">
              <FaBoxOpen className="mr-2" /> New Request
            </Link>
          </div>
        </header>

        {/* Request History Content */}
        <main className="dashboard-content">
          <div className="request-history-modern">
            {/* Stats Cards */}
            <div className="stats-grid-modern">
              <div className="stat-card glass-card">
                <div className="stat-icon-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                  ⏳
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.pending}</div>
                  <div className="stat-name">Pending</div>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon-card" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                  ✅
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.approved}</div>
                  <div className="stat-name">Approved</div>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon-card" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
                  📅
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.scheduled}</div>
                  <div className="stat-name">Scheduled</div>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon-card" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  🎯
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.completed}</div>
                  <div className="stat-name">Completed</div>
                </div>
              </div>
            </div>

            <div className="history-main-container">
              {/* LEFT — REQUEST LIST */}
              <div className="request-list-container-modern glass-card">
                <div className="list-header">
                  <h2>Your Requests ({filteredRequests.length})</h2>
                  <div className="header-controls">
                    <div className="filter-section">
                      <span className="filter-label">Filter by Status:</span>
                      <div className="status-filter-buttons">
                        <button
                          className={`filter-btn ${filterStatus === "ALL" ? 'active' : ''}`}
                          onClick={() => setFilterStatus("ALL")}
                        >
                          All ({stats.total})
                        </button>
                        <button
                          className={`filter-btn ${filterStatus === "PENDING" ? 'active' : ''}`}
                          onClick={() => setFilterStatus("PENDING")}
                        >
                          Pending ({stats.pending})
                        </button>
                        <button
                          className={`filter-btn ${filterStatus === "APPROVED" ? 'active' : ''}`}
                          onClick={() => setFilterStatus("APPROVED")}
                        >
                          Approved ({stats.approved})
                        </button>
                        <button
                          className={`filter-btn ${filterStatus === "SCHEDULED" ? 'active' : ''}`}
                          onClick={() => setFilterStatus("SCHEDULED")}
                        >
                          Scheduled ({stats.scheduled})
                        </button>
                        <button
                          className={`filter-btn ${filterStatus === "COMPLETED" ? 'active' : ''}`}
                          onClick={() => setFilterStatus("COMPLETED")}
                        >
                          Completed ({stats.completed})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REQUEST CARD GRID */}
                <div className="request-card-grid-modern">
                  {filteredRequests.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h3>No requests found</h3>
                      <p>{filterStatus === "ALL" 
                        ? "You haven't submitted any requests yet." 
                        : `No ${filterStatus.toLowerCase()} requests found.`}
                      </p>
                      <Link to={`/request/submit/${id}`} className="btn btn-primary">
                        <FaBoxOpen className="mr-2" /> Submit Your First Request
                      </Link>
                    </div>
                  ) : (
                    filteredRequests.map((req) => (
                      <div
                        key={req.id}
                        className={`request-card-modern ${expandedId === req.id ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(req.id)}
                      >
                        <div className="card-header-modern">
                          <div className="card-header-left">
                            <div className="device-icon">
                              {getDeviceIcon(req.deviceType || req.type)}
                            </div>
                            <div className="card-title">
                              <h3>{req.deviceType || req.type}</h3>
                              <p className="req-date">
                                {new Date(req.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="card-header-right">
                            <div 
                              className="status-badge-modern"
                              style={{ 
                                backgroundColor: getStatusColor(req.status) + '20',
                                color: getStatusColor(req.status)
                              }}
                            >
                              <span className="status-icon">{getStatusIcon(req.status)}</span>
                              {req.status}
                            </div>
                            <div className="request-id">ID: #{req.id}</div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === req.id && (
                          <div className="card-details-modern">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">📱 Brand & Model</span>
                                <span className="detail-value">{req.brandModel || "N/A"}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">⚡ Condition</span>
                                <span className="detail-value">{req.condition || "N/A"}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">🔢 Quantity</span>
                                <span className="detail-value">{req.quantity || 1}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">📍 Pickup Location</span>
                                <span className="detail-value">{req.pickupLocation}</span>
                              </div>
                            </div>

                            <div className="description-section">
                              <h4>Description</h4>
                              <p>{req.description}</p>
                            </div>

                            {req.additionalRemarks && (
                              <div className="remarks-section">
                                <h4>Additional Remarks</h4>
                                <p>{req.additionalRemarks}</p>
                              </div>
                            )}

                            {/* Pickup Information */}
                            <div className="pickup-info">
                              <h4>Pickup Information</h4>
                              <div className="info-grid">
                                <div className="info-item">
                                  <span className="info-label">🗓️ Scheduled Time</span>
                                  <span className="info-value">
                                    {req.scheduledTime
                                      ? new Date(req.scheduledTime).toLocaleString()
                                      : "Not Scheduled"}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">👤 Pickup Person</span>
                                  <span className="info-value">
                                    {req.assignedPickupPerson
                                      ? `${req.assignedPickupPerson.name} (${req.assignedPickupPerson.phone})`
                                      : "Not Assigned"}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">🔑 Pickup OTP</span>
                                  <span className="info-value otp">
                                    {req.pickupOtp || "Not generated yet"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Photos Gallery */}
                            {req.photoUrls && req.photoUrls.length > 0 && (
                              <div className="photos-section">
                                <h4>Uploaded Photos ({req.photoUrls.length})</h4>
                                <div className="photo-gallery">
                                  {req.photoUrls.map((img, i) => (
                                    <div key={i} className="photo-thumbnail">
                                      <img
                                        src={img}
                                        alt={`photo-${i}`}
                                        className="gallery-image"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(img, '_blank');
                                        }}
                                      />
                                      <div className="photo-overlay">View</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="card-actions">
                              {req.status === "SCHEDULED" && (
                                <button
                                  className="track-btn-modern"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/track/pickup/${req.id}`, "_blank");
                                  }}
                                >
                                  <span className="btn-icon">🚚</span>
                                  Track Pickup
                                </button>
                              )}
                              <button
                                className="details-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('View full details for', req.id);
                                }}
                              >
                                <span className="btn-icon">📄</span>
                                View Full Details
                              </button>
                              {(req.status === "PENDING" || req.status === "APPROVED") && (
                                <button
                                  className="cancel-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Cancel request', req.id);
                                  }}
                                >
                                  <span className="btn-icon">❌</span>
                                  Cancel Request
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT — FLOW CHART (Stepper style like screenshot) */}
              <div className="flow-sidebar-modern glass-card">
                <div className="sidebar-header">
                  <h3>Request Progress</h3>
                  <p className="sidebar-subtitle">Track your request status</p>
                </div>

                <div className="flow-chart-modern">
                  {flowSteps.map((step, index) => (
                    <div key={step} className={getFlowClass(step)}>
                      <div className="flow-step-circle">
                        <span className="step-number">{index + 1}</span>
                      </div>
                      <div className="flow-step-content">
                        <div className="step-title">
                          {step === "PENDING" && "Request Submitted"}
                          {step === "APPROVED" && "Request Approved"}
                          {step === "SCHEDULED" && "Pickup Scheduled"}
                          {step === "COMPLETED" && "Pickup Completed"}
                        </div>
                        <div className="step-description">
                          {step === "PENDING" && "We've received your request"}
                          {step === "APPROVED" && "Your request is approved"}
                          {step === "SCHEDULED" && "Pickup is scheduled"}
                          {step === "COMPLETED" && "Pickup completed successfully"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {expandedId && (
                  <div className="active-request-status">
                    <div className="status-header">
                      <span className="status-label">Current Status</span>
                      <span className="status-indicator">●</span>
                    </div>
                    <div className="current-status-display">
                      {getStatusIcon(filteredRequests.find((r) => r.id === expandedId)?.status)}
                      <span className="status-text">
                        {filteredRequests.find((r) => r.id === expandedId)?.status}
                      </span>
                    </div>
                    <p className="status-message">
                      {filteredRequests.find((r) => r.id === expandedId)?.status === "PENDING" && 
                        "Your request is under review. We'll update you soon."}
                      {filteredRequests.find((r) => r.id === expandedId)?.status === "APPROVED" && 
                        "Your request is approved! We'll schedule pickup soon."}
                      {filteredRequests.find((r) => r.id === expandedId)?.status === "SCHEDULED" && 
                        "Pickup is scheduled. Track your pickup real-time."}
                      {filteredRequests.find((r) => r.id === expandedId)?.status === "COMPLETED" && 
                        "Pickup completed successfully. Thank you for recycling!"}
                      {filteredRequests.find((r) => r.id === expandedId)?.status === "REJECTED" && 
                        "Your request was rejected. Please contact support."}
                    </p>
                  </div>
                )}

                <div className="sidebar-footer">
                  <div className="help-section">
                    <h4>Need Help?</h4>
                    <p>Contact our support team for assistance</p>
                    <button className="support-btn">
                      <span className="btn-icon">🛠️</span>
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}