import React, { useState, useEffect } from 'react';
import axios from 'axios';

// DTO-like object for scheduling
const initialSchedule = {
    scheduledTime: '',
};

export default function RequestManagement({ API_BASE_URL }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleData, setScheduleData] = useState(initialSchedule);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/requests/pending`);
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

    const handleSchedule = async (e) => {
        e.preventDefault();
        
        if (!selectedRequestId || !scheduleData.scheduledTime) {
            alert("Please select a request and set a valid date/time.");
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/request/schedule/${selectedRequestId}`, {
                scheduledTime: scheduleData.scheduledTime,
            });
            
            alert(`Request ID ${selectedRequestId} scheduled successfully!`);
            // Refresh the list after scheduling
            fetchRequests(); 
            setSelectedRequestId(null);
            setScheduleData(initialSchedule);
            
        } catch (err) {
            console.error("Error scheduling request:", err);
            alert("Failed to schedule request.");
        }
    };

    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'COMPLETED') return 'status-completed';
        return 'status-pending'; 
    };
    
    if (loading) return <div>Loading Requests...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="request-management-section">
            <h3>Pending Pickup Requests ({requests.length})</h3>
            
            <div className="requests-and-form">
                <div className="requests-list">
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>User Email</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr 
                                    key={req.id} 
                                    className={selectedRequestId === req.id ? 'selected-row' : ''}
                                >
                                    <td>
                                        <input 
                                            type="radio" 
                                            name="scheduleSelect"
                                            checked={selectedRequestId === req.id}
                                            onChange={() => setSelectedRequestId(req.id)}
                                        />
                                    </td>
                                    <td>{req.id}</td>
                                    <td>{req.type}</td>
                                    <td>{req.pickupLocation.substring(0, 30)}...</td>
                                    <td>{req.user.email}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Scheduling Form */}
                <div className="schedule-form-card">
                    <h4>Schedule Request: #{selectedRequestId || 'N/A'}</h4>
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