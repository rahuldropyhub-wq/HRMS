import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Paperclip, Send, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getAllTickets, updateTicketStatus } from '../../../services/adminService';
import '../../../styles/admin/tickets/ticket-detail.css';

const TicketDetail = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState('');
  const [thread, setThread] = useState([]);
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('Unassigned');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getAllTickets();
      if (data && Array.isArray(data)) {
        const found = data.find(t => String(t.id).toLowerCase() === String(id).toLowerCase());
        if (found) {
          setTicket(found);
          setStatus(found.status ? (found.status.charAt(0).toUpperCase() + found.status.slice(1)) : 'Open');
          setPriority(found.priority ? (found.priority.charAt(0).toUpperCase() + found.priority.slice(1)) : 'Medium');
          setAssignee(found.assigned_to || found.assignedTo || 'Unassigned');

          // Parse conversation
          const conv = found.conversation && Array.isArray(found.conversation) && found.conversation.length > 0
            ? found.conversation.map((c, i) => ({
                id: i + 1,
                sender: c.author || c.sender || found.employee_name || 'Requester',
                role: c.role || found.department || 'User',
                avatar: (c.author || found.employee_name || 'U').substring(0, 2).toUpperCase(),
                time: c.time || (found.created_at ? new Date(found.created_at).toLocaleString() : 'Recently'),
                content: c.text || c.content || '',
                attachment: c.attachment || null
              }))
            : [
                {
                  id: 1,
                  sender: found.employee_name || found.authorName || 'Requester',
                  role: found.department || 'Engineering',
                  avatar: (found.employee_name || 'RE').substring(0, 2).toUpperCase(),
                  time: found.created_at ? new Date(found.created_at).toLocaleString() : 'Recently',
                  content: found.description || 'No description provided.',
                  attachment: null
                }
              ];
          setThread(conv);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    if (id) {
      await updateTicketStatus(id, newStatus.toLowerCase());
    }
  };

  const handleSend = () => {
    if (!replyText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'Admin Support',
      role: 'System Administrator',
      avatar: 'AD',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyText,
      attachment: null
    };

    const updatedThread = [...thread, newMessage];
    setThread(updatedThread);
    setReplyText('');

    // Persist conversation update in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('hrms_local_tickets') || '[]');
      const updatedLocal = local.map(t => {
        if (String(t.id) === String(id)) {
          return {
            ...t,
            conversation: updatedThread.map(m => ({ author: m.sender, role: m.role, text: m.content, time: m.time }))
          };
        }
        return t;
      });
      localStorage.setItem('hrms_local_tickets', JSON.stringify(updatedLocal));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
        <p>Loading ticket details...</p>
      </div>
    );
  }

  const raisedByName = ticket?.employee_name || ticket?.profiles ? `${ticket.profiles.first_name || ''} ${ticket.profiles.last_name || ''}`.trim() : 'Employee';
  const raisedByDept = ticket?.department || ticket?.profiles?.departments?.name || 'Department';

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
            {id || 'TKT-001'} <span style={{ color: 'var(--text-tertiary)', fontSize: '18px', fontWeight: '400' }}>{ticket?.subject || 'Support Request'}</span>
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
              <button className="btn-send" onClick={handleSend} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> Send Reply
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Status</span>
              <select className="info-select" value={status} onChange={e => handleStatusChange(e.target.value)}>
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
              <div className="info-value">{raisedByDept}</div>
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
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {raisedByName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{raisedByName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{raisedByDept}</div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <span className="info-label">Timeline</span>
            <div className="timeline">
              <div className="timeline-item">
                <div style={{ fontWeight: '500' }}>Ticket Created</div>
                <div className="timeline-date">{ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : 'Recently'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetail;
