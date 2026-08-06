import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, User, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  Plus, X, Tag, Clock, Paperclip, Send, Download, Ticket,
  ArrowRight, AlertTriangle, CheckCircle2, RotateCcw, Filter,
  ChevronLeft, ChevronRight, FileImage, FileText as FilePdf,
  Inbox, Shield, HelpCircle, PackageOpen, LifeBuoy,
  Phone,
  Monitor
} from 'lucide-react';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
  FileUpload,
  FormFooter
} from '../../components/employee/EnterpriseForm';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/tickets.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyTickets, raiseTicket } from '../../services/employeeService';

// ─── Mock Data ────────────────────────────────────────────────────────────
const DEPARTMENTS = ['IT Support', 'HR', 'Admin', 'Finance', 'Payroll'];

const MOCK_TICKETS = [
  {
    id: 'TKT-2025-0041', subject: 'Laptop keyboard not working properly',
    department: 'IT Support', priority: 'high', status: 'in-progress',
    createdAt: '2025-08-01', assignedTo: 'Arjun Mehta',
    description: 'My laptop keyboard has some keys that are not responding. The Shift key and the Enter key are completely non-functional since yesterday morning. I have tried restarting but the issue persists.',
    attachments: [{ name: 'keyboard_issue.jpg', size: '1.2 MB', type: 'img' }],
    timeline: [
      { type: 'created',  action: 'Ticket Created',   sub: 'by Balaji Kumar', time: 'Aug 1, 09:15 AM' },
      { type: 'assigned', action: 'Assigned to Arjun Mehta', sub: 'IT Support Team', time: 'Aug 1, 09:45 AM' },
      { type: 'comment',  action: 'Comment Added',    sub: 'Support is checking the issue', time: 'Aug 1, 11:00 AM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Please resolve this as soon as possible. I am unable to work efficiently.', time: 'Aug 1, 09:16 AM' },
      { author: 'Arjun Mehta', role: 'support', text: 'Hi Balaji, I have received your ticket. I will check if a replacement keyboard is available. Can you confirm your workstation location?', time: 'Aug 1, 10:05 AM' },
      { author: 'Balaji Kumar', role: 'employee', text: 'I am at Desk 3B, Floor 2.', time: 'Aug 1, 10:12 AM' },
    ],
  },
  {
    id: 'TKT-2025-0040', subject: 'Request for Salary Slip - July 2025',
    department: 'Payroll', priority: 'medium', status: 'resolved',
    createdAt: '2025-07-30', assignedTo: 'Priya Sharma',
    description: 'I need the salary slip for July 2025 for submitting to my bank for loan processing. Please share the document at the earliest.',
    attachments: [],
    timeline: [
      { type: 'created',  action: 'Ticket Created',   sub: 'by Balaji Kumar', time: 'Jul 30, 02:00 PM' },
      { type: 'assigned', action: 'Assigned to Priya Sharma', sub: 'Payroll Team', time: 'Jul 30, 02:20 PM' },
      { type: 'resolved', action: 'Ticket Resolved',  sub: 'Salary slip shared via email', time: 'Jul 31, 10:00 AM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Need the July salary slip for bank loan processing urgently.', time: 'Jul 30, 02:02 PM' },
      { author: 'Priya Sharma', role: 'support', text: 'Sure Balaji, I will generate and email you the salary slip within today.', time: 'Jul 30, 03:00 PM' },
      { author: 'Priya Sharma', role: 'support', text: 'The salary slip has been sent to your registered email. Please check.', time: 'Jul 31, 09:55 AM' },
      { author: 'Balaji Kumar', role: 'employee', text: 'Received, thank you!', time: 'Jul 31, 10:10 AM' },
    ],
  },
  {
    id: 'TKT-2025-0038', subject: 'Internet connectivity issue at workstation',
    department: 'IT Support', priority: 'critical', status: 'open',
    createdAt: '2025-08-04', assignedTo: null,
    description: 'The internet connection at my workstation is extremely slow or dropping frequently since this morning. The issue is affecting my ability to access company resources and video calls.',
    attachments: [{ name: 'speed_test.png', size: '340 KB', type: 'img' }],
    timeline: [
      { type: 'created', action: 'Ticket Created', sub: 'by Balaji Kumar', time: 'Aug 4, 10:00 AM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Internet speed test shows 1 Mbps. Expected is 100 Mbps. Please fix ASAP.', time: 'Aug 4, 10:02 AM' },
    ],
  },
  {
    id: 'TKT-2025-0035', subject: 'Attendance regularization for 2nd August 2025',
    department: 'HR', priority: 'medium', status: 'assigned',
    createdAt: '2025-08-03', assignedTo: 'Kavitha R.',
    description: 'I forgot to check in on 2nd August as I had a client visit in the morning. Requesting regularization for the same date. The client meeting was officially scheduled.',
    attachments: [{ name: 'client_meeting_invite.pdf', size: '210 KB', type: 'pdf' }],
    timeline: [
      { type: 'created',  action: 'Ticket Created',   sub: 'by Balaji Kumar', time: 'Aug 3, 04:00 PM' },
      { type: 'assigned', action: 'Assigned to Kavitha R.', sub: 'HR Team', time: 'Aug 3, 04:30 PM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Requesting attendance regularization. Proof of client meeting attached.', time: 'Aug 3, 04:01 PM' },
      { author: 'Kavitha R.', role: 'support', text: 'We have received your request. Will review and update you within 2 business days.', time: 'Aug 3, 05:00 PM' },
    ],
  },
  {
    id: 'TKT-2025-0032', subject: 'Request for new ID card',
    department: 'Admin', priority: 'low', status: 'closed',
    createdAt: '2025-07-20', assignedTo: 'Ravi Kumar',
    description: 'My ID card was lost. Requesting a new one at the earliest.',
    attachments: [],
    timeline: [
      { type: 'created',  action: 'Ticket Created',  sub: 'by Balaji Kumar',  time: 'Jul 20, 11:00 AM' },
      { type: 'assigned', action: 'Assigned',        sub: 'Admin Team',        time: 'Jul 20, 11:30 AM' },
      { type: 'resolved', action: 'Resolved',        sub: 'ID Card delivered', time: 'Jul 22, 03:00 PM' },
      { type: 'closed',   action: 'Ticket Closed',   sub: 'Confirmed by employee', time: 'Jul 22, 03:30 PM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Lost my ID card. Please issue a new one.', time: 'Jul 20, 11:01 AM' },
      { author: 'Ravi Kumar',   role: 'support',  text: 'We will process the new ID card. It will be ready in 2 days.', time: 'Jul 20, 12:00 PM' },
      { author: 'Balaji Kumar', role: 'employee', text: 'Received the ID card. Closing the ticket. Thank you!', time: 'Jul 22, 03:25 PM' },
    ],
  },
  {
    id: 'TKT-2025-0030', subject: 'Software installation — VS Code & Postman',
    department: 'IT Support', priority: 'medium', status: 'resolved',
    createdAt: '2025-07-18', assignedTo: 'Arjun Mehta',
    description: 'Requesting installation of VS Code and Postman on my workstation for development work.',
    attachments: [],
    timeline: [
      { type: 'created',  action: 'Ticket Created', sub: 'by Balaji Kumar', time: 'Jul 18, 09:00 AM' },
      { type: 'assigned', action: 'Assigned',       sub: 'IT Team',         time: 'Jul 18, 10:00 AM' },
      { type: 'resolved', action: 'Resolved',       sub: 'Both apps installed', time: 'Jul 18, 03:00 PM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Please install VS Code and Postman.', time: 'Jul 18, 09:05 AM' },
      { author: 'Arjun Mehta', role: 'support', text: 'Both apps have been installed. Please verify and let me know.', time: 'Jul 18, 03:00 PM' },
    ],
  },
  {
    id: 'TKT-2025-0025', subject: 'Reimbursement claim for travel expense',
    department: 'Finance', priority: 'medium', status: 'waiting-employee',
    createdAt: '2025-07-15', assignedTo: 'Sundaram P.',
    description: 'Submitting reimbursement claim for client visit travel expense incurred on 12th July 2025.',
    attachments: [{ name: 'travel_bills.pdf', size: '890 KB', type: 'pdf' }, { name: 'receipts.zip', size: '2.1 MB', type: 'other' }],
    timeline: [
      { type: 'created',  action: 'Ticket Created',    sub: 'by Balaji Kumar', time: 'Jul 15, 10:00 AM' },
      { type: 'assigned', action: 'Assigned',           sub: 'Finance Team', time: 'Jul 15, 11:00 AM' },
      { type: 'comment',  action: 'Awaiting Info',      sub: 'Please share original bills', time: 'Jul 16, 09:00 AM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Attaching all travel bills for reimbursement.', time: 'Jul 15, 10:05 AM' },
      { author: 'Sundaram P.', role: 'support', text: 'We need the original physical bills as well. Please submit them to the finance desk.', time: 'Jul 16, 09:00 AM' },
    ],
  },
  {
    id: 'TKT-2025-0020', subject: 'Access request — Company GitHub Repository',
    department: 'IT Support', priority: 'high', status: 'closed',
    createdAt: '2025-07-10', assignedTo: 'Arjun Mehta',
    description: 'Requesting access to the company GitHub org and the main frontend repository for development work.',
    attachments: [],
    timeline: [
      { type: 'created',  action: 'Ticket Created', sub: 'by Balaji Kumar', time: 'Jul 10, 09:00 AM' },
      { type: 'assigned', action: 'Assigned',       sub: 'IT Team', time: 'Jul 10, 10:00 AM' },
      { type: 'resolved', action: 'Access Granted', sub: 'GitHub access provided', time: 'Jul 10, 02:00 PM' },
      { type: 'closed',   action: 'Ticket Closed',  sub: 'Confirmed by employee', time: 'Jul 10, 02:15 PM' },
    ],
    conversation: [
      { author: 'Balaji Kumar', role: 'employee', text: 'Please grant access to the frontend repo on GitHub.', time: 'Jul 10, 09:05 AM' },
      { author: 'Arjun Mehta', role: 'support', text: 'Access has been granted. You should receive an invite to your email.', time: 'Jul 10, 02:00 PM' },
    ],
  },
];

const TAB_FILTERS = {
  all:              () => true,
  open:             t => t.status === 'open',
  'in-progress':    t => ['assigned', 'in-progress', 'waiting-employee'].includes(t.status),
  resolved:         t => t.status === 'resolved',
  closed:           t => t.status === 'closed',
};

const PRIORITY_COLOR = {
  low: '🟢', medium: '🟡', high: '🟠', critical: '🔴',
};

const ATTACH_ICON_MAP = { img: 'img', pdf: 'pdf', doc: 'doc', other: 'other' };

const DEPT_ICON_MAP = {
  'IT Support': <Shield size={12} />,
  'HR': <User size={12} />,
  'Admin': <Inbox size={12} />,
  'Finance': <Tag size={12} />,
  'Payroll': <HelpCircle size={12} />,
};

function statusLabel(s) {
  return {
    open: 'Open', assigned: 'Assigned', 'in-progress': 'In Progress',
    'waiting-employee': 'Waiting', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected',
  }[s] || s;
}

const TL_DOT_TYPE = { created: 'created', assigned: 'assigned', comment: 'comment', resolved: 'resolved', closed: 'closed' };

export default function Tickets() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await getMyTickets(user.id);
      setTickets(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  // Form state
  const [form, setForm] = useState({ dept: 'IT Support', priority: 'medium', subject: '', description: '' });

  const filtered = tickets.filter(t => {
    const tabOk = TAB_FILTERS[activeTab](t);
    const searchOk = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const deptOk = deptFilter === 'all' || t.category === deptFilter;
    const priorOk = priorityFilter === 'all' || t.priority === priorityFilter;
    return tabOk && searchOk && deptOk && priorOk;
  });

  const selected = tickets.find(t => t.id === selectedId);

  const handleCreateTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    const { data, error } = await raiseTicket({
      employee_id: user.id,
      subject: form.subject,
      category: form.dept,
      priority: form.priority,
      description: form.description,
      status: 'open'
    });
    if (data) {
      setTickets(prev => [data, ...prev]);
      setSelectedId(data.id);
      setShowCreateModal(false);
      setForm({ dept: 'IT Support', priority: 'medium', subject: '', description: '' });
    } else {
      alert('Error: ' + error?.message);
    }
  };

  const handleSendComment = () => {
    if (!comment.trim() || !selectedId) return;
    setTickets(prev => prev.map(t => t.id === selectedId ? {
      ...t,
      conversation: [...t.conversation, {
        author: 'Balaji Kumar', role: 'employee',
        text: comment.trim(), time: 'Just now',
      }],
    } : t));
    setComment('');
  };

  const handleCloseTicket = () => {
    setTickets(prev => prev.map(t => t.id === selectedId ? { ...t, status: 'closed' } : t));
  };

  // Tab counts
  const tabCount = (key) => tickets.filter(TAB_FILTERS[key]).length;

  const TABS = [
    { key: 'all',         label: 'All Tickets' },
    { key: 'open',        label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved',    label: 'Resolved' },
    { key: 'closed',      label: 'Closed' },
  ];

  return (
    <DashboardLayout>

        {/* Ticket Split Layout */}
        <div className="tickets-layout">

          {/* ── LEFT PANEL ── */}
          <div className="tickets-left">
            <div className="tickets-left-header">
              <div className="tickets-title-row">
                <div>
                  <div className="tickets-title">Support Tickets</div>
                  <div className="tickets-subtitle">{tickets.length} total tickets</div>
                </div>
                <button className="btn-new-ticket" onClick={() => setShowCreateModal(true)}>
                  <Plus size={15} /> New Ticket
                </button>
              </div>

              {/* Tabs */}
              <div className="tickets-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`tickets-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {tabCount(tab.key) > 0 && (
                      <span style={{
                        marginLeft: 5, fontSize: 10, fontWeight: 700,
                        background: activeTab === tab.key ? '#3b82f6' : '#e5e7eb',
                        color: activeTab === tab.key ? '#fff' : '#6b7280',
                        borderRadius: 10, padding: '1px 6px',
                      }}>{tabCount(tab.key)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="tickets-filters">
              <div className="ticket-search-box">
                <Search size={13} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search ticket..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="ticket-filter-sel" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option value="all">All Dept</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="ticket-filter-sel" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* List */}
            <div className="tickets-list-scroll">
              {filtered.length === 0 && (
                <div className="tkt-empty"><Inbox size={36} /><p>No tickets found.</p></div>
              )}
              {filtered.map(t => (
                <div
                  key={t.id}
                  className={`ticket-card ${selectedId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="ticket-card-top">
                    <div className="ticket-card-subject">{t.subject}</div>
                    <div className="ticket-num">{t.id}</div>
                  </div>
                  <div className="ticket-card-meta">
                    <span>{DEPT_ICON_MAP[t.department] || null} {t.department}</span>
                    <span>•</span>
                    <span>{t.createdAt}</span>
                  </div>
                  <div className="ticket-card-footer">
                    <span className={`tkt-priority ${t.priority}`}>
                      {PRIORITY_COLOR[t.priority]} {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                    </span>
                    <span className={`tkt-status ${t.status}`}>
                      {statusLabel(t.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="tickets-pagination">
              <span>Showing {filtered.length} tickets</span>
              <div className="tkt-pg-btns">
                <button className="tkt-pg-btn"><ChevronLeft size={13} /></button>
                <button className="tkt-pg-btn active-pg">1</button>
                <button className="tkt-pg-btn"><ChevronRight size={13} /></button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="tickets-right">
            {!selected ? (
              <div className="tickets-right-empty">
                <Ticket size={48} strokeWidth={1.2} />
                <h3>Select a ticket to view details</h3>
                <p>Click any ticket from the list to open it here.</p>
              </div>
            ) : (
              <div className="ticket-detail-scroll">

                {/* ── Overview Card ── */}
                <div className="tkt-detail-card">
                  <div className="tkt-detail-header">
                    <div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{selected.id}</div>
                      <div className="tkt-detail-title">{selected.subject}</div>
                    </div>
                    <button className="tkt-detail-close-btn" onClick={() => setSelectedId(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="tkt-detail-badges">
                    <span className={`tkt-status ${selected.status}`}>{statusLabel(selected.status)}</span>
                    <span className={`tkt-priority ${selected.priority}`}>
                      {PRIORITY_COLOR[selected.priority]} {selected.priority.charAt(0).toUpperCase() + selected.priority.slice(1)}
                    </span>
                  </div>

                  <div className="tkt-detail-meta-grid">
                    <div className="tkt-meta-item">
                      <label>Department</label>
                      <div className="tkt-meta-value">{selected.department}</div>
                    </div>
                    <div className="tkt-meta-item">
                      <label>Assigned To</label>
                      <div className="tkt-meta-value">
                        {selected.assignedTo
                          ? <><div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{selected.assignedTo[0]}</div>{selected.assignedTo}</>
                          : <span style={{ color: '#9ca3af' }}>Unassigned</span>}
                      </div>
                    </div>
                    <div className="tkt-meta-item">
                      <label>Created</label>
                      <div className="tkt-meta-value"><Clock size={12} /> {selected.createdAt}</div>
                    </div>
                  </div>
                </div>

                {/* ── Description ── */}
                <div className="tkt-detail-card">
                  <div className="tkt-section-title"><FileText size={14} /> Description</div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{selected.description}</p>
                </div>

                {/* ── Timeline ── */}
                <div className="tkt-detail-card">
                  <div className="tkt-section-title">
                    <ArrowRight size={14} /> Timeline
                    <span className="tkt-count-badge">{selected.timeline.length}</span>
                  </div>
                  <div className="tkt-timeline">
                    {selected.timeline.map((item, i) => (
                      <div key={i} className="tkt-timeline-item">
                        <div className="tkt-tl-left">
                          <div className={`tkt-tl-dot ${item.type}`}>
                            {item.type === 'created'  && <Plus size={12} />}
                            {item.type === 'assigned' && <User size={12} />}
                            {item.type === 'comment'  && <MessageSquare size={12} />}
                            {item.type === 'resolved' && <CheckCircle2 size={12} />}
                            {item.type === 'closed'   && <X size={12} />}
                          </div>
                          {i < selected.timeline.length - 1 && <div className="tkt-tl-line" />}
                        </div>
                        <div className="tkt-tl-content">
                          <div className="tkt-tl-action">{item.action}</div>
                          {item.sub && <div className="tkt-tl-sub">{item.sub}</div>}
                          <div className="tkt-tl-time">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Conversation ── */}
                <div className="tkt-detail-card">
                  <div className="tkt-section-title">
                    <MessageSquare size={14} /> Conversation
                    <span className="tkt-count-badge">{selected.conversation.length}</span>
                  </div>

                  <div className="tkt-chat-list">
                    {selected.conversation.length === 0 && (
                      <p style={{ fontSize: 13, color: '#9ca3af' }}>No messages yet. Start the conversation.</p>
                    )}
                    {selected.conversation.map((msg, i) => (
                      <div key={i} className="tkt-chat-bubble">
                        <div className={`tkt-chat-avatar ${msg.role}`}>{msg.author[0]}</div>
                        <div className="tkt-chat-body">
                          <div className="tkt-chat-meta">
                            <span className="tkt-chat-author">{msg.author}</span>
                            <span className={`tkt-role-badge ${msg.role}`}>
                              {msg.role === 'employee' ? 'Employee' : 'Support'}
                            </span>
                            <span className="tkt-chat-time">{msg.time}</span>
                          </div>
                          <div className="tkt-chat-text">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Box */}
                  {selected.status !== 'closed' && (
                    <div className="tkt-comment-row">
                      <div className="tkt-comment-wrap">
                        <textarea
                          placeholder="Write a reply or update..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSendComment(); }}
                        />
                      </div>
                      <button className="tkt-send-btn" onClick={handleSendComment}><Send size={15} /></button>
                    </div>
                  )}
                  {selected.status !== 'closed' && (
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Press Ctrl+Enter to send</p>
                  )}
                </div>

                {/* ── Attachments ── */}
                {selected.attachments.length > 0 && (
                  <div className="tkt-detail-card">
                    <div className="tkt-section-title">
                      <Paperclip size={14} /> Attachments
                      <span className="tkt-count-badge">{selected.attachments.length}</span>
                    </div>
                    <div className="tkt-attach-grid">
                      {selected.attachments.map((a, i) => (
                        <div key={i} className="tkt-attach-row">
                          <div className={`tkt-attach-icon ${a.type}`}>
                            {a.type === 'img' && <FileImage size={18} />}
                            {a.type === 'pdf' && <FilePdf size={18} />}
                            {(a.type === 'doc' || a.type === 'other') && <FileText size={18} />}
                          </div>
                          <div className="tkt-attach-info">
                            <div className="tkt-attach-name">{a.name}</div>
                            <div className="tkt-attach-size">{a.size}</div>
                          </div>
                          <button className="tkt-attach-dl"><Download size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                {selected.status !== 'closed' && (
                  <div className="tkt-detail-card">
                    <div className="tkt-section-title"><AlertTriangle size={14} /> Actions</div>
                    <div className="tkt-action-bar">
                      <button className="tkt-action-btn close-tkt" onClick={handleCloseTicket}>
                        <X size={14} /> Close Ticket
                      </button>
                      {selected.status === 'resolved' && (
                        <button className="tkt-action-btn reopen-tkt">
                          <RotateCcw size={14} /> Reopen
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      {/* CREATE MODAL */}
      <EnterpriseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <FormHeader 
          icon={LifeBuoy} 
          title="Create New Support Ticket" 
          description="Submit a request for IT or HR assistance." 
        />
        
        <form onSubmit={handleCreateTicket}>
          <FormBody>
            <FormSection title="Support Request" description="Categorize and prioritize your issue.">
              <FormField label="Department" required>
                <SelectInput 
                  options={DEPARTMENTS}
                  value={form.dept} 
                  onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Priority" required>
                <SelectInput 
                  options={[
                    {value: 'low', label: 'Low'},
                    {value: 'medium', label: 'Medium'},
                    {value: 'high', label: 'High'},
                    {value: 'critical', label: 'Critical'}
                  ]}
                  value={form.priority} 
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Issue Category">
                <SelectInput 
                  options={['Hardware Issue', 'Software Issue', 'Access Request', 'Payroll Query', 'Other']}
                  required
                />
              </FormField>
              
              <FormField label="Contact Number">
                <TextInput placeholder="+1 (555) 000-0000" />
              </FormField>
            </FormSection>

            <FormSection title="Issue Details" description="Provide as much context as possible.">
              <FormField label="Subject" required fullWidth>
                <TextInput 
                  placeholder="Brief summary of your issue..."
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </FormField>
              
              <FormField label="Description" required fullWidth>
                <TextArea 
                  placeholder="Describe your issue in detail. Include steps to reproduce, affected systems, urgency etc..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Device / OS">
                <TextInput placeholder="e.g. MacBook Pro, macOS Sonoma" />
              </FormField>
              
              <FormField label="Browser">
                <TextInput placeholder="e.g. Chrome 120" />
              </FormField>

              <FormField label="Expected Resolution" fullWidth>
                <TextArea placeholder="What should happen instead?" />
              </FormField>
              
              <FormField label="Attachments & Screenshots" fullWidth>
                <FileUpload hint="Supports: Images, PDF, Word, Excel, ZIP - Max 10 MB" />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowCreateModal(false)} 
            submitText="Submit Ticket" 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}
