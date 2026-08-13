import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, User, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  Plus, X, Tag, Clock, Paperclip, Send, Download, Ticket,
  ArrowRight, AlertTriangle, CheckCircle2, RotateCcw, Filter,
  ChevronLeft, ChevronRight, FileImage, FileText as FilePdf,
  Inbox, Shield, HelpCircle, PackageOpen, LifeBuoy, UploadCloud,
  Phone,
  Monitor,
  Trash2
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
import { getMyTickets, raiseTicket, deleteTicket } from '../../services/employeeService';

// ─── Mock Data ────────────────────────────────────────────────────────────
const DEPARTMENTS = ['IT Support', 'HR', 'Admin', 'Finance', 'Payroll'];

const MOCK_TICKETS = [];

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
  const [attachments, setAttachments] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 10MB allowed.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const isImg = file.type.startsWith('image/');
        const newAttachment = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: isImg ? 'img' : (file.type.includes('pdf') ? 'pdf' : 'doc'),
          url: reader.result
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const filtered = tickets.filter(t => {
    const tabOk = TAB_FILTERS[activeTab](t);
    const searchOk = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const deptOk = deptFilter === 'all' || (t.category || t.department) === deptFilter;
    const priorOk = priorityFilter === 'all' || t.priority === priorityFilter;
    return tabOk && searchOk && deptOk && priorOk;
  });

  const selected = tickets.find(t => t.id === selectedId);

  const handleCreateTicket = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      alert('Please fill out the subject and description.');
      return;
    }
    const { data, error } = await raiseTicket({
      employee_id: user?.id || 'MOCK-123',
      authorName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Employee',
      subject: form.subject,
      category: form.dept,
      department: form.dept,
      priority: form.priority,
      description: form.description,
      status: 'open',
      attachments: attachments
    });
    if (data) {
      setTickets(prev => [data, ...prev.filter(t => t.id !== data.id)]);
      setSelectedId(data.id);
      setShowCreateModal(false);
      setForm({ dept: 'IT Support', priority: 'medium', subject: '', description: '' });
      setAttachments([]);
    } else {
      alert('Error creating ticket: ' + (error?.message || 'Unknown error'));
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

  const handleDeleteTicket = async (id) => {
    const targetId = id || selectedId;
    if (!targetId) return;
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    await deleteTicket(targetId);
    setTickets(prev => prev.filter(t => t.id !== targetId));
    if (selectedId === targetId) setSelectedId(null);
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
                        <div key={i} className="tkt-attach-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <div className={`tkt-attach-icon ${a.type}`}>
                              {a.type === 'img' && <FileImage size={18} />}
                              {a.type === 'pdf' && <FilePdf size={18} />}
                              {(a.type === 'doc' || a.type === 'other') && <FileText size={18} />}
                            </div>
                            <div className="tkt-attach-info" style={{ flex: 1 }}>
                              <div className="tkt-attach-name">{a.name}</div>
                              <div className="tkt-attach-size">{a.size}</div>
                            </div>
                            {a.url && (
                              <a href={a.url} download={a.name} target="_blank" rel="noreferrer" className="tkt-attach-dl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Download size={13} />
                              </a>
                            )}
                          </div>
                          {a.type === 'img' && a.url && (
                            <div style={{ marginTop: '4px', width: '100%' }}>
                              <img 
                                src={a.url} 
                                alt={a.name} 
                                style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain', cursor: 'pointer' }}
                                onClick={() => window.open(a.url, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="tkt-detail-card">
                  <div className="tkt-section-title"><AlertTriangle size={14} /> Actions</div>
                  <div className="tkt-action-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selected.status !== 'closed' && (
                      <button className="tkt-action-btn close-tkt" onClick={handleCloseTicket}>
                        <X size={14} /> Close Ticket
                      </button>
                    )}
                    {selected.status === 'resolved' && (
                      <button className="tkt-action-btn reopen-tkt">
                        <RotateCcw size={14} /> Reopen
                      </button>
                    )}
                    <button 
                      className="tkt-action-btn delete-tkt" 
                      style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleDeleteTicket(selected.id)}
                    >
                      <Trash2 size={14} /> Delete Ticket
                    </button>
                  </div>
                </div>

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
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <UploadCloud size={32} style={{ margin: '0 auto 8px', color: '#64748b' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                    Click to select or upload images & attachments
                  </p>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Supports: JPG, PNG, GIF, WEBP, PDF, ZIP (Max 10MB)</span>
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="file"
                      accept="image/*,.pdf,.zip,.doc,.docx"
                      multiple
                      onChange={handleImageUpload}
                      style={{ cursor: 'pointer', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {attachments.map((att, idx) => (
                      <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {att.type === 'img' && att.url ? (
                          <img src={att.url} alt={att.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <FileImage size={24} color="#3b82f6" />
                        )}
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                          <div style={{ color: '#64748b' }}>{att.size}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
