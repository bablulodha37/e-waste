import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RequestManagement.css';
// DTO-like object for scheduling
const initialSchedule = {
    scheduledTime: '',
};

export default function RequestManagement({ API_BASE_URL }) {
    // 🔄 Updated to fetch ALL requests to show status changes
    const [requests, setRequests] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleData, setScheduleData] = useState(initialSchedule);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('PENDING'); // 🆕 New filter state

    // 🔄 Updated fetch method to get ALL requests, not just PENDING
    const fetchRequests = async () => {
        try {
            // We will use the 'all' endpoint for the main list
            const response = await axios.get(`${API_BASE_URL}/requests/all`);
            setRequests(response.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // --- Status Action Handlers (Approve, Reject, Complete) ---
    const handleStatusAction = async (requestId, action) => {
        let endpoint = '';
        if (action === 'approve') endpoint = `/request/approve/${requestId}`;
        else if (action === 'reject') endpoint = `/request/reject/${requestId}`;
        else if (action === 'complete') endpoint = `/request/complete/${requestId}`;
        
        if (!endpoint) return;

        try {
            await axios.put(`${API_BASE_URL}${endpoint}`);
            alert(`Request ID ${requestId} status updated to ${action.toUpperCase()} successfully!`);
            fetchRequests(); // Refresh the list
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} request. Only certain statuses can transition.`);
        }
    };
    
    // --- Schedule Handler (Updated) ---
    const handleSchedule = async (e) => {
        e.preventDefault();
        const selectedRequest = requests.find(r => r.id === selectedRequestId);
        
        if (!selectedRequestId || !scheduleData.scheduledTime) {
            alert("Please select a request and set a valid date/time.");
            return;
        }
        
        // 🔑 Client-side check for new flow (Backend also enforces this)
        if (selectedRequest.status !== 'APPROVED') {
            alert(`Request must be APPROVED before it can be scheduled. Current status: ${selectedRequest.status}`);
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/request/schedule/${selectedRequestId}`, {
                scheduledTime: scheduleData.scheduledTime,
            });
            
            alert(`Request ID ${selectedRequestId} scheduled successfully!`);
            fetchRequests(); 
            setSelectedRequestId(null);
            setScheduleData(initialSchedule);
            
        } catch (err) {
            console.error("Error scheduling request:", err);
            alert("Failed to schedule request. It must be APPROVED.");
        }
    };

    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'APPROVED') return 'status-approved'; // 🆕 New Status Style
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'REJECTED') return 'status-rejected'; // 🆕 New Status Style
        return 'status-pending'; 
    };
    
    // Filter the requests based on the selected status
    const filteredRequests = requests.filter(req => filterStatus === 'ALL' || req.status === filterStatus);
    
    if (loading) return <div>Loading Requests...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="request-management-section">
            <h3>Request Management</h3>
            
            {/* 🆕 Status Filter */}
            <div className="status-filter">
                <label>Filter Status: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="ALL">ALL</option>
                </select>
                <p>Showing **{filteredRequests.length}** requests.</p>
            </div>
            
            <div className="requests-and-form">
                <div className="requests-list">
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req) => ( // Use filteredRequests
                                <tr 
                                    key={req.id} 
                                    className={selectedRequestId === req.id ? 'selected-row' : ''}
                                >
                                    <td>{req.id}</td>
                                    <td>{req.type}</td>
                                    <td>{req.pickupLocation.substring(0, 30)}...</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Action buttons based on status */}
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button className="verify-btn" onClick={() => handleStatusAction(req.id, 'approve')}>Approve</button>
                                                <button className="delete-btn" onClick={() => handleStatusAction(req.id, 'reject')}>Reject</button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <button className="schedule-btn" onClick={() => setSelectedRequestId(req.id)}>Schedule</button>
                                        )}
                                        {req.status === 'SCHEDULED' && (
                                            <button className="complete-btn" onClick={() => handleStatusAction(req.id, 'complete')}>Complete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Scheduling Form (Only active for APPROVED requests) */}
                <div className="schedule-form-card">
                    <h4>Schedule Request: #{selectedRequestId || 'N/A'}</h4>
                    <p className="hint">Select a request and set the date/time.</p>
                    <form onSubmit={handleSchedule}>
                        <label>Scheduled Date/Time:</label>
                        <input 
                            type="datetime-local" 
                            value={scheduleData.scheduledTime} 
                            onChange={(e) => setScheduleData({ scheduledTime: e.target.value })}
                            required
                            disabled={!selectedRequestId}
                        />
                        <button type="submit" disabled={!selectedRequestId}>
                            Schedule Pickup
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}