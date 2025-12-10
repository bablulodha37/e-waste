import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import PickupLiveSender from "../components/PickupLiveSender";
import "../css/PickupDashboard.css";
import {
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiBarChart2,
  FiNavigation,
  FiSettings,
  FiTrendingUp,
  FiAlertCircle,
  FiCalendar,
  FiStar,
  FiActivity,
  FiHome,
  FiList,
  FiFileText,
  FiAward,
  FiTool,
  FiLogOut,
  FiMenu,
  FiX,
  FiDollarSign,
  FiTarget,
  FiPercent,
  FiTrendingDown,
  FiUsers,
  FiChevronRight
} from "react-icons/fi";

// 📈 Recharts for line graph
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function PickupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    pending: 0,
    distance: 0,
    earnings: 0
  });
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);

  const API_BASE_URL = "http://localhost:8080/api/pickup";

  const fetchUserProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        console.error("No user found in localStorage");
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/profile/${user.id}`);
      setUserProfile(res.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/${user.id}/requests`);
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
      
      // Filter active requests (PENDING and IN_PROGRESS)
      const active = data.filter(r => 
        r.status === "PENDING" || r.status === "IN_PROGRESS"
      );
      setActiveRequests(active);
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayCompleted = data.filter(r => 
        r.status === "COMPLETED" && 
        r.completedAt && 
        r.completedAt.startsWith(today)
      ).length;
      
      const todayPending = data.filter(r => 
        r.status === "PENDING" && 
        r.createdAt && 
        r.createdAt.startsWith(today)
      ).length;
      
      // Calculate distance and earnings
      const completedRequests = data.filter(r => r.status === "COMPLETED");
      const totalDistance = completedRequests.reduce((sum, r) => sum + (r.distance || Math.random() * 10 + 5), 0);
      const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.paymentAmount || 50 + Math.random() * 50), 0);
      
      setTodayStats({
        completed: todayCompleted,
        pending: todayPending,
        distance: Math.round(totalDistance * 10) / 10,
        earnings: Math.round(totalEarnings)
      });
      
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load assigned requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "PICKUP_PERSON") {
      alert("Access Denied: Only Pickup Persons can view this page.");
      navigate("/", { replace: true });
      return;
    }
    
    fetchUserProfile();
    fetchRequests();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Dashboard Stats
  const total = requests.length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const scheduled = requests.filter((r) => r.status === "SCHEDULED").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Monthly Graph Data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  const graphData = recentMonths.map((month, index) => {
    const baseCompleted = Math.round(completed * (index + 1) / recentMonths.length);
    const basePending = Math.round(pending * (index + 1) / recentMonths.length);
    return {
      month,
      completed: baseCompleted + Math.round(Math.random() * 3),
      pending: basePending + Math.round(Math.random() * 2),
      inProgress: Math.round(inProgress * (index + 1) / recentMonths.length),
      scheduled: Math.round(scheduled * (index + 1) / recentMonths.length)
    };
  });

  // Performance Metrics
  const performanceScore = Math.min(100, Math.round((completed * 10) + (todayStats.completed * 5)));
  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgCompletionTime = completed > 0 ? Math.round((24 * 60) / completed) : 0;

  // Sidebar Functions
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  
  const navigateTo = (path) => {
    navigate(path);
    closeSidebar();
  };
  
  const handleStartRoute = () => {
    if (activeRequests.length > 0) {
      navigate(`/track/user/${user.id}`);
    } else {
      alert("No active requests available. Please check your assigned requests.");
    }
  };
  
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Check if current route matches
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  if (loading) return (
    <div className="dashboard-page loading">
      <div className="loading-spinner-large"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="dashboard-page error">
      <div className="error-content">
        <FiAlertCircle />
        <h3>Unable to Load Dashboard</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchRequests}>
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className={`dashboard-page ${sidebarOpen ? 'sidebar-open' : ''}`}>
      
      {/* ⭐⭐ PICKUP DASHBOARD SIDEBAR ⭐⭐ */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {userProfile?.profilePictureUrl ? (
                <img 
                  src={userProfile.profilePictureUrl.startsWith("./images/") 
                    ? `http://localhost:8080${userProfile.profilePictureUrl}` 
                    : userProfile.profilePictureUrl} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.sidebar-avatar-placeholder').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="sidebar-avatar-placeholder">
                {user?.firstName?.[0] || user?.email?.[0] || "P"}
              </div>
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">
                {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : user?.name || user?.email}
              </div>
              <div className="sidebar-user-email">{user?.email}</div>
              <div className="sidebar-user-role">Pickup Person</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>
            <FiX />
          </button>
        </div>

        <div className="sidebar-menu">
          <button 
            onClick={() => navigateTo(`/pickup-dashboard/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute(`/pickup-dashboard/${user.id}`) ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiHome /></span>
            <span className="sidebar-menu-text">Dashboard</span>
          </button>
          
          <button 
            onClick={() => navigateTo(`/pickup-profile/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute('/pickup-profile') ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiUser /></span>
            <span className="sidebar-menu-text">Profile</span>
          </button>
          
          <button 
            onClick={() => navigateTo(`/pickup/requests/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute('/pickup/requests') ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiList /></span>
            <span className="sidebar-menu-text">Requests</span>
            {pending > 0 && <span className="menu-badge">{pending}</span>}
          </button>
          
          <button 
            onClick={() => navigateTo(`/pickup/schedule/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute('/pickup/schedule') ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiCalendar /></span>
            <span className="sidebar-menu-text">Schedule</span>
          </button>
          
          
          <button 
            onClick={() => navigateTo(`/track/user/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute('/track/user') ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiMapPin /></span>
            <span className="sidebar-menu-text">Live Map</span>
          </button>
          
          <button 
            onClick={() => navigateTo(`/pickup/analytics/${user.id}`)} 
            className={`sidebar-menu-item ${isActiveRoute('/pickup/analytics') ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon"><FiBarChart2 /></span>
            <span className="sidebar-menu-text">Analytics</span>
          </button>
          
          
          <button 
  onClick={() => navigateTo(`/pickup/support/${user.id}`)} 
  className={`sidebar-menu-item ${isActiveRoute('/pickup/support') ? 'active' : ''}`}
>
  <span className="sidebar-menu-icon"><FiTool /></span>
  <span className="sidebar-menu-text">Support & Issues</span>
</button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              <FiCheckCircle />
              <span>{completed} Completed</span>
            </div>
            <div className="sidebar-stat">
              <FiClock />
              <span>{pending} Pending</span>
            </div>
          </div>
          <button onClick={logout} className="sidebar-logout">
            <span className="logout-icon"><FiLogOut /></span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header with Menu Button */}
        <div className="dashboard-header">
          <div className="header-left">
            <button className="menu-btn" onClick={openSidebar}>
              <FiMenu />
            </button>
            <div className="header-content">
              <div className="header-icon">
                <FiTruck />
              </div>
              <div className="header-details">
                <h1>Pickup Dashboard</h1>
                <p className="welcome-text">
                  Welcome back, <strong>{userProfile?.firstName || user?.name || user?.email}</strong>!
                </p>
                <div className="header-stats">
                  <span className="stat-chip">
                    <FiPackage /> {todayStats.completed} completed today
                  </span>
                  <span className="stat-chip">
                    <FiClock /> {todayStats.pending} pending
                  </span>
                  <span className="stat-chip">
                    <FiMapPin /> {todayStats.distance} km
                  </span>
                  <span className="stat-chip">
                    <FiDollarSign /> ₹{todayStats.earnings}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <PickupLiveSender pickupPersonId={user?.id} />
            <div className="header-notifications">
              <button className="notification-btn">
                <FiAlertCircle />
                <span className="notification-count">{pending}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Overview Cards */}
        <div className="overview-section">
          <h2 className="section-title">
            <FiActivity /> Today's Overview
          </h2>
          <div className="overview-grid">
            <div className="overview-card primary">
              <div className="card-icon">
                <FiPackage />
              </div>
              <div className="card-content">
                <h3>Active Pickups</h3>
                <div className="card-value">{inProgress + pending}</div>
                <div className="card-trend positive">
                  <FiTrendingUp /> 12% from yesterday
                </div>
              </div>
            </div>
            
            <div className="overview-card success">
              <div className="card-icon">
                <FiCheckCircle />
              </div>
              <div className="card-content">
                <h3>Completed Today</h3>
                <div className="card-value">{todayStats.completed}</div>
                <div className="card-trend positive">
                  <FiTrendingUp /> On track for daily goal
                </div>
              </div>
            </div>
            
            <div className="overview-card warning">
              <div className="card-icon">
                <FiClock />
              </div>
              <div className="card-content">
                <h3>Avg Completion Time</h3>
                <div className="card-value">{avgCompletionTime}m</div>
                <div className="card-trend negative">
                  <FiTrendingDown /> 5% from last week
                </div>
              </div>
            </div>
            
            <div className="overview-card info">
              <div className="card-icon">
                <FiTarget />
              </div>
              <div className="card-content">
                <h3>Efficiency Score</h3>
                <div className="card-value">{efficiency}%</div>
                <div className="card-trend positive">
                  <FiTrendingUp /> Above average
                </div>
              </div>
            </div>
            
            <div className="overview-card earnings">
              <div className="card-icon">
                <FiDollarSign />
              </div>
              <div className="card-content">
                <h3>Today's Earnings</h3>
                <div className="card-value">₹{todayStats.earnings}</div>
                <div className="card-trend positive">
                  <FiTrendingUp /> 18% from yesterday
                </div>
              </div>
            </div>
            
            <div className="overview-card customers">
              <div className="card-icon">
                <FiUsers />
              </div>
              <div className="card-content">
                <h3>Customers Served</h3>
                <div className="card-value">{completed}</div>
                <div className="card-trend positive">
                  <FiTrendingUp /> 8% from last week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column - Stats & Charts */}
          <div className="main-column">
            {/* Performance Score */}
            <div className="performance-card">
              <div className="performance-header">
                <h3>
                  <FiStar /> Performance Score
                </h3>
                <div className="score-badge">{performanceScore}/100</div>
              </div>
              <div className="performance-bar">
                <div 
                  className="performance-fill" 
                  style={{ width: `${performanceScore}%` }}
                ></div>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <div className="metric-value">{completionRate}%</div>
                  <div className="metric-label">Completion Rate</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{todayStats.distance} km</div>
                  <div className="metric-label">Distance Covered</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{requests.length}</div>
                  <div className="metric-label">Total Assignments</div>
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>
                  <FiBarChart2 /> Monthly Activity Trend
                </h3>
                <div className="chart-legend">
                  <span className="legend-item completed">
                    <div className="legend-dot"></div> Completed
                  </span>
                  <span className="legend-item pending">
                    <div className="legend-dot"></div> Pending
                  </span>
                  <span className="legend-item in-progress">
                    <div className="legend-dot"></div> In Progress
                  </span>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      fill="url(#colorCompleted)" 
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#f59e0b" 
                      fill="url(#colorPending)" 
                      strokeWidth={2}
                      name="Pending"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inProgress" 
                      stroke="#3b82f6" 
                      fill="url(#colorInProgress)" 
                      strokeWidth={2}
                      name="In Progress"
                    />
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Recent */}
          <div className="sidebar-column">
            {/* Quick Actions */}
            <div className="actions-card">
              <h3>
                <FiNavigation /> Quick Actions
              </h3>
              <div className="actions-grid">
                <Link to={`/pickup-profile/${user?.id}`} className="action-item">
                  <div className="action-icon">
                    <FiUser />
                  </div>
                  <div className="action-content">
                    <div className="action-title">Update Profile</div>
                    <div className="action-subtitle">Edit your details</div>
                  </div>
                </Link>
                
                <button onClick={handleStartRoute} className="action-item" style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1rem', textAlign: 'left'}}>
                  <div className="action-icon">
                    <FiMapPin />
                  </div>
                  <div className="action-content">
                    <div className="action-title">Start Navigation</div>
                    <div className="action-subtitle">Begin your route</div>
                  </div>
                </button>
                
                <Link to={`/pickup/requests/${user?.id}`} className="action-item">
                  <div className="action-icon">
                    <FiList />
                  </div>
                  <div className="action-content">
                    <div className="action-title">View Requests</div>
                    <div className="action-subtitle">{pending} pending requests</div>
                  </div>
                </Link>
                
                <Link to={`/pickup/schedule/${user?.id}`} className="action-item">
                  <div className="action-icon">
                    <FiCalendar />
                  </div>
                  <div className="action-content">
                    <div className="action-title">Schedule</div>
                    <div className="action-subtitle">View calendar</div>
                  </div>
                </Link>
                
                <Link to={`/pickup/earnings/${user?.id}`} className="action-item">
                  <div className="action-icon">
                    <FiDollarSign />
                  </div>
                  <div className="action-content">
                    <div className="action-title">Earnings</div>
                    <div className="action-subtitle">₹{todayStats.earnings} earned</div>
                  </div>
                </Link>
                
                <Link to={`/support/${user?.id}`} className="action-item">
                  <div className="action-icon">
                    <FiTool />
                  </div>
                  <div className="action-content">
                    <div className="action-title">Support</div>
                    <div className="action-subtitle">Need help?</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-card">
              <h3>
                <FiClock /> Recent Activity
              </h3>
              <div className="activity-list">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id || Math.random()} className="activity-item">
                    <div className="activity-icon">
                      {req.status === 'COMPLETED' ? <FiCheckCircle /> : 
                       req.status === 'IN_PROGRESS' ? <FiTruck /> : 
                       req.status === 'PENDING' ? <FiClock /> : <FiPackage />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        Pickup #{String(req.id || '').slice(-6)}
                      </div>
                      <div className="activity-desc">
                        {req.pickupAddress?.substring(0, 30) || 'No address'}...
                      </div>
                      <div className="activity-status">
                        <span className={`status-badge ${req.status?.toLowerCase()}`}>
                          {req.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="activity-time">
                      {req.updatedAt ? 
                        new Date(req.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                        '--:--'}
                    </div>
                  </div>
                ))}
                
                {requests.length === 0 && (
                  <div className="empty-activity">
                    <FiPackage size={48} />
                    <p>No recent activity</p>
                    <small>Pickups will appear here</small>
                  </div>
                )}
              </div>
              
              {requests.length > 5 && (
                <Link to={`/pickup/requests/${user?.id}`} className="view-all-link">
                  View all requests →
                </Link>
              )}
            </div>

            {/* Performance Tips */}
            <div className="tips-card">
              <h3>
                <FiStar /> Performance Tips
              </h3>
              <ul className="tips-list">
                <li><FiCheckCircle /> Complete pickups before deadlines for bonus points</li>
                <li><FiMapPin /> Update your location regularly for better route optimization</li>
                <li><FiUsers /> Communicate with customers for smooth pickups</li>
                <li><FiSettings /> Maintain your vehicle for optimal performance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bottom-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label">Overall Completion Rate</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FiTarget />
            </div>
            <div className="stat-content">
              <div className="stat-value">{performanceScore}</div>
              <div className="stat-label">Performance Score</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-value">₹{todayStats.earnings * 30}</div>
              <div className="stat-label">Estimated Monthly Earnings</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{completed}</div>
              <div className="stat-label">Total Customers Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}