import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import '../../../styles/admin/tickets/ticket-detail.css';

const TicketDetail = () => {
  const { id } = useParams();
  
  // Local state for interactive thread
  const [replyText, setReplyText] = useState('');
  const [thread, setThread] = useState([
    { 
      id: 1, 
      sender: 'Rahul Sharma', 
      role: 'Engineering', 
      avatar: 'RS', 
      time: '04 Aug 2026, 14:30', 
      content: 'My laptop screen is flickering after the Windows update. Please check ASAP.', 
      attachment: 'screenshot.png' 
    },
    { 
      id: 2, 
      sender: 'IT Support', 
      role: 'Admin', 
      avatar: 'IT', 
      time: '05 Aug 2026, 10:00', 
      content: "We'll send someone to check your laptop today at your desk.", 
      attachment: null 
    }
  ]);

  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('High');
  const [assignee, setAssignee] = useState('IT Support');

  const handleSend = () => {
    if (!replyText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'You',
      role: 'Admin',
      avatar: 'ME',
      time: '05 Aug 2026, Just now',
      content: replyText,
      attachment: null
    };
    
    setThread([...thread, newMessage]);
    setReplyText('');
  };

  return (
    <motion.div 
      className="ticket-detail-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/admin/tickets" className="back-link">
        <ArrowLeft size={20} /> Back to Queue
      </Link>
      
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {id || 'TKT-001'} <span style={{ color: 'var(--text-tertiary)', fontSize: '18px', fontWeight: '400' }}>Laptop not working</span>
          </h1>
        </div>
      </div>

      <div className="ticket-layout">
        {/* Left Column - Thread */}
        <div className="thread-section">
          {thread.map(msg => (
            <div key={msg.id} className="message-card">
              <div className="message-header">
                <div className="sender-avatar">{msg.avatar}</div>
                <div className="sender-info">
                  <h3>{msg.sender}</h3>
                  <span>{msg.role} • {msg.time}</span>
                </div>
              </div>
              <div className="message-body">
                {msg.content}
              </div>
              {msg.attachment && (
                <div className="message-attachment">
                  <Paperclip size={16} /> {msg.attachment}
                </div>
              )}
            </div>
          ))}

          {/* Reply Box */}
          <div className="reply-box">
            <textarea 
              className="reply-textarea" 
              placeholder="Type your reply here..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            ></textarea>
            <div className="reply-actions">
              <button className="btn-attach">
                <Paperclip size={18} /> Attach File
              </button>
              <button className="btn-send" onClick={handleSend}>
                Send Reply
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Status</span>
              <select className="info-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="info-row">
              <span className="info-label">Priority</span>
              <select className="info-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <div className="info-value">IT</div>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned To</span>
              <select className="info-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                <option value="IT Support">IT Support</option>
                <option value="Network Admin">Network Admin</option>
                <option value="Hardware Team">Hardware Team</option>
              </select>
            </div>
          </div>

          <div className="info-card">
            <span className="info-label">Raised By</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>RS</div>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Rahul Sharma</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Engineering • EMP-001</div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <span className="info-label">Timeline</span>
            <div className="timeline">
              <div className="timeline-item">
                <div style={{ fontWeight: '500' }}>Reply sent</div>
                <div className="timeline-date">Aug 05, 10:00 AM</div>
              </div>
              <div className="timeline-item">
                <div style={{ fontWeight: '500' }}>Assigned to IT Support</div>
                <div className="timeline-date">Aug 04, 02:45 PM</div>
              </div>
              <div className="timeline-item">
                <div style={{ fontWeight: '500' }}>Ticket Created</div>
                <div className="timeline-date">Aug 04, 02:30 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetail;
