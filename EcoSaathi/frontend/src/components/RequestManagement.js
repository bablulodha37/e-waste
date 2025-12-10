// src/components/RequestManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RequestManagement.css';
import { 
  FaFilter, 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes, 
  FaTruck, 
  FaClock,
  FaUserCircle,
  FaSync,
  FaEye,
  FaList
} from 'react-icons/fa';

const initialSchedule = {
    scheduledTime: '',
    pickupPersonId: '', 
};

export default function RequestManagement({ API_BASE_URL }) {
    const [requests, setRequests] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleData, setScheduleData] = useState(initialSchedule);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [pickupPersons, setPickupPersons] = useState([]);
    const [showDetails, setShowDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPickupPersons = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pickuppersons`);
            setPickupPersons(response.data);
        } catch (err) {
            console.error("Error fetching pickup persons:", err);
        }
    };
    
    const fetchRequests = async () => {
        try {
            setLoading(true);
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
        fetchPickupPersons();
    }, []);

    const handleStatusAction = async (requestId, action) => {
        let endpoint = '';
        let actionText = '';
        
        if (action === 'approve') {
            endpoint = `/request/approve/${requestId}`;
            actionText = 'Approved';
        } else if (action === 'reject') {
            endpoint = `/request/reject/${requestId}`;
            actionText = 'Rejected';
        } else if (action === 'complete') {
            endpoint = `/request/complete/${requestId}`;
            actionText = 'Completed';
        }
        
        if (!endpoint) return;

        try {
            await axios.put(`${API_BASE_URL}${endpoint}`);
            alert(`Request ID ${requestId} ${actionText} successfully!`);
            fetchRequests();
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} request. Check if the request is in the correct status.`);
        }
    };
    
    const handleSchedule = async (e) => {
        e.preventDefault();
        
        if (!selectedRequestId || !scheduleData.scheduledTime || !scheduleData.pickupPersonId) {
            alert("Please select a request, schedule date/time, and assign a Pickup Person.");
            return;
        }
        
        const selectedRequest = requests.find(r => r.id === selectedRequestId);
        
        if (selectedRequest.status !== 'APPROVED') {
            alert(`Request must be APPROVED before scheduling. Current status: ${selectedRequest.status}`);
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/request/schedule/${selectedRequestId}`, {
                scheduledTime: scheduleData.scheduledTime,
                pickupPersonId: Number(scheduleData.pickupPersonId),
            });
            
            alert(`Request ID ${selectedRequestId} scheduled successfully!`);
            fetchRequests();
            setSelectedRequestId(null);
            setScheduleData(initialSchedule);
            
        } catch (err) {
            console.error("Error scheduling request:", err);
            alert("Failed to schedule request. Please try again.");
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'PENDING': 'pending',
            'APPROVED': 'approved',
            'SCHEDULED': 'scheduled',
            'COMPLETED': 'completed',
            'REJECTED': 'rejected'
        };
        return statusMap[status] || 'pending';
    };
    
    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#F59E0B',
            'APPROVED': '#3B82F6',
            'SCHEDULED': '#8B5CF6',
            'COMPLETED': '#10B981',
            'REJECTED': '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': <FaClock />,
            'APPROVED': <FaCheck />,
            'SCHEDULED': <FaCalendarAlt />,
            'COMPLETED': <FaCheck className="completed-icon" />,
            'REJECTED': <FaTimes />
        };
        return icons[status] || <FaClock />;
    };

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
        const matchesSearch = !searchTerm || 
            req.id.toString().includes(searchTerm) ||
            req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    
    const selectedRequest = requests.find(r => r.id === selectedRequestId);
    
    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Requests</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchRequests}>
                <FaSync /> Retry
            </button>
        </div>
    );

    const handleSelectRequest = (reqId) => {
        setSelectedRequestId(reqId);
        setScheduleData(initialSchedule);
        setShowDetails(reqId);
    };

    const toggleDetails = (reqId) => {
        setShowDetails(showDetails === reqId ? null : reqId);
    };

    return (
        <div className="request-management-modern">
            {/* Stats Overview */}
            <div className="rm-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
                        <FaClock />
                    </div>
                    <div className="stat-content">
                        <h3>Pending</h3>
                        <div className="stat-value">
                            {requests.filter(r => r.status === 'PENDING').length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
                        <FaCheck />
                    </div>
                    <div className="stat-content">
                        <h3>Approved</h3>
                        <div className="stat-value">
                            {requests.filter(r => r.status === 'APPROVED').length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
                        <FaCalendarAlt />
                    </div>
                    <div className="stat-content">
                        <h3>Scheduled</h3>
                        <div className="stat-value">
                            {requests.filter(r => r.status === 'SCHEDULED').length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                        <FaTruck />
                    </div>
                    <div className="stat-content">
                        <h3>Completed</h3>
                        <div className="stat-value">
                            {requests.filter(r => r.status === 'COMPLETED').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="rm-main-content">
                {/* Left Column - Controls & List */}
                <div className="rm-left-column">
                    {/* Filters & Search */}
                    <div className="control-panel">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by ID, type, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="filters">
                            <div className="filter-group">
                                <label>
                                    <FaFilter className="filter-icon" />
                                    Filter by Status
                                </label>
                                <div className="status-filters">
                                    {['PENDING', 'APPROVED', 'SCHEDULED', 'COMPLETED', 'REJECTED', 'ALL'].map(status => (
                                        <button
                                            key={status}
                                            className={`status-filter-btn ${filterStatus === status ? 'active' : ''}`}
                                            onClick={() => setFilterStatus(status)}
                                            style={filterStatus === status ? { 
                                                backgroundColor: getStatusColor(status === 'ALL' ? '#6B7280' : status),
                                                color: 'white'
                                            } : {}}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="results-info">
                            <span className="count-badge">{filteredRequests.length}</span>
                            <span>requests found</span>
                        </div>
                    </div>

                    {/* Requests List */}
                    <div className="requests-list-modern">
                        <div className="list-header">
                            <h3>Requests List</h3>
                        </div>
                        
                        <div className="requests-container">
                            {filteredRequests.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h4>No requests found</h4>
                                    <p>Try changing your filters or search term</p>
                                </div>
                            ) : (
                                filteredRequests.map((req) => (
                                    <div 
                                        key={req.id}
                                        className={`request-card ${selectedRequestId === req.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectRequest(req.id)}
                                    >
                                        <div className="request-card-header">
                                            <div className="request-id">
                                                <span className="id-label">ID:</span>
                                                <span className="id-value">#{req.id}</span>
                                            </div>
                                            <div className="request-status">
                                                <span 
                                                    className="status-badge-modern"
                                                    style={{ backgroundColor: getStatusColor(req.status) }}
                                                >
                                                    {getStatusIcon(req.status)}
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="request-card-body">
                                            <div className="request-type">
                                                <strong>Type:</strong> {req.type}
                                            </div>
                                            <div className="request-location">
                                                <strong>Location:</strong> {req.pickupLocation}
                                            </div>
                                            
                                            {showDetails === req.id && (
                                                <div className="request-details">
                                                    <div className="detail-row">
                                                        <span className="detail-label">User:</span>
                                                        <span className="detail-value">{req.user?.name || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="detail-label">Created:</span>
                                                        <span className="detail-value">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {req.scheduledTime && (
                                                        <div className="detail-row">
                                                            <span className="detail-label">Scheduled:</span>
                                                            <span className="detail-value">
                                                                {new Date(req.scheduledTime).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="request-card-footer">
                                            <div className="action-buttons">
                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button 
                                                            className="action-btn approve-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusAction(req.id, 'approve');
                                                            }}
                                                        >
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button 
                                                            className="action-btn reject-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusAction(req.id, 'reject');
                                                            }}
                                                        >
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'APPROVED' && (
                                                    <button 
                                                        className="action-btn schedule-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectRequest(req.id);
                                                        }}
                                                    >
                                                        <FaCalendarAlt /> Schedule
                                                    </button>
                                                )}
                                                {req.status === 'SCHEDULED' && (
                                                    <button 
                                                        className="action-btn complete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusAction(req.id, 'complete');
                                                        }}
                                                    >
                                                        <FaTruck /> Complete
                                                    </button>
                                                )}
                                                {(req.status === 'REJECTED' || req.status === 'COMPLETED') && (
                                                    <span className="final-status">
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <button 
                                                className="details-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDetails(req.id);
                                                }}
                                            >
                                                <FaEye /> {showDetails === req.id ? 'Hide' : 'View'} Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Scheduling Form */}
                <div className="rm-right-column">
                    <div className="schedule-card">
                        <div className="schedule-card-header">
                            <h3>
                                <FaCalendarAlt />
                                Schedule Pickup
                            </h3>
                            {selectedRequest && (
                                <div className="selected-request-info">
                                    <span className="selected-id">#{selectedRequest.id}</span>
                                    <span 
                                        className="selected-status"
                                        style={{ color: getStatusColor(selectedRequest.status) }}
                                    >
                                        {selectedRequest.status}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {selectedRequest ? (
                            <div className="schedule-form-modern">
                                <div className="form-section">
                                    <h4>Request Details</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{selectedRequest.type}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Location:</span>
                                            <span className="detail-value">{selectedRequest.pickupLocation}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">
                                                <span 
                                                    className="status-indicator"
                                                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                                                ></span>
                                                {selectedRequest.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSchedule}>
                                    <div className="form-section">
                                        <h4>Schedule Details</h4>
                                        
                                        <div className="form-group">
                                            <label>
                                                <FaUserCircle className="label-icon" />
                                                Assign Pickup Person
                                            </label>
                                            <div className="select-wrapper">
                                                <select 
                                                    value={scheduleData.pickupPersonId} 
                                                    onChange={(e) => setScheduleData(prev => ({ 
                                                        ...prev, 
                                                        pickupPersonId: e.target.value 
                                                    }))}
                                                    required
                                                    className="modern-select"
                                                >
                                                    <option value="">Select Pickup Person</option>
                                                    {pickupPersons.map(person => (
                                                        <option key={person.id} value={person.id}>
                                                            {person.name} • {person.phone}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {pickupPersons.length === 0 && (
                                                <p className="warning-text">
                                                    ⚠️ No pickup persons available. Add pickup persons first.
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>
                                                <FaCalendarAlt className="label-icon" />
                                                Pickup Date & Time
                                            </label>
                                            <input 
                                                type="datetime-local" 
                                                value={scheduleData.scheduledTime} 
                                                onChange={(e) => setScheduleData(prev => ({ 
                                                    ...prev, 
                                                    scheduledTime: e.target.value 
                                                }))}
                                                required
                                                className="modern-input"
                                            />
                                        </div>
                                        
                                        {selectedRequest.status !== 'APPROVED' && (
                                            <div className="alert alert-warning">
                                                ⚠️ Request must be APPROVED before scheduling
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="schedule-submit-btn"
                                        disabled={!scheduleData.pickupPersonId || !scheduleData.scheduledTime || selectedRequest.status !== 'APPROVED'}
                                    >
                                        <FaTruck />
                                        Schedule Pickup
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="no-selection">
                                <div className="no-selection-icon">📋</div>
                                <h4>Select a Request</h4>
                                <p>Click on a request from the list to schedule it</p>
                            </div>
                        )}
                        
                        {selectedRequest && (
                            <div className="quick-actions">
                                <h4>Quick Actions</h4>
                                <div className="action-buttons-grid">
                                    {selectedRequest.status === 'PENDING' && (
                                        <>
                                            <button 
                                                className="quick-action-btn approve"
                                                onClick={() => handleStatusAction(selectedRequest.id, 'approve')}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button 
                                                className="quick-action-btn reject"
                                                onClick={() => handleStatusAction(selectedRequest.id, 'reject')}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedRequest.status === 'SCHEDULED' && (
                                        <button 
                                            className="quick-action-btn complete"
                                            onClick={() => handleStatusAction(selectedRequest.id, 'complete')}
                                        >
                                            <FaTruck /> Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}