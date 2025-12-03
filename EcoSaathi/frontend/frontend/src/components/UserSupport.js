import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/UserSupport.css"; 

export default function UserSupport() {
  const { id } = useParams();
  
  // --- State Variables ---
  const [issues, setIssues] = useState([]); // List of tickets
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'history'
  
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null); // For chat view
  const [replyText, setReplyText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const API_BASE = "http://localhost:8080/api/issues";

  // --- 1. Fetch Issues ---
  const fetchIssues = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE}/user/${id}`);
      console.log("Fetched Issues:", res.data);
      
      if (Array.isArray(res.data)) {
        setIssues(res.data);
      } else {
        setIssues([]); // Safety fallback
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]); 
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [id]);

  // --- 2. Create New Ticket ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/create/user/${id}`, {
        subject,
        description,
      });
      alert("Ticket created successfully!");
      setSubject("");
      setDescription("");
      setActiveTab("history"); // Switch to history tab
      fetchIssues(); // Refresh list
    } catch (err) {
      console.error("Create Error:", err);
      alert("Failed to create ticket.");
    }
  };

  // --- 3. Open Chat ---
  const openChat = async (issueId) => {
    setLoadingChat(true);
    try {
      const res = await axios.get(`${API_BASE}/${issueId}?requesterId=${id}&role=USER`);
      setSelectedIssue(res.data);
    } catch (err) {
      console.error("Error opening chat", err);
      alert("Could not load ticket details.");
    } finally {
      setLoadingChat(false);
    }
  };

  // --- 4. Send Reply ---
  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      const payload = {
        role: "USER",
        senderId: id,
        message: replyText
      };
      const res = await axios.post(`${API_BASE}/${selectedIssue.id}/reply`, payload);
      
      setSelectedIssue(res.data); // Update chat with new message
      setReplyText("");
    } catch (err) {
      alert("Failed to send reply.");
    }
  };

  // --- FAQs ---
  const faqs = [
    {
      question: "How long does it take to get a reply?",
      answer: "Usually 24–48 hours. Urgent issues are prioritized."
    },
    {
      question: "What do the statuses mean?",
      answer: "OPEN: Created. WAITING_FOR_USER: Admin replied. RESOLVED: Issue fixed."
    },
    {
      question: "Can I reopen a closed ticket?",
      answer: "No, please create a new ticket referencing the old ID."
    },
    {
      question: "Can I update my ticket?",
      answer: "Yes, you can reply to an open ticket with more details."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // --- RENDER ---
  return (
    <div className="support-page">
      <div className="container support-container">
        
        <div className="support-header">
          <div>
            <h2>🛠 Help & Support</h2>
            <p className="support-subtitle">Raise a ticket, chat with support, or check FAQs.</p>
          </div>
        </div>

        {/* If Chat is open, show chat window */}
        {selectedIssue ? (
            <div className="chat-interface-container">
                <button className="back-btn" onClick={() => { setSelectedIssue(null); fetchIssues(); }}>
                    ← Back to My Tickets
                </button>
                
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>#{selectedIssue.id} - {selectedIssue.subject}</h3>
                        <span className={`status-badge status-${selectedIssue.status.toLowerCase()}`}>
                            {selectedIssue.status}
                        </span>
                    </div>

                    <div className="messages-area">
                        {/* Original Description */}
                        <div className="message-bubble left original-issue">
                            <small><b>Description:</b></small>
                            <p>{selectedIssue.description}</p>
                        </div>

                        {/* Chat Messages */}
                        {selectedIssue.messages && selectedIssue.messages.map((msg) => (
                            <div key={msg.id} 
                                 className={`message-bubble ${msg.senderRole === 'USER' ? 'right' : 'left'}`}>
                                <small className="sender-name">{msg.senderName}</small>
                                <p>{msg.message}</p>
                               <span className="msg-time">
  {msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : ""}
</span>

                            </div>
                        ))}
                    </div>

                    {selectedIssue.status !== 'CLOSED' ? (
                        <div className="chat-input-area">
                            <input 
                                type="text" 
                                value={replyText} 
                                onChange={(e) => setReplyText(e.target.value)} 
                                placeholder="Type a reply..." 
                            />
                            <button onClick={sendReply} className="send-btn">Send ➤</button>
                        </div>
                    ) : (
                        <div className="closed-notice">This ticket is closed.</div>
                    )}
                </div>
            </div>
        ) : (
            // MAIN VIEW (Create/History Tabs + FAQ)
            <div className="support-layout">
              <div className="support-main">
                <div className="tabs">
                  <button onClick={() => setActiveTab("create")} className={activeTab === "create" ? "active" : ""}>
                    ✉️ Create Ticket
                  </button>
                  <button onClick={() => { setActiveTab("history"); fetchIssues(); }} className={activeTab === "history" ? "active" : ""}>
                    📜 My Tickets
                  </button>
                </div>

                {/* CREATE TAB */}
                {activeTab === "create" && (
                  <form onSubmit={handleSubmit} className="support-form">
                    <label>Subject</label>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g., Login Issue" />

                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="5" placeholder="Describe your issue..." />

                    <button type="submit" className="primary-btn">Submit Ticket</button>
                  </form>
                )}

                {/* HISTORY TAB */}
                {activeTab === "history" && (
                  <div className="issues-list">
                    {!Array.isArray(issues) || issues.length === 0 ? (
                      <p className="empty-text">No tickets found.</p>
                    ) : (
                      issues.map((issue) => (
                        <div key={issue.id} className="issue-card" onClick={() => openChat(issue.id)}>
                          <div className="issue-header">
                            <h4>#{issue.id} - {issue.subject}</h4>
                            <span className={`status-badge status-${(issue.status || "").toLowerCase()}`}>
                              {issue.status}
                            </span>
                          </div>
                          <p className="issue-description">
                            {issue.description ? issue.description.substring(0, 80) : "No description"}...
                          </p>
                          <small className="tap-hint">Tap to view conversation</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: FAQ Panel */}
              <div className="support-faq">
                <h3 className="faq-title">❓ Frequently Asked Questions</h3>
                <div className="faq-list">
                  {faqs.map((item, index) => (
                    <div key={index} className={`faq-item ${openFaqIndex === index ? "faq-open" : ""}`}>
                      <button type="button" className="faq-question" onClick={() => toggleFaq(index)}>
                        <span>{item.question}</span>
                        <span className={`faq-icon ${openFaqIndex === index ? "rotate" : ""}`}>▾</span>
                      </button>
                      {openFaqIndex === index && <div className="faq-answer"><p>{item.answer}</p></div>}
                    </div>
                  ))}
                </div>
                
                <div className="faq-footer">
                    Still stuck? <span>Raise a ticket on the left ➜</span>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}