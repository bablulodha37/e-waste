import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';
import RequestManagement from './RequestManagement';
import PickupPersonManagement from './PickupPersonManagement';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8080/api/admin';

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const allUsers = response.data;

      // ✅ Exclude admin accounts
      const filteredUsers = allUsers.filter(u => u.role !== 'ADMIN');
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Fetch requests (all)
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/all`);
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // ✅ Fetch pickup persons
  const fetchPickupPersons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pickuppersons`);
      setPickupPersons(response.data);
    } catch (err) {
      console.error("Error fetching pickup persons:", err);
    }
  };

  // ✅ Verify user
  const verifyUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/user/verify/${id}`);
      alert('User verified successfully!');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Failed to verify user.');
    }
  };

  // ✅ Reject (Block) user
  const rejectUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/user/reject/${id}`);
      alert('User rejected/blocked successfully!');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Failed to reject user.');
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      alert("Access Denied: You must be an administrator to view this page.");
      navigate('/', { replace: true });
      return;
    }

    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener("adminTabChange", handleTabChange);

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRequests(), fetchPickupPersons()]);
      setLoading(false);
    };
    fetchAll();

    return () => {
      window.removeEventListener("adminTabChange", handleTabChange);
    };
  }, [navigate]);

  if (loading) return <div className="admin-container">Loading...</div>;
  if (error) return <div className="admin-container error">{error}</div>;

  // ✅ Stats derived from real data
  const totalUsers = users.length;
  const totalRequests = requests.length;
  const totalPendingRequests = requests.filter(r => r.status === "PENDING").length;
  const totalPickupPersons = pickupPersons.length;

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
              onClick={() => navigate(`/profile/${JSON.parse(localStorage.getItem('user')).id}`)}
            >
              👤 <span>Profile</span>
            </button>
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
                    {!u.verified && (
                      <button
                        className="verify-btn"
                        onClick={() => verifyUser(u.id)}
                      >
                        ✅ Verify
                      </button>
                    )}
                    {u.verified && (
                      <button
                        className="reject-btn"
                        onClick={() => rejectUser(u.id)}
                      >
                        🚫 Block
                      </button>
                    )}
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
    </div>
  );
}
