import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../css/IssueManagement.css";
import {
  FaComments,
  FaEnvelope,
  FaClock,
  FaUser,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaSync,
  FaEye,
  FaReply,
  FaLock,
  FaUnlock,
  FaExclamationCircle,
  FaCommentDots
} from "react-icons/fa";

export default function IssueManagement({ API_BASE_URL }) {
  const [issues, setIssues] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showSuccess, setShowSuccess] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Fetch Issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/all`;
      console.log("Fetching issues from:", url);

      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        const sorted = res.data.sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));
        setIssues(sorted);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [selectedIssue?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 2. Open Chat
  const openTicket = async (issueId) => {
    setLoadingChat(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/${issueId}?requesterId=0&role=ADMIN`
      );
      setSelectedIssue(res.data);
      setShowSuccess(`Ticket #${issueId} opened`);
      setTimeout(() => setShowSuccess(""), 3000);
    } catch (err) {
      alert("Error loading chat details.");
    }
    setLoadingChat(false);
  };

  // 3. Admin Reply
  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const payload = {
        role: "ADMIN",
        senderId: 0,
        message: replyText,
      };

      const res = await axios.post(
        `${API_BASE_URL}/${selectedIssue.id}/reply`,
        payload
      );

      setSelectedIssue(res.data);
      setReplyText("");
      fetchIssues();
      
      setShowSuccess("Reply sent successfully!");
      setTimeout(() => setShowSuccess(""), 3000);
    } catch (err) {
      console.error("Reply Error:", err);
      alert("Failed to send reply");
    }
  };

  // 4. Close/Reopen Ticket
  const toggleTicketStatus = async () => {
    const action = selectedIssue.status === "OPEN" ? "close" : "reopen";
    const confirmMsg = selectedIssue.status === "OPEN" 
      ? "Mark this ticket as Closed?" 
      : "Reopen this ticket?";
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const endpoint = selectedIssue.status === "OPEN" ? "close" : "reopen";
      await axios.put(`${API_BASE_URL}/${selectedIssue.id}/${endpoint}`);
      const updatedIssue = await axios.get(
        `${API_BASE_URL}/${selectedIssue.id}?requesterId=0&role=ADMIN`
      );
      setSelectedIssue(updatedIssue.data);
      fetchIssues();
      
      setShowSuccess(`Ticket ${action}ed successfully!`);
      setTimeout(() => setShowSuccess(""), 3000);
    } catch (err) {
      alert(`Failed to ${action} ticket.`);
    }
  };

  // 5. Filter and search issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === "" || 
      issue.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      issue.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === "ALL" || issue.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': '#EF4444',
      'RESOLVED': '#10B981',
      'CLOSED': '#6B7280',
      'IN_PROGRESS': '#3B82F6',
      'PENDING': '#F59E0B'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'OPEN': <FaExclamationCircle />,
      'RESOLVED': <FaCheckCircle />,
      'CLOSED': <FaLock />,
      'IN_PROGRESS': <FaClock />,
      'PENDING': <FaCommentDots />
    };
    return icons[status] || <FaComments />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="issue-management-modern">
      
      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <FaCheckCircle />
          <span>{showSuccess}</span>
          <button className="close-btn" onClick={() => setShowSuccess("")}>
            <FaTimesCircle />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="im-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}>
            <FaExclamationCircle />
          </div>
          <div className="stat-content">
            <h3>Open Tickets</h3>
            <div className="stat-value">
              {issues.filter(i => i.status === "OPEN").length}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <div className="stat-value">
              {issues.filter(i => i.status === "IN_PROGRESS").length}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <div className="stat-value">
              {issues.filter(i => i.status === "RESOLVED").length}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6B7280, #9CA3AF)' }}>
            <FaLock />
          </div>
          <div className="stat-content">
            <h3>Closed</h3>
            <div className="stat-value">
              {issues.filter(i => i.status === "CLOSED").length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="im-main-content">
        {/* Left Column - Tickets List */}
        <div className="im-left-column">
          {/* Filters & Search */}
          <div className="filters-card">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search tickets by ID, subject, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>
                  <FaFilter className="filter-icon" />
                  Filter by Status
                </label>
                <div className="filter-buttons">
                  {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                    <button
                      key={status}
                      className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                      onClick={() => setFilterStatus(status)}
                      style={filterStatus === status ? {
                        backgroundColor: getStatusColor(status === 'ALL' ? '#6B7280' : status),
                        color: 'white'
                      } : {}}
                    >
                      {status === 'ALL' ? 'All Tickets' : status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="results-info">
                <span className="count-badge">{filteredIssues.length}</span>
                <span>tickets found</span>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="tickets-list-modern">
            <div className="list-header">
              <h3>Recent Tickets ({issues.length})</h3>
            </div>
            
            <div className="tickets-container">
              {filteredIssues.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h4>No tickets found</h4>
                  <p>Try changing your filters or search term</p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`ticket-card ${selectedIssue?.id === issue.id ? 'selected' : ''} ${issue.status === 'OPEN' ? 'urgent' : ''}`}
                    onClick={() => openTicket(issue.id)}
                  >
                    <div className="ticket-card-header">
                      <div className="ticket-id">
                        <span className="id-label">ID:</span>
                        <span className="id-value">#{issue.id}</span>
                      </div>
                      <div className="ticket-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(issue.status) }}
                        >
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ticket-card-body">
                      <h4 className="ticket-subject">{issue.subject}</h4>
                      <p className="ticket-preview">
                        {issue.description.length > 100 
                          ? `${issue.description.substring(0, 100)}...` 
                          : issue.description}
                      </p>
                      
                      <div className="ticket-meta">
                        <div className="meta-item">
                          <FaUser className="meta-icon" />
                          <span>{issue.user?.firstName || issue.user?.name || 'Pickup Person'}</span>
                        </div>
                        <div className="meta-item">
                          <FaClock className="meta-icon" />
                          <span>{formatDate(issue.lastUpdatedAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FaCommentDots className="meta-icon" />
                          <span>{issue.messages?.length || 0} messages</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ticket-card-footer">
                      <button 
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTicket(issue.id);
                        }}
                      >
                        <FaEye /> {issue.status === "CLOSED" ? "View" : "Chat"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chat */}
        <div className="im-right-column">
          {selectedIssue ? (
            <div className="chat-card">
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-content">
                  <div className="chat-title">
                    <h3>
                      <FaEnvelope /> Ticket #{selectedIssue.id}
                    </h3>
                    <div className="chat-subject">{selectedIssue.subject}</div>
                  </div>
                  <div className="chat-status">
                    <span 
                      className="chat-status-badge"
                      style={{ backgroundColor: getStatusColor(selectedIssue.status) }}
                    >
                      {getStatusIcon(selectedIssue.status)}
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button 
                    className="status-toggle-btn"
                    onClick={toggleTicketStatus}
                  >
                    {selectedIssue.status === "OPEN" ? (
                      <>
                        <FaLock /> Close Ticket
                      </>
                    ) : (
                      <>
                        <FaUnlock /> Reopen Ticket
                      </>
                    )}
                  </button>
                  <button 
                    className="close-chat-btn"
                    onClick={() => setSelectedIssue(null)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="user-info-section">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {selectedIssue.user?.firstName || selectedIssue.user?.name || 'Pickup Person'}
                  </div>
                  <div className="user-email">
                    {selectedIssue.user?.email || 'No email provided'}
                  </div>
                </div>
                <div className="ticket-created">
                  <FaClock />
                  <span>Created: {new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="messages-container">
                {/* Original Issue */}
                <div className="message-bubble system">
                  <div className="message-header">
                    <strong>Original Issue</strong>
                  </div>
                  <div className="message-content">
                    {selectedIssue.description}
                  </div>
                  <div className="message-time">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Messages */}
                {selectedIssue.messages?.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message-bubble ${msg.senderRole === "ADMIN" ? "admin" : "user"}`}
                  >
                    <div className="message-header">
                      <div className="message-sender">
                        <strong>{msg.senderName}</strong>
                        <span className="sender-role">
                          {msg.senderRole === "ADMIN" ? "Administrator" : "User"}
                        </span>
                      </div>
                    </div>
                    <div className="message-content">
                      {msg.message}
                    </div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {selectedIssue.status !== "CLOSED" ? (
                <div className="chat-input-section">
                  <div className="input-wrapper">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="chat-input"
                      rows="3"
                    />
                    <button 
                      onClick={handleReply} 
                      className="send-btn"
                      disabled={!replyText.trim()}
                    >
                      <FaPaperPlane /> Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-closed-message">
                  <FaLock />
                  <span>This ticket is closed. Reopen it to send messages.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection-card">
              <div className="no-selection-icon">
                <FaComments />
              </div>
              <h3>Select a Ticket</h3>
              <p>Choose a ticket from the list to view conversation and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}