import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiPackage,
  FiEye,
  FiNavigation,
  FiChevronRight,
  FiDownload,
  FiMoreVertical
} from "react-icons/fi";
import {
  TbPackage,
  TbCalendarTime,
  TbMapPin,
  TbUserCircle,
  TbClock,
  TbChevronRight
} from "react-icons/tb";
import "../css/PickupRequestManagement.css";

export default function PickupRequestManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0
  });

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/${id}/requests`);
      setRequests(res.data);
      
      // Calculate stats
      const stats = {
        total: res.data.length,
        pending: res.data.filter(r => r.status.toLowerCase() === "pending").length,
        scheduled: res.data.filter(r => r.status.toLowerCase() === "scheduled").length,
        inProgress: res.data.filter(r => r.status.toLowerCase() === "in_progress").length,
        completed: res.data.filter(r => r.status.toLowerCase() === "completed").length
      };
      setStats(stats);
      
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const completeRequest = (requestId) => {
    navigate(`/pickup/verify-otp/${requestId}`);
  };

  const viewRequestDetails = (requestId) => {
    navigate(`/pickup/request/${requestId}`);
  };

  const getStatusConfig = (status) => {
    const statusLower = status.toLowerCase();
    const configs = {
      pending: {
        icon: <FiClock className="status-icon" />,
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        label: "Pending"
      },
      approved: {
        icon: <FiCheckCircle className="status-icon" />,
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        label: "Approved"
      },
      scheduled: {
        icon: <FiCalendar className="status-icon" />,
        color: "#8B5CF6",
        bgColor: "#F5F3FF",
        label: "Scheduled"
      },
      completed: {
        icon: <FiCheckCircle className="status-icon" />,
        color: "#10B981",
        bgColor: "#ECFDF5",
        label: "Completed"
      },
      rejected: {
        icon: <FiAlertCircle className="status-icon" />,
        color: "#EF4444",
        bgColor: "#FEF2F2",
        label: "Rejected"
      },
      in_progress: {
        icon: <FiTruck className="status-icon" />,
        color: "#F97316",
        bgColor: "#FFF7ED",
        label: "In Progress"
      }
    };
    return configs[statusLower] || {
      icon: <TbPackage className="status-icon" />,
      color: "#6B7280",
      bgColor: "#F9FAFB",
      label: status.replace('_', ' ')
    };
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Apply filter
    if (filter !== "all") {
      result = result.filter(req => req.status.toLowerCase() === filter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(req => 
        req.user?.firstName?.toLowerCase().includes(query) ||
        req.user?.lastName?.toLowerCase().includes(query) ||
        req.pickupLocation?.toLowerCase().includes(query) ||
        req.id.toString().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt || b.scheduledTime) - new Date(a.createdAt || a.scheduledTime);
        case "priority":
          return (b.priority || 0) - (a.priority || 0);
        case "name":
          return (a.user?.firstName || "").localeCompare(b.user?.firstName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [requests, filter, searchQuery, sortBy]);

  const exportToCSV = () => {
    const headers = ["ID", "Customer Name", "Email", "Pickup Location", "Scheduled Time", "Status", "Notes"];
    const csvData = filteredAndSortedRequests.map(req => [
      req.id,
      `${req.user?.firstName} ${req.user?.lastName}`,
      req.user?.email || "",
      req.pickupLocation,
      req.scheduledTime ? new Date(req.scheduledTime).toLocaleString() : "",
      req.status,
      req.notes || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pickup-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchRequests();
  }, [id]);

  if (loading) {
    return (
      <div className="modern-pickup-management">
        <div className="skeleton-loader">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-stats">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-stat"></div>
              ))}
            </div>
          </div>
          <div className="skeleton-filters"></div>
          <div className="skeleton-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-pickup-management">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-top">
          <div>
            <h1 className="page-title">Pickup Requests</h1>
            <p className="page-subtitle">Manage and track all assigned pickup requests in real-time</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={fetchRequests}>
              <FiRefreshCw className="icon" />
            </button>
            <button className="btn-secondary" onClick={exportToCSV}>
              <FiDownload className="icon" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <TbPackage />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Requests</span>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <div className="stat-card scheduled">
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.scheduled}</span>
              <span className="stat-label">Scheduled</span>
            </div>
          </div>
          
          <div className="stat-card in-progress">
            <div className="stat-icon">
              <FiTruck />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          
          <div className="stat-card completed">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search requests by name, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="controls-right">
          <div className="sort-dropdown">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by: Recent</option>
              <option value="priority">Sort by: Priority</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === "scheduled" ? "active" : ""}`}
              onClick={() => setFilter("scheduled")}
            >
              Scheduled
            </button>
            <button 
              className={`filter-btn ${filter === "in_progress" ? "active" : ""}`}
              onClick={() => setFilter("in_progress")}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="modern-requests-grid">
        {filteredAndSortedRequests.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">
              <TbPackage />
            </div>
            <h3>No requests found</h3>
            <p>
              {searchQuery 
                ? "No requests match your search criteria"
                : filter !== "all"
                ? `No ${filter.replace('_', ' ')} requests found`
                : "No pickup requests have been assigned to you yet"}
            </p>
            {searchQuery && (
              <button 
                className="btn-clear"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedRequests.map((req) => {
            const statusConfig = getStatusConfig(req.status);
            return (
              <div 
                key={req.id} 
                className="modern-request-card"
                onClick={() => viewRequestDetails(req.id)}
              >
                {/* Card Header */}
                <div className="card-header-modern">
                  <div className="request-id-modern">
                    <span className="id-prefix">PICKUP</span>
                    <span className="id-number">#{req.id.toString().padStart(6, '0')}</span>
                    {req.createdAt && (
                      <span className="request-time">
                        • {formatTimeAgo(req.createdAt)}
                      </span>
                    )}
                  </div>
                  <div 
                    className="status-badge-modern"
                    style={{ 
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color
                    }}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="user-info-modern">
                  <div className="user-avatar-modern">
                    {req.user?.firstName?.charAt(0)}{req.user?.lastName?.charAt(0)}
                  </div>
                  <div className="user-details-modern">
                    <h4 className="user-name">
                      {req.user?.firstName} {req.user?.lastName}
                    </h4>
                    <div className="user-meta">
                      <span className="user-email">
                        <FiUser className="meta-icon" />
                        {req.user?.email || "No email"}
                      </span>
                      {req.user?.phone && (
                        <span className="user-phone">
                          <TbUserCircle className="meta-icon" />
                          {req.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="request-details-modern">
                  <div className="detail-row">
                    <div className="detail-item-modern">
                      <TbMapPin className="detail-icon" />
                      <div>
                        <span className="detail-label">Pickup Location</span>
                        <span className="detail-value">{req.pickupLocation}</span>
                      </div>
                    </div>
                    {req.scheduledTime && (
                      <div className="detail-item-modern">
                        <TbCalendarTime className="detail-icon" />
                        <div>
                          <span className="detail-label">Scheduled Time</span>
                          <span className="detail-value">
                            {new Date(req.scheduledTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {req.notes && (
                    <div className="notes-section">
                      <span className="notes-label">Notes:</span>
                      <p className="notes-text">{req.notes}</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-labels">
                    <span>Pending</span>
                    <span>Scheduled</span>
                    <span>In Progress</span>
                    <span>Completed</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: req.status === 'completed' ? '100%' : 
                               req.status === 'in_progress' ? '66%' :
                               req.status === 'scheduled' ? '33%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-modern">
                  {(req.status?.toLowerCase() === "scheduled" || 
                    req.status?.toLowerCase() === "in_progress") && (
                    <button
                      className="btn-action primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        completeRequest(req.id);
                      }}
                    >
                      <FiCheckCircle />
                      {req.status?.toLowerCase() === "scheduled" ? "Start Pickup" : "Complete"}
                    </button>
                  )}
                  
                  <button
                    className="btn-action secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/track/user/${req.id}`;
                    }}
                  >
                    <FiNavigation />
                    Live Track
                  </button>
                  
                  <button
                    className="btn-action ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewRequestDetails(req.id);
                    }}
                  >
                    <FiEye />
                    Details
                    <TbChevronRight className="chevron" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}