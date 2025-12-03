import React, { useState, useEffect } from 'react';
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
} from 'recharts';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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

      // Exclude admin accounts
      const filteredUsers = allUsers.filter((u) => u.role !== 'ADMIN');
      setUsers(filteredUsers);
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

  // Verify user
  const verifyUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/user/verify/${id}`);
      alert('User verified successfully!');
      fetchUsers();
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
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Failed to reject user.');
    }
  };

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

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRequests(), fetchPickupPersons()]);
      setLoading(false);
    };
    fetchAll();

    return () => {
      window.removeEventListener('adminTabChange', handleTabChange);
    };
  }, [navigate]);

  if (loading) return <div className="admin-container">Loading...</div>;
  if (error) return <div className="admin-container error">{error}</div>;

  // Stats
  const totalUsers = users.length;
  const totalRequests = requests.length;
  const totalPendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const totalPickupPersons = pickupPersons.length;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthsCount = months.length;

  const graphData = months.map((month, index) => {
    const factor = (index + 1) / monthsCount;
    return {
      month,
      users: Math.round(totalUsers * factor),
      requests: Math.round(totalRequests * factor),
      pending: Math.round(totalPendingRequests * factor),
    };
  });

  const maxStat = Math.max(totalUsers, totalRequests, totalPendingRequests, 10);
  const maxYAxis = Math.ceil(maxStat / 10) * 10;

  const yTicks = [];
  for (let t = 0; t <= maxYAxis; t += 10) {
    yTicks.push(t);
  }

  return (
    <div className="admin-container">
      <h1>Welcome, Admin!</h1>
      <p className="admin-subheading">Here’s an overview of your platform activity</p>

      {activeTab === 'dashboard' && (
        <>
          <div className="admin-stats-container">
            <div className="admin-card total">
              <h3>Total Users</h3>
              <div className="value">{totalUsers}</div>
            </div>
            <div className="admin-card request">
              <h3>Total Requests</h3>
              <div className="value">{totalRequests}</div>
            </div>
            <div className="admin-card pending">
              <h3>Pending Requests</h3>
              <div className="value">{totalPendingRequests}</div>
            </div>
            <div className="admin-card pickup">
              <h3>Pickup Persons</h3>
              <div className="value">{totalPickupPersons}</div>
            </div>
          </div>

          <h3 className="quick-links-title">Quick Navigation</h3>
          <div className="admin-actions-container">
            <button className="admin-action" onClick={() => setActiveTab('users')}>
              👥 <span>User Management</span>
            </button>
            <button className="admin-action" onClick={() => setActiveTab('requests')}>
              📦 <span>Request Management</span>
            </button>
            <button className="admin-action" onClick={() => setActiveTab('pickups')}>
              🚛 <span>Pickup Person Management</span>
            </button>
            <button
              className="admin-action"
              onClick={() =>
                navigate(`/profile/${JSON.parse(localStorage.getItem('user')).id}`)
              }
            >
              👤 <span>Profile</span>
            </button>

            <button className="admin-action" onClick={() => setActiveTab('issues')}>
              📩 <span>Issues Management</span>
            </button>
          </div>

          {/* 📈 Graph */}
          <div className="admin-graph-wrapper">
            <h3 className="admin-graph-title">Monthly Overview</h3>

            <div className="admin-graph-legend">
              <span className="legend-line users"></span> Total Users
              <span className="legend-line requests"></span> Total Requests
              <span className="legend-line pending"></span> Pending Requests
            </div>

            <div className="admin-line-chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={graphData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis ticks={yTicks} domain={[0, maxYAxis]} />
                  <Tooltip />

                  <Line type="monotone" dataKey="users" stroke="#97d877" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="requests" stroke="rgb(137, 212, 186)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="pending" stroke="rgb(137, 88, 133)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>User Management</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.pickupAddress}</td>
                  <td>{u.role}</td>
                  <td>{u.verified ? '✅' : '❌'}</td>
                  <td>
                    {!u.verified && <button className="verify-btn" onClick={() => verifyUser(u.id)}>✅ Verify</button>}
                    {u.verified && <button className="reject-btn" onClick={() => rejectUser(u.id)}>🚫 Block</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
