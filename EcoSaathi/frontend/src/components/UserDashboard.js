import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../css/UserDashboard.css";

// 📈 Recharts import
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

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

export default function UserDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);

  const fetchUser = () => {
    api(`/api/auth/user/${id}`).then(setUser).catch(console.error);
  };

  // ✅ Fetch real stats from backend
  const fetchStats = () => {
    api(`/api/auth/user/${id}/stats`)
      .then(data => {
        setStats(data);
        // Generate mock recent activity
        const mockActivity = [
          { id: 1, type: 'pickup', date: '2024-01-15', status: 'completed', device: 'Laptop' },
          { id: 2, type: 'request', date: '2024-01-10', status: 'approved', device: 'Smartphone' },
          { id: 3, type: 'recycle', date: '2024-01-05', status: 'completed', device: 'Tablet' },
          { id: 4, type: 'pickup', date: '2024-01-02', status: 'pending', device: 'Monitor' },
          { id: 5, type: 'certificate', date: '2023-12-28', status: 'completed', device: 'Printer' },
        ];
        setRecentActivity(mockActivity);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch notifications
  const fetchNotifications = () => {
    // Mock notifications
    const mockNotifications = [
      { id: 1, title: 'Pickup Scheduled', message: 'Your pickup is scheduled for tomorrow', time: '2 min ago', read: false },
      { id: 2, title: 'Request Approved', message: 'Your request #12345 has been approved', time: '10 min ago', read: false },
      { id: 3, title: 'Certificate Ready', message: 'Your recycling certificate is ready', time: '1 hour ago', read: true },
    ];
    setNotifications(mockNotifications);
  };

  useEffect(() => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchUser();
    fetchStats();
    fetchNotifications();
  }, [id, navigate]);

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
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user || !stats) return <div className="container">Loading...</div>;

  // 🔢 Monthly line chart ke liye synthetic monthly data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const recentMonths = months.slice(0, currentMonthIndex + 1).slice(-6);
  
  const monthlyData = recentMonths.map((month, index) => {
    const factor = (index + 1) / recentMonths.length;
    return {
      month,
      total: Math.round((stats.total || 0) * factor),
      pending: Math.round((stats.pending || 0) * factor),
      approved: Math.round((stats.approved || 0) * factor),
      completed: Math.round((stats.completed || 0) * factor),
    };
  });

  // Pie chart data for request distribution
  const pieData = [
    { name: 'Pending', value: stats.pending || 0, color: '#FF6B6B' },
    { name: 'Approved', value: stats.approved || 0, color: '#4ECDC4' },
    { name: 'Completed', value: stats.completed || 0, color: '#45B7D1' },
    { name: 'Other', value: Math.max(0, (stats.total || 0) - (stats.pending + stats.approved + stats.completed)), color: '#96CEB4' }
  ];

  // Recent devices collected
  const deviceData = [
    { name: 'Laptops', count: 12, color: '#6C5CE7' },
    { name: 'Phones', count: 18, color: '#00B894' },
    { name: 'Tablets', count: 8, color: '#FD79A8' },
    { name: 'Monitors', count: 5, color: '#FDCB6E' },
    { name: 'Printers', count: 3, color: '#E17055' },
  ];

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'new-request' && 'New Request'}
              {activeTab === 'history' && 'Request History'}
              {activeTab === 'certificate' && 'Certificates'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'settings' && 'Settings'}
              {activeTab === 'support' && 'Help & Support'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Welcome back! Here\'s what\'s happening with your e-waste management.'}
              {activeTab === 'profile' && 'Manage your profile information'}
              {activeTab === 'new-request' && 'Submit a new e-waste pickup request'}
              {activeTab === 'history' && 'View your request history and status'}
              {activeTab === 'certificate' && 'Download your recycling certificates'}
              {activeTab === 'reports' && 'View analytics and insights'}
              {activeTab === 'settings' && 'Account and notification settings'}
              {activeTab === 'support' && 'Get help and submit support tickets'}
            </p>
          </div>

          <div className="topbar-right">
            <Link to={`/request/submit/${id}`} className="btn btn-primary">
              <FaBoxOpen className="mr-2" /> New Request
            </Link>
          </div>
        </header>

        <main className="dashboard-content">
          {/* Stats Overview Cards */}
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #86967e, #A8E6CF)' }}>
                📊
              </div>
              <div className="stat-content">
                <h3>Total Requests</h3>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-change positive">+12% from last month</div>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' }}>
                ⏳
              </div>
              <div className="stat-content">
                <h3>Pending</h3>
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-change neutral">Awaiting action</div>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)' }}>
                ✅
              </div>
              <div className="stat-content">
                <h3>Approved</h3>
                <div className="stat-value">{stats.approved}</div>
                <div className="stat-change positive">+5% from last week</div>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #96CEB4, #FFEAA7)' }}>
                🎯
              </div>
              <div className="stat-content">
                <h3>Completed</h3>
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-change positive">+18% completed</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Left Column - Charts */}
            <div className="chart-section">
              <div className="chart-card glass-card">
                <div className="chart-header">
                  <h3>Monthly Request Trend</h3>
                  <select className="chart-filter">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                    <option>All Time</option>
                  </select>
                </div>
                <div className="line-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#86967e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#86967e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#45B7D1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#45B7D1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '10px', 
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#86967e" fillOpacity={1} fill="url(#colorTotal)" />
                      <Area type="monotone" dataKey="completed" stroke="#45B7D1" fillOpacity={1} fill="url(#colorCompleted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mini-charts-grid">
                <div className="mini-chart-card glass-card">
                  <h4>Request Distribution</h4>
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pie-legend">
                    {pieData.map(item => (
                      <div key={item.name} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mini-chart-card glass-card">
                  <h4>Devices Collected</h4>
                  <div className="bar-chart-container">
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={deviceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="device-stats">
                    {deviceData.map(device => (
                      <div key={device.name} className="device-stat">
                        <span className="device-name">{device.name}</span>
                        <span className="device-count">{device.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Activity */}
            <div className="right-column">
              {/* Quick Actions */}
              <div className="actions-card glass-card">
                <div className="card-header">
                  <h3>Quick Actions</h3>
                  <span className="card-subtitle">Manage your e-waste</span>
                </div>
                <div className="actions-grid">
                  <Link to={`/request/submit/${id}`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
                      ➕
                    </div>
                    <div className="action-content">
                      <h4>Submit Request</h4>
                      <p>New e-waste pickup</p>
                    </div>
                  </Link>

                  <Link to={`/profile/${id}/history`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #00B894, #55EFC4)' }}>
                      📋
                    </div>
                    <div className="action-content">
                      <h4>My Requests</h4>
                      <p>View all requests</p>
                    </div>
                  </Link>

                  <Link to={`/certificate/${id}`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #FDCB6E, #FFEAA7)' }}>
                      🏅
                    </div>
                    <div className="action-content">
                      <h4>Certificate</h4>
                      <p>Download certificate</p>
                    </div>
                  </Link>

                  <Link to={`/report/${id}`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #E17055, #FAB1A0)' }}>
                      📊
                    </div>
                    <div className="action-content">
                      <h4>Reports</h4>
                      <p>Analytics & insights</p>
                    </div>
                  </Link>

                  <Link to={`/profile/${id}`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #FD79A8, #FFC8D3)' }}>
                      👤
                    </div>
                    <div className="action-content">
                      <h4>Profile</h4>
                      <p>Update information</p>
                    </div>
                  </Link>

                  <Link to={`/support/${id}`} className="action-item">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #A29BFE, #D6D4FF)' }}>
                      🛠
                    </div>
                    <div className="action-content">
                      <h4>Support</h4>
                      <p>Help & tickets</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-card glass-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <Link to={`/profile/${id}/history`} className="view-all-link">View All →</Link>
                </div>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon status-${activity.status}`}>
                        {activity.type === 'pickup' ? '🚚' : 
                         activity.type === 'request' ? '📄' : 
                         activity.type === 'recycle' ? '♻️' : '🏅'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          <span className="activity-type">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                          <span className={`activity-status status-${activity.status}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="activity-device">{activity.device}</p>
                        <span className="activity-date">{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Stats */}
              <div className="impact-card glass-card">
                <div className="card-header">
                  <h3>Your Environmental Impact</h3>
                  <span className="card-subtitle">This month</span>
                </div>
                <div className="impact-stats">
                  <div className="impact-stat">
                    <div className="impact-value">12.5 kg</div>
                    <div className="impact-label">E-Waste Recycled</div>
                  </div>
                  <div className="impact-stat">
                    <div className="impact-value">45 kg</div>
                    <div className="impact-label">CO₂ Saved</div>
                  </div>
                  <div className="impact-stat">
                    <div className="impact-value">8</div>
                    <div className="impact-label">Trees Equivalent</div>
                  </div>
                </div>
                <div className="impact-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <div className="progress-text">75% to monthly goal</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}