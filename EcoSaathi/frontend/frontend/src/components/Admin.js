
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Base URL for your Spring Boot API
    const API_BASE_URL = 'http://localhost:8080/api/admin'; 

    useEffect(() => {
        // 1. Check for Admin Role (Security)
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.isAdmin) {
            alert("Access Denied: You must be an administrator to view this page.");
            navigate('/'); // Redirect non-admins to the home page
            return; 
        }

        // 2. Fetch All Users
        const fetchUsers = async () => {
            try {
                // NOTE: In a real application, you'd also include an Authorization header (JWT)
                const response = await axios.get(`${API_BASE_URL}/users`);
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    // 3. Admin Action Handler (e.g., Verify User)
    const handleVerifyUser = async (userId) => {
        try {
            await axios.put(`${API_BASE_URL}/user/verify/${userId}`);
            
            // Update the local state to show the change immediately
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, isVerified: true } : user
                )
            );
        } catch (err) {
            console.error("Error verifying user:", err);
            alert("Verification failed.");
        }
    };


    if (loading) return <div className="admin-container">Loading...</div>;
    if (error) return <div className="admin-container error">{error}</div>;

    // 4. Render User List
    return (
        <div className="admin-container">
            <h1>Admin Dashboard - All Users</h1>
            <p>Total Users: {users.length}</p>

            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Verified</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                            <td>{user.isVerified ? '✅ Yes' : '❌ No'}</td>
                            <td>
                                {!user.isVerified && (
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
}