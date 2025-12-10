import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';
import RequestManagement from './RequestManagement';
import IssueManagement from './IssueManagement';
import PickupPersonManagement from './PickupPersonManagement';

// 📈 Recharts for line graph
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Icons
import {
  FaUsers,
  FaBoxOpen,
  FaClock,
  FaShippingFast,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
  FaCog,
  FaBell,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaList,
  FaTruck,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronRight,
  FaCaretDown,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    verified: 0,
    pending: 0
  });
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8080/api/admin';

  // ⭐ NEW — REFRESH FIX
  useEffect(() => {
    const savedTab = localStorage.getItem("adminTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adminTab", activeTab);
  }, [activeTab]);

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const allUsers = response.data;
      const filteredUsers = allUsers.filter((u) => u.role !== 'ADMIN');
      setUsers(filteredUsers);
      
      // Calculate user stats
      const verified = filteredUsers.filter(u => u.verified).length;
      const pending = filteredUsers.filter(u => !u.verified).length;
      setUserStats({
        total: filteredUsers.length,
        verified,
        pending
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users.');
    }
  };

  // ✅ Fetch requests (all)
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/all`);
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests.');
    }
  };

  // ✅ Fetch pickup persons
  const fetchPickupPersons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pickuppersons`);
      setPickupPersons(response.data);
    } catch (err) {
      console.error('Error fetching pickup persons:', err);
      setError('Failed to fetch pickup persons.');
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications = [
        { id: 1, title: 'New user registered', message: 'John Doe just registered', time: '2 min ago', read: false },
        { id: 2, title: 'Request completed', message: 'Pickup request #12345 completed', time: '10 min ago', read: false },
        { id: 3, title: 'Issue reported', message: 'User reported an issue with pickup', time: '1 hour ago', read: true },
        { id: 4, title: 'System Update', message: 'Scheduled maintenance tonight', time: '2 hours ago', read: true },
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // ✅ Refresh all data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(), 
        fetchRequests(), 
        fetchPickupPersons(),
        fetchNotifications()
      ]);
      alert('Data refreshed successfully!');
    } catch (err) {
      console.error('Error refreshing data:', err);
      alert('Failed to refresh data.');
    } finally {
      setLoading(false);
    }
  };

  // Verify user
  const verifyUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/user/verify/${id}`);
      alert('User verified successfully!');
      fetchUsers();
      fetchNotifications();
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Failed to verify user.');
    }
  };

  // Reject/block user
  const rejectUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/user/reject/${id}`);
      alert('User rejected/blocked successfully!');
      fetchUsers();
      fetchNotifications();
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Failed to reject user.');
    }
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      alert('Access Denied: You must be an administrator to view this page.');
      navigate('/', { replace: true });
      return;
    }

    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('adminTabChange', handleTabChange);

    // Fetch initial data
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(), 
          fetchRequests(), 
          fetchPickupPersons(),
          fetchNotifications()
        ]);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();

    return () => {
      window.removeEventListener('adminTabChange', handleTabChange);
    };
  }, [navigate]);

  // Stats
  const totalUsers = users.length;
  const totalRequests = requests.length;
  const totalPendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const totalPickupPersons = pickupPersons.length;
  const totalCompletedRequests = requests.filter((r) => r.status === 'COMPLETED').length;
  const completionRate = totalRequests > 0 ? Math.round((totalCompletedRequests / totalRequests) * 100) : 0;

  // Graph data based on time range
  const getGraphData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const labels = timeRange === 'week' ? weeks : timeRange === 'day' ? days : months.slice(0, 6);
    
    return labels.map((label, index) => {
      const factor = (index + 1) / labels.length;
      const randomFactor = 0.8 + Math.random() * 0.4;
      return {
        name: label,
        users: Math.round(totalUsers * factor * randomFactor),
        requests: Math.round(totalRequests * factor * randomFactor),
        completed: Math.round(totalCompletedRequests * factor * randomFactor),
      };
    });
  };

  // Recent activity data
  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'New registration', time: '2 min ago', icon: '👤' },
    { id: 2, action: 'Request #12345 completed', time: '10 min ago', icon: '✅' },
    { id: 3, user: 'Jane Smith', action: 'Reported an issue', time: '1 hour ago', icon: '⚠️' },
    { id: 4, action: 'System backup completed', time: '2 hours ago', icon: '💾' },
    { id: 5, user: 'Mike Johnson', action: 'Verified account', time: '3 hours ago', icon: '👥' },
  ];

  // User distribution data for pie chart
  const userDistributionData = [
    { name: 'Verified', value: userStats.verified, color: '#10B981' },
    { name: 'Pending', value: userStats.pending, color: '#F59E0B' },
    { name: 'Admins', value: 1, color: '#3B82F6' },
  ];

  if (loading) return (
    <div className="admin-loading-container">
      <div className="admin-loader">
        <div className="loader-spinner"></div>
        <div className="loader-text">
          <h3>Loading Dashboard</h3>
          <p>Fetching latest data...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="admin-error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <FaCog className="mr-2" /> Retry
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            <FaHome className="mr-2" /> Go Home
          </button>
        </div>
      </div>
    </div>
  );

  const currentUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div className={`admin-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-user">
          <div className="user-avatar">
            <FaUserCircle />
          </div>
          <div className="user-info">
            <h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine className="nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="nav-icon" />
            <span>User Management</span>
            <span className="badge">{userStats.pending}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FaBoxOpen className="nav-icon" />
            <span>Request Management</span>
            <span className="badge">{totalPendingRequests}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'pickups' ? 'active' : ''}`}
            onClick={() => setActiveTab('pickups')}
          >
            <FaTruck className="nav-icon" />
            <span>Pickup Management</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <FaEnvelope className="nav-icon" />
            <span>Issue Center</span>
          </button>
          <div className="sidebar-footer">
            <button 
              className="nav-item logout" 
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <FaSignOutAlt className="nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'requests' && 'Request Management'}
              {activeTab === 'pickups' && 'Pickup Management'}
              {activeTab === 'issues' && 'Issue Center'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Welcome back! Here\'s what\'s happening with your platform.'}
              {activeTab === 'users' && 'Manage user accounts and permissions'}
              {activeTab === 'requests' && 'View and manage all pickup requests'}
              {activeTab === 'pickups' && 'Manage pickup personnel and assignments'}
              {activeTab === 'issues' && 'Handle user issues and support tickets'}
            </p>
          </div>

          <div className="topbar-right">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={refreshAllData}>
              <FaCog className="mr-2" /> Refresh
            </button>
          </div>
        </header>

        <main className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card stat-total-users">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-content">
                    <h3>Total Users</h3>
                    <div className="stat-value">{totalUsers}</div>
                    <div className="stat-trend positive">
                      <span>↑ 12% from last month</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-total-requests">
                  <div className="stat-icon">
                    <FaBoxOpen />
                  </div>
                  <div className="stat-content">
                    <h3>Total Requests</h3>
                    <div className="stat-value">{totalRequests}</div>
                    <div className="stat-trend positive">
                      <span>↑ 8% from last month</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-pending-requests">
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <h3>Pending Requests</h3>
                    <div className="stat-value">{totalPendingRequests}</div>
                    <div className="stat-trend negative">
                      <span>↓ 3% from last week</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-pickup-persons">
                  <div className="stat-icon">
                    <FaShippingFast />
                  </div>
                  <div className="stat-content">
                    <h3>Pickup Persons</h3>
                    <div className="stat-value">{totalPickupPersons}</div>
                    <div className="stat-trend positive">
                      <span>↑ 5% from last month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-container main-chart">
                  <div className="chart-header">
                    <h3>Platform Analytics</h3>
                    <div className="chart-filters">
                      <button 
                        className={`filter-btn ${timeRange === 'day' ? 'active' : ''}`}
                        onClick={() => setTimeRange('day')}
                      >
                        Day
                      </button>
                      <button 
                        className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
                        onClick={() => setTimeRange('week')}
                      >
                        Week
                      </button>
                      <button 
                        className={`filter-btn ${timeRange === 'month' ? 'active' : ''}`}
                        onClick={() => setTimeRange('month')}
                      >
                        Month
                      </button>
                    </div>
                  </div>
                  <div className="chart-content">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getGraphData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Total Users"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="requests" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Total Requests"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Completed"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-container pie-chart">
                  <div className="chart-header">
                    <h3>User Distribution</h3>
                  </div>
                  <div className="chart-content">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Stats */}
              <div className="bottom-row">
                <div className="recent-activity">
                  <div className="card-header">
                    <h3>Recent Activity</h3>
                    <button className="btn btn-text">View All</button>
                  </div>
                  <div className="activity-list">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">{activity.icon}</div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {activity.user && <span className="activity-user">{activity.user} </span>}
                            {activity.action}
                          </div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="quick-stats">
                  <div className="card-header">
                    <h3>Quick Stats</h3>
                  </div>
                  <div className="stats-list">
                    <div className="quick-stat">
                      <div className="stat-label">Completion Rate</div>
                      <div className="stat-value">{completionRate}%</div>
                      <div className="stat-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-label">Avg. Response Time</div>
                      <div className="stat-value">24m</div>
                      <div className="stat-trend positive">↓ 5m</div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-label">Active Sessions</div>
                      <div className="stat-value">42</div>
                      <div className="stat-trend positive">↑ 8</div>
                    </div>
                    <div className="quick-stat">
                      <div className="stat-label">Storage Used</div>
                      <div className="stat-value">2.4 GB</div>
                      <div className="stat-progress">
                        <div className="progress-bar" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" />
                      </th>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div className="user-info-small">
                              <div className="user-name">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="user-id">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{user.email}</div>
                            <div className="contact-phone">{user.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td>
                          <span className="role-badge">{user.role}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.verified ? 'verified' : 'pending'}`}>
                            {user.verified ? (
                              <>
                                <FaCheckCircle className="mr-1" /> Verified
                              </>
                            ) : (
                              <>
                                <FaClock className="mr-1" /> Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          {new Date().toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!user.verified && (
                              <button
                                className="btn-action btn-success"
                                onClick={() => verifyUser(user.id)}
                                title="Verify User"
                              >
                                <FaUserCheck />
                              </button>
                            )}
                            <button
                              className="btn-action btn-danger"
                              onClick={() => rejectUser(user.id)}
                              title={user.verified ? 'Block User' : 'Reject User'}
                            >
                              <FaUserTimes />
                            </button>
                            <button
                              className="btn-action btn-info"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn-action btn-warning"
                              title="Edit User"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <div className="pagination-info">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <div className="pagination-controls">
                  <button className="btn-pagination" disabled>
                    Previous
                  </button>
                  <span className="page-numbers">1 of 1</span>
                  <button className="btn-pagination" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="tab-content">
              <RequestManagement API_BASE_URL={API_BASE_URL} />
            </div>
          )}

          {activeTab === 'pickups' && (
            <div className="tab-content">
              <PickupPersonManagement API_BASE_URL={API_BASE_URL} />
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="tab-content">
              <IssueManagement API_BASE_URL="http://localhost:8080/api/issues" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}