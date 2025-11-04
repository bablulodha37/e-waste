import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';
import RequestManagement from './RequestManagement'; 

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'requests' 
    
    const navigate = useNavigate();

    // Base URL for your Spring Boot API
    const API_BASE_URL = 'http://localhost:8080/api/admin'; 

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            // The response data is now UserDto, which hides the password!
            setUsers(response.data); 
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Check for Admin Role (Security)
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'ADMIN') { // Use user.role check now
            alert("Access Denied: You must be an administrator to view this page.");
            navigate('/', { replace: true });
            return; 
        }
        
        // 2. Fetch All Users only when the Users tab is active
        if (activeTab === 'users') {
             fetchUsers();
        }

    }, [navigate, activeTab]); // Re-run on tab change

    // 3. Admin Action Handler (e.g., Verify User)
    const handleVerifyUser = async (userId) => {
        try {
            await axios.put(`${API_BASE_URL}/user/verify/${userId}`);
            
            // Update the local state to show the change immediately
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, verified: true } : user // Note: The field is 'verified' (lowercase)
                )
            );
            alert(`User ID ${userId} verified successfully.`);
            
        } catch (err) {
            console.error("Error verifying user:", err);
            alert("Verification failed.");
        }
    };


    const renderUserTable = () => (
        <div className="admin-section">
            <p>Total Users: {users.length}</p>
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
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.firstName} {user.lastName}</td> 
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.pickupAddress}</td> 
                            <td>{user.role}</td>
                            <td>{user.verified ? '✅ Yes' : '❌ No'}</td>
                            <td>
                                {!user.verified && (
                                    <button 
                                        className="verify-btn"
                                        onClick={() => handleVerifyUser(user.id)}
                                        disabled={loading}
                                    >
                                        Verify
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (loading) return <div className="admin-container">Loading...</div>;
    if (error) return <div className="admin-container error">{error}</div>;

    // 4. Render Dashboard Tabs
    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            
            <div className="admin-tabs">
                <button 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}>
                    User Management
                </button>
                <button 
                    className={activeTab === 'requests' ? 'active' : ''} 
                    onClick={() => setActiveTab('requests')}>
                    Request Management
                </button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'users' && renderUserTable()}
                {activeTab === 'requests' && <RequestManagement API_BASE_URL={API_BASE_URL} />} 
            </div>
        </div>
    );
}