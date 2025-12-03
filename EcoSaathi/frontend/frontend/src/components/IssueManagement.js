import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Admin.css";

export default function IssueManagement({ API_BASE_URL }) {
  const [issues, setIssues] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  // 1. Fetch Issues
  const fetchIssues = async () => {
    try {
      // Ensure URL is clean
      const url = `${API_BASE_URL}/all`; 
      console.log("Fetching issues from:", url); // Debug Check

      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        // Sort by latest update
        const sorted = res.data.sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));
        setIssues(sorted);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]);
    }
  };

  useEffect(() => {
    fetchIssues();
    // Auto refresh every 30 seconds for live updates
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // 2. Open Chat
  const openTicket = async (issueId) => {
    setLoadingChat(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/${issueId}?requesterId=0&role=ADMIN`
      );
      setSelectedIssue(res.data);
    } catch (err) {
      alert("Error loading chat details.");
    }
    setLoadingChat(false);
  };

  // 3. Admin Reply
  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      // DTO structure ke hisab se data bhejein
      const payload = {
        role: "ADMIN",
        senderId: 0, // 0 for Admin
        message: replyText,
      };

      const res = await axios.post(
        `${API_BASE_URL}/${selectedIssue.id}/reply`,
        payload
      );

      // UI Update karein immediate
      setSelectedIssue(res.data); // Updated issue with new message
      setReplyText("");
      fetchIssues(); // Refresh list to update status
    } catch (err) {
      console.error("Reply Error:", err);
      alert("Failed to send reply");
    }
  };

  // 4. Close Ticket
  const closeTicket = async (id) => {
    if (!window.confirm("Mark this ticket as Closed?")) return;
    try {
      await axios.put(`${API_BASE_URL}/${id}/close`);
      fetchIssues();
      setSelectedIssue(null);
    } catch (err) {
      alert("Failed to close ticket.");
    }
  };

  return (
    <div className="issue-management-container">
      <h3>Support Tickets Management</h3>

      <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 150px)" }}>
        
        {/* LEFT LIST */}
        <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid #eee", paddingRight: "10px" }}>
          <table className="user-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No tickets found. <br/> <small>Verify if any user created a ticket.</small>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} 
                      style={{ backgroundColor: issue.status === "OPEN" ? "#fff0f0" : "white" }}>
                    <td>#{issue.id}</td>
                    <td>
                        <div style={{fontWeight: "bold"}}>{issue.subject}</div>
                        <small>{issue.user ? `👤 ${issue.user.firstName}` : "🚛 Pickup Person"}</small>
                    </td>
                    <td>
                      <span className={`status-tag status-${issue.status?.toLowerCase()}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{new Date(issue.lastUpdatedAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => openTicket(issue.id)} className="edit-btn">
                        {issue.status === "CLOSED" ? "View" : "Chat"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT CHAT */}
        {selectedIssue ? (
          <div className="chat-window" style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
            
            {/* Chat Header */}
            <div style={{ padding: "15px", background: "white", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0 }}>Ticket #{selectedIssue.id}: {selectedIssue.subject}</h4>
                <small style={{ color: "#666" }}>Status: <b>{selectedIssue.status}</b></small>
              </div>
              <button onClick={() => setSelectedIssue(null)} style={{ border: "none", background: "transparent", fontSize: "1.2rem", cursor: "pointer" }}>❌</button>
            </div>

            {/* Chat Messages */}
            <div className="messages-area" style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* Description Block */}
              <div className="message-bubble left" style={{border: "1px dashed #ccc", background: "#fff"}}>
                <strong>Original Issue:</strong>
                <p style={{margin: "5px 0"}}>{selectedIssue.description}</p>
              </div>

              {selectedIssue.messages?.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.senderRole === "ADMIN" ? "right" : "left"}`}>
                  <strong>{msg.senderName}</strong>
                  <p>{msg.message}</p>
                  <small style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              ))}
            </div>

            {/* Input Area */}
            {selectedIssue.status !== "CLOSED" ? (
              <div style={{ padding: "15px", background: "white", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply to user..."
                  style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <button onClick={handleReply} className="edit-btn">Send</button>
                <button onClick={() => closeTicket(selectedIssue.id)} style={{ background: "#dc3545", color: "white", border: "none", borderRadius: "5px", padding: "0 15px", cursor: "pointer" }}>Close</button>
              </div>
            ) : (
              <div style={{ padding: "15px", textAlign: "center", background: "#eee", color: "#666" }}>
                This ticket is closed.
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#888", border: "2px dashed #eee" }}>
            Select a ticket from the left to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}