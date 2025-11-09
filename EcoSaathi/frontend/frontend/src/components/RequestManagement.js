// src/components/RequestManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RequestManagement.css';

// DTO-like object for scheduling
const initialSchedule = {
    scheduledTime: '',
    // 🆕 New field for the selected pickup person ID
    pickupPersonId: '', 
};

export default function RequestManagement({ API_BASE_URL }) {
    // 🔄 Updated to fetch ALL requests to show status changes
    const [requests, setRequests] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleData, setScheduleData] = useState(initialSchedule);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('PENDING'); 
    
    // 🆕 New State for Pickup Persons list
    const [pickupPersons, setPickupPersons] = useState([]); 

    // --- Fetch All Pickup Persons --- 🆕
    const fetchPickupPersons = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pickuppersons`);
            setPickupPersons(response.data);
        } catch (err) {
            console.error("Error fetching pickup persons:", err);
            // Non-fatal error, continue loading requests
        }
    };
    
    // 🔄 Updated fetch method to get ALL requests
    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/requests/all`);
            setRequests(response.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to load requests.");
        } finally {
            // Only set loading to false once all primary data (requests) is fetched
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // 🆕 Fetch pickup persons on mount
        fetchPickupPersons(); 
    }, []);

    // --- Status Action Handlers (Approve, Reject, Complete) --- (Unchanged)
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
    
    // --- Schedule Handler (Updated to send pickupPersonId) ---
    const handleSchedule = async (e) => {
        e.preventDefault();
        
        // 🔑 Validation updated to include pickupPersonId
        if (!selectedRequestId || !scheduleData.scheduledTime || !scheduleData.pickupPersonId) {
            alert("Please select a request, a date/time, and assign a Pickup Person.");
            return;
        }
        
        const selectedRequest = requests.find(r => r.id === selectedRequestId);
        
        if (selectedRequest.status !== 'APPROVED') {
            alert(`Request must be APPROVED before it can be scheduled. Current status: ${selectedRequest.status}`);
            return;
        }

        try {
            // 🔄 UPDATED: Send pickupPersonId in the request body
            await axios.put(`${API_BASE_URL}/request/schedule/${selectedRequestId}`, {
                scheduledTime: scheduleData.scheduledTime,
                pickupPersonId: Number(scheduleData.pickupPersonId), // Ensure ID is a number
            });
            
            alert(`Request ID ${selectedRequestId} scheduled successfully!`);
            fetchRequests(); 
            setSelectedRequestId(null);
            setScheduleData(initialSchedule); // Reset the form
            
        } catch (err) {
            console.error("Error scheduling request:", err);
            alert("Failed to schedule request. It must be APPROVED and have a Pickup Person assigned.");
        }
    };

    // Helper for Status Badge Class (Unchanged)
    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'APPROVED') return 'status-approved'; 
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'REJECTED') return 'status-rejected'; 
        return 'status-pending'; 
    };
    
    // Filter the requests based on the selected status (Unchanged)
    const filteredRequests = requests.filter(req => filterStatus === 'ALL' || req.status === filterStatus);
    
    if (loading) return <div>Loading Requests...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    // Helper to select a request and prepare the form
    const handleSelectRequest = (reqId) => {
        setSelectedRequestId(reqId);
        // Reset schedule form when a new request is selected
        setScheduleData(initialSchedule); 
    };

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
                            {filteredRequests.map((req) => (
                                <tr 
                                    key={req.id} 
                                    className={selectedRequestId === req.id ? 'selected-row' : ''}
                                    // 🆕 Added row click to select for scheduling
                                    onClick={() => handleSelectRequest(req.id)} 
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
                                                <button className="verify-btn" onClick={(e) => {e.stopPropagation(); handleStatusAction(req.id, 'approve');}}>Approve</button>
                                                <button className="delete-btn" onClick={(e) => {e.stopPropagation(); handleStatusAction(req.id, 'reject');}}>Reject</button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            // 🔄 Updated: Schedule button now just selects the row
                                            <button className="schedule-btn" onClick={(e) => {e.stopPropagation(); handleSelectRequest(req.id);}}>Schedule</button>
                                        )}
                                        {req.status === 'SCHEDULED' && (
                                            <button className="complete-btn" onClick={(e) => {e.stopPropagation(); handleStatusAction(req.id, 'complete');}}>Complete</button>
                                        )}
                                        {req.status === 'REJECTED' && (
                                            <span>Done</span>
                                        )}
                                        {req.status === 'COMPLETED' && (
                                            <span>Done</span>
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
                    <p className="hint">Select an **APPROVED** request from the list and fill details.</p>
                    <form onSubmit={handleSchedule}>
                        
                        {/* 🆕 Pickup Person Dropdown */}
                        <label>Assign Pickup Person:</label>
                        <select 
                            name="pickupPersonId"
                            value={scheduleData.pickupPersonId} 
                            onChange={(e) => setScheduleData(prev => ({ ...prev, pickupPersonId: e.target.value }))}
                            required
                            disabled={!selectedRequestId || pickupPersons.length === 0}
                        >
                            <option value="">-- Select Person --</option>
                            {pickupPersons.map(person => (
                                <option key={person.id} value={person.id}>
                                    {person.name} ({person.phone})
                                </option>
                            ))}
                        </select>
                        {pickupPersons.length === 0 && <p className="error-msg">⚠️ No pickup persons added yet.</p>}

                        <label>Scheduled Date/Time:</label>
                        <input 
                            type="datetime-local" 
                            name="scheduledTime"
                            value={scheduleData.scheduledTime} 
                            onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
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