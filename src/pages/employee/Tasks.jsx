import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  User, Plus, SlidersHorizontal, ArrowUpDown, X, Send,
  Paperclip, Clock, CheckCircle2, AlertCircle, Circle,
  MoreHorizontal, CalendarDays, Timer, Layers, Download,
  Trash2, Image, FileIcon, ChevronLeft, ChevronRight, MoreVertical,
  Minus, Ticket, PackageOpen
} from 'lucide-react';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  DateInput,
  TextArea,
  TextInput,
  FileUpload,
  FormFooter
} from '../../components/employee/EnterpriseForm';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/tasks.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyTasks, updateTaskStatus, getCompanyProjects } from '../../services/employeeService';

// ─── Mock Data ─────────────────────────────────────────────────────────────


const STATUS_OPTIONS = ['not-started', 'in-progress', 'waiting-review', 'blocked', 'completed'];
const STATUS_LABELS = {
  'not-started': 'Not Started', 'assigned': 'Assigned', 'in-progress': 'In Progress',
  'waiting-review': 'Waiting Review', 'completed': 'Completed', 'approved': 'Approved',
  'rejected': 'Rejected', 'blocked': 'Blocked', 'on-hold': 'On Hold', 'cancelled': 'Cancelled',
};
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const TABS = ['My Tasks', 'Today', 'In Progress', 'Completed', 'Overdue', 'Archived'];
const today = new Date().toISOString().split('T')[0];

function priorityDot(p) {
  const map = { low: '#22c55e', medium: '#f59e0b', high: '#ea580c', critical: '#7c3aed' };
  return map[p] || '#6b7280';
}

function StatusBadge({ status }) {
  return <span className={`badge-status ${status}`}>{STATUS_LABELS[status] || status}</span>;
}
function PriorityBadge({ priority }) {
  return <span className={`badge-priority ${priority}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityDot(priority), flexShrink: 0 }} />
    {PRIORITY_LABELS[priority]}
  </span>;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('My Tasks');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('All Projects');
  const [filterPriority, setFilterPriority] = useState('All Priority');
  const [commentDraft, setCommentDraft] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await getMyTasks(user.id);
      if (data) {
        const formattedData = (data || []).map(t => ({
          ...t,
          name: t.title || t.name || 'Untitled Task',
          project: t.project_name || t.project || 'General Project',
          dueDate: t.due_date || t.dueDate || new Date().toISOString().split('T')[0],
          status: (t.status || 'not-started').toLowerCase(),
          priority: (t.priority || 'medium').toLowerCase(),
          checklist: Array.isArray(t.checklist) ? t.checklist : [],
          comments: Array.isArray(t.comments) ? t.comments : [],
          attachments: Array.isArray(t.attachments) ? t.attachments : [],
          activity: Array.isArray(t.activity) ? t.activity : []
        }));
        setTasks(formattedData);
        setSelectedTask(formattedData[0] || null);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Modal form state
  const [newTask, setNewTask] = useState({
    name: '', project: '', department: '', assignedBy: '', priority: 'medium',
    status: 'not-started', dueDate: '', estimatedHours: '', description: '',
    checklistInput: [''],
  });

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (activeTab === 'Today') list = list.filter(t => t.dueDate === today);
    else if (activeTab === 'In Progress') list = list.filter(t => t.status === 'in-progress');
    else if (activeTab === 'Completed') list = list.filter(t => t.status === 'completed' || t.status === 'approved');
    else if (activeTab === 'Overdue') list = list.filter(t => t.dueDate < today && t.status !== 'completed' && t.status !== 'approved');
    else if (activeTab === 'Archived') list = list.filter(t => t.status === 'cancelled');

    if (filterProject !== 'All Projects') list = list.filter(t => t.project === filterProject);
    if (filterPriority !== 'All Priority') list = list.filter(t => t.priority === filterPriority.toLowerCase());
    if (searchTerm) list = list.filter(t => (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return list;
  }, [tasks, activeTab, filterProject, filterPriority, searchTerm]);

  const PER_PAGE = 6;
  const totalPages = Math.ceil(filteredTasks.length / PER_PAGE);
  const pagedTasks = filteredTasks.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const [companyProjects, setCompanyProjects] = useState([]);

  useEffect(() => {
    getCompanyProjects().then(({ data }) => {
      if (data && Array.isArray(data)) setCompanyProjects(data);
    });
  }, []);

  const projects = ['All Projects', ...Array.from(new Set([...companyProjects, ...tasks.map(t => t.project || 'General Project')]))];

  // Update a task field
  function updateTaskField(id, field, value) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, [field]: value }));

    if (field === 'status') {
      updateTaskStatus(id, value).catch(err => console.warn('Employee task status update notice:', err));
    }
  }

  // Toggle checklist item
  function toggleChecklist(taskId, itemId) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const currentList = Array.isArray(t.checklist) ? t.checklist : [];
      const updated = { ...t, checklist: currentList.map(c => c.id === itemId ? { ...c, done: !c.done } : c) };
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      return updated;
    }));
  }

  // Add comment
  function addComment() {
    if (!commentDraft.trim() || !selectedTask) return;
    const newComm = {
      id: Date.now(),
      author: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : 'You',
      avatarColor: 'indigo',
      text: commentDraft.trim(),
      time: 'Just now',
    };
    const currentComments = Array.isArray(selectedTask.comments) ? selectedTask.comments : [];
    const updated = {
      ...selectedTask,
      comments: [...currentComments, newComm],
      commentsCount: currentComments.length + 1,
    };
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
    setSelectedTask(updated);
    setCommentDraft('');
  }

  // Remove attachment
  function removeAttachment(taskId, attachId) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updated = { ...t, attachments: t.attachments.filter(a => a.id !== attachId), attachmentsCount: t.attachmentsCount - 1 };
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      return updated;
    }));
  }

  // Create task
  function handleCreateTask(e) {
    e.preventDefault();
    if (!newTask.name) return;
    const task = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      name: newTask.name,
      project: newTask.project || 'General',
      department: newTask.department || 'General',
      assignedBy: newTask.assignedBy || 'Manager',
      priority: newTask.priority, status: newTask.status, dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours, progress: 0,
      description: newTask.description, requirements: '', acceptanceCriteria: '',
      checklist: (newTask.checklistInput || []).filter(Boolean).map((text, i) => ({ id: i + 1, text, done: false })),
      comments: [], attachments: [], activity: [{ id: 1, actor: 'BK', actorColor: 'blue', action: 'Task created', time: 'Just now' }],
      attachmentsCount: 0, commentsCount: 0, startTime: '', endTime: '', breakTime: '',
    };
    setTasks(prev => [task, ...prev]);
    setShowModal(false);
    setNewTask({ name: '', project: '', department: '', assignedBy: '', priority: 'medium', status: 'not-started', dueDate: '', estimatedHours: '', description: '', checklistInput: [''] });
  }

  const checklistDone = (selectedTask && Array.isArray(selectedTask.checklist)) ? selectedTask.checklist.filter(c => c.done).length : 0;
  const checklistTotal = (selectedTask && Array.isArray(selectedTask.checklist)) ? selectedTask.checklist.length : 0;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  function calcTotal(start, end, brk) {
    try {
      if (!start || !end) return '—';
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const [bh, bm] = (brk || '00:00').split(':').map(Number);
      let mins = (eh * 60 + em) - (sh * 60 + sm) - (bh * 60 + bm);
      if (mins < 0) return '—';
      return `${String(Math.floor(mins / 60)).padStart(2, '0')}h ${String(mins % 60).padStart(2, '0')}m`;
    } catch { return '—'; }
  }

  return (
    <DashboardLayout>

      {/* Tasks Body */}
      <div className="tasks-body">

        {/* ── LEFT PANEL ── */}
        <div className="tasks-left-panel">
          <div className="tasks-panel-header">
            <div className="tasks-panel-title-row">
              <div>
                <div className="tasks-panel-title">Tasks</div>
                <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 2 }}>View and update your assigned work.</div>
              </div>
              <button className="btn-new-task" onClick={() => setShowModal(true)}>
                <Plus size={16} /> New Task
              </button>
            </div>

            {/* Tabs */}
            <div className="tasks-tabs">
              {TABS.map(tab => (
                <button key={tab} className={`tasks-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab); setPage(1); }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="tasks-filters">
            <select className="task-filter-select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              {projects.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="task-filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              {['All Priority', 'Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="task-search-wrap">
              <Search size={13} color="#9ca3af" />
              <input placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button className="task-filter-icon-btn" title="Sort"><ArrowUpDown size={14} /></button>
            <button className="task-filter-icon-btn" title="Filter"><SlidersHorizontal size={14} /></button>
          </div>

          {/* Task List */}
          <div className="tasks-list-scroll">
            {pagedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-gray)' }}>
                <ListTodo size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>No tasks found</p>
              </div>
            ) : pagedTasks.map(task => (
              <div
                key={task.id}
                className={`task-card ${selectedTask?.id === task.id ? 'active' : ''}`}
                onClick={() => { setSelectedTask(task); setMobileDetailOpen(true); }}
              >
                <div className="task-card-top">
                  <div className="task-card-name">{task.name}</div>
                  <div className="task-card-actions">
                    <PriorityBadge priority={task.priority} />
                    <button className="icon-btn-sm" onClick={e => e.stopPropagation()}><MoreHorizontal size={15} /></button>
                  </div>
                </div>

                <div className="task-card-meta">
                  <span className="task-card-meta-item"><Layers size={12} /> {task.project}</span>
                  <span className="task-card-meta-item"><CalendarDays size={12} />
                    <span style={{ color: task.dueDate < today && task.status !== 'completed' ? '#ef4444' : 'inherit' }}>
                      Due {task.dueDate}
                    </span>
                  </span>
                  <StatusBadge status={task.status} />
                </div>

                <div className="task-card-footer">
                  <div className="task-progress-wrap">
                    <div className="task-progress-bar">
                      <div
                        className={`task-progress-fill ${task.progress === 100 ? 'done' : task.dueDate < today ? 'warn' : ''}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="task-card-counts">
                    <span className="task-card-count-item" style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, minWidth: 30 }}>
                      {task.progress}%
                    </span>
                    <span className="task-card-count-item"><Paperclip size={11} /> {task.attachmentsCount}</span>
                    <span className="task-card-count-item"><MessageSquare size={11} /> {task.commentsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="tasks-pagination">
            <span>Showing {Math.min((page - 1) * PER_PAGE + 1, filteredTasks.length)}–{Math.min(page * PER_PAGE, filteredTasks.length)} of {filteredTasks.length} tasks</span>
            <div className="pagination-btns">
              <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`pg-btn ${page === i + 1 ? 'active-pg' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Task Detail) ── */}
        <div className={`tasks-right-panel ${mobileDetailOpen ? 'mobile-open' : ''}`}>
          {!selectedTask ? (
            <div className="task-detail-empty">
              <ListTodo size={48} style={{ opacity: 0.3 }} />
              <h3>Select a task</h3>
              <p>Click any task on the left to view its details.</p>
            </div>
          ) : (
            <div className="task-detail-scroll">
              {/* Detail Header */}
              <div className="task-detail-header-card">
                <div className="task-detail-title-row">
                  <div className="task-detail-title">{selectedTask.name}</div>
                  <button className="task-detail-close-btn" onClick={() => { setSelectedTask(null); setMobileDetailOpen(false); }}>
                    <X size={20} />
                  </button>
                </div>
                <div className="task-detail-badges">
                  <StatusBadge status={selectedTask.status} />
                  <PriorityBadge priority={selectedTask.priority} />
                  {selectedTask.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: selectedTask.dueDate < today ? '#ef4444' : 'var(--text-gray)' }}>
                      <CalendarDays size={13} /> Due {selectedTask.dueDate}
                    </span>
                  )}
                </div>
                <div className="task-detail-meta-grid">
                  <div className="task-meta-item">
                    <label>Project</label>
                    <div className="meta-value"><Layers size={14} color="#6b7280" />{selectedTask.project}</div>
                  </div>
                  <div className="task-meta-item">
                    <label>Assigned By</label>
                    <div className="meta-value">
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {String(selectedTask.assignedBy || selectedTask.assigned_by || selectedTask.assignedTo || 'Admin').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                      {selectedTask.assignedBy || selectedTask.assigned_by || selectedTask.assignedTo || 'Admin'}
                    </div>
                  </div>
                  <div className="task-meta-item">
                    <label>Estimated Hours</label>
                    <div className="meta-value"><Timer size={14} color="#6b7280" />{selectedTask.estimatedHours}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="task-section-card">
                <div className="task-section-title"><FileText size={16} color="#6b7280" /> Description</div>
                <p className="task-description-text">{selectedTask.description}</p>
                {selectedTask.requirements && (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', margin: '14px 0 6px' }}>Requirements</p>
                    <p className="task-description-text" style={{ whiteSpace: 'pre-line' }}>{selectedTask.requirements}</p>
                  </>
                )}
                {selectedTask.acceptanceCriteria && (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', margin: '14px 0 6px' }}>Acceptance Criteria</p>
                    <p className="task-description-text">{selectedTask.acceptanceCriteria}</p>
                  </>
                )}
              </div>

              {/* Checklist */}
              {selectedTask.checklist?.length > 0 && (
                <div className="task-section-card">
                  <div className="task-section-title">
                    <CheckCircle2 size={16} color="#6b7280" /> Checklist
                    <span className="section-count">{checklistDone}/{checklistTotal}</span>
                  </div>
                  <div className="checklist-progress-bar">
                    <div className="checklist-progress-fill" style={{ width: `${checklistPct}%` }} />
                  </div>
                  <div className="checklist-list">
                    {selectedTask.checklist.map(item => (
                      <label key={item.id} className="checklist-item">
                        <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(selectedTask.id, item.id)} />
                        <span className={`checklist-item-label ${item.done ? 'done' : ''}`}>{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress & Status Update */}
              <div className="task-section-card">
                <div className="task-section-title"><Circle size={16} color="#6b7280" /> Progress Update</div>
                <div className="progress-slider-section">
                  <div className="progress-slider-row">
                    <input
                      type="range" min={0} max={100} step={10}
                      className="progress-slider"
                      value={selectedTask.progress}
                      onChange={e => updateTaskField(selectedTask.id, 'progress', Number(e.target.value))}
                    />
                    <span className="progress-pct-label">{selectedTask.progress}%</span>
                  </div>
                  <div className="progress-status-row">
                    <label>Status</label>
                    <select
                      className="status-select-dropdown"
                      value={selectedTask.status}
                      onChange={e => updateTaskField(selectedTask.id, 'status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="task-section-card">
                <div className="task-section-title">
                  <MessageSquare size={16} color="#6b7280" /> Comments
                  <span className="section-count">{selectedTask.comments?.length || 0}</span>
                </div>
                {selectedTask.comments?.length > 0 && (
                  <div className="comments-list">
                    {selectedTask.comments.map(c => (
                      <div key={c.id} className="comment-bubble">
                        <div className={`comment-avatar ${c.avatarColor}`}>{c.avatar}</div>
                        <div className="comment-body">
                          <div className="comment-meta">
                            <span className="comment-author">{c.author}</span>
                            <span className={`comment-role-badge ${c.role === 'Manager' ? 'manager' : 'employee'}`}>{c.role}</span>
                            <span className="comment-time">{c.time}</span>
                          </div>
                          <div className="comment-text-box">{c.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="comment-input-row">
                  <div className={`comment-avatar green`}>RS</div>
                  <div className="comment-input-wrap">
                    <textarea
                      placeholder="Write a comment, update, or question..."
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) addComment(); }}
                    />
                  </div>
                  <button className="btn-send-comment" onClick={addComment}><Send size={16} /></button>
                </div>
              </div>

              {/* Attachments */}
              <div className="task-section-card">
                <div className="task-section-title">
                  <Paperclip size={16} color="#6b7280" /> Attachments
                  <span className="section-count">{selectedTask.attachments?.length || 0}</span>
                </div>
                {selectedTask.attachments?.length > 0 && (
                  <div className="attachments-grid">
                    {selectedTask.attachments.map(file => (
                      <div key={file.id} className="attachment-row">
                        <div className={`attachment-icon-box ${file.type}`}>
                          {file.type === 'img' ? <Image size={16} /> : file.type === 'pdf' ? <AlertCircle size={16} /> : <FileIcon size={16} />}
                        </div>
                        <div className="attachment-info">
                          <div className="attachment-name">{file.name}</div>
                          <div className="attachment-size">{file.size}</div>
                        </div>
                        <div className="attachment-actions">
                          <button className="attach-action-btn" title="Download"><Download size={13} /></button>
                          <button className="attach-action-btn red" title="Delete" onClick={() => removeAttachment(selectedTask.id, file.id)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="upload-drop-zone">
                  <Paperclip size={24} color="#9ca3af" />
                  <p>Drag & drop files here or <span>click to upload</span></p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Max file size: 10MB — PNG, JPG, PDF, DOCX, ZIP, XLS, PPT, Video, Audio</p>
                </div>
              </div>

              {/* Time Tracking */}
              <div className="task-section-card">
                <div className="task-section-title"><Clock size={16} color="#6b7280" /> Time Tracking</div>
                <div className="time-track-grid">
                  {[['Start Time', 'startTime'], ['End Time', 'endTime'], ['Break Time', 'breakTime']].map(([label, field]) => (
                    <div className="time-track-input-group" key={field}>
                      <label>{label}</label>
                      <input
                        type="time"
                        value={selectedTask[field] || ''}
                        onChange={e => updateTaskField(selectedTask.id, field, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="time-track-input-group time-track-total">
                    <label>Total Hours</label>
                    <input
                      type="text"
                      readOnly
                      value={calcTotal(selectedTask.startTime, selectedTask.endTime, selectedTask.breakTime)}
                    />
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              {selectedTask.activity?.length > 0 && (
                <div className="task-section-card">
                  <div className="task-section-title"><CheckCircle2 size={16} color="#6b7280" /> Activity</div>
                  <div className="activity-timeline">
                    {selectedTask.activity.map(item => (
                      <div key={item.id} className="activity-item">
                        <div className={`activity-avatar`} style={{ background: item.actorColor === 'blue' ? '#3b82f6' : item.actorColor === 'green' ? '#22c55e' : '#f59e0b' }}>
                          {item.actor}
                        </div>
                        <div className="activity-body">
                          <div className="activity-text">{item.action}</div>
                          {item.sub && <div className="activity-text" style={{ color: 'var(--text-gray)', marginTop: 2 }}>{item.sub}</div>}
                          <div className="activity-time">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ── CREATE TASK ENTERPRISE MODAL ── */}
      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FormHeader
          icon={CheckSquare}
          title="Create New Task"
          description="Assign and track a new task for your team."
        />

        <form onSubmit={handleCreateTask}>
          <FormBody>
            <FormSection title="Task Details" description="Basic information about the task.">
              <FormField label="Task Name" required fullWidth>
                <TextInput
                  placeholder="Enter task name"
                  value={newTask.name}
                  onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Project">
                <SelectInput
                  options={['HRMS Portal', 'Payroll Module', 'HR Operations', 'DevOps', 'Security']}
                  value={newTask.project}
                  onChange={e => setNewTask(p => ({ ...p, project: e.target.value }))}
                />
              </FormField>

              <FormField label="Department">
                <SelectInput
                  options={['Engineering', 'Design', 'HR', 'IT', 'Finance']}
                  value={newTask.department}
                  onChange={e => setNewTask(p => ({ ...p, department: e.target.value }))}
                />
              </FormField>
            </FormSection>

            <FormSection title="Assignment & Scheduling" description="Who is responsible and when is it due.">
              <FormField label="Assign Employee">
                <SelectInput
                  options={['Ravi Sharma', 'Anjali Mehta', 'Priya Nair', 'Balaji Kumar']}
                  value={newTask.assignedBy}
                  onChange={e => setNewTask(p => ({ ...p, assignedBy: e.target.value }))}
                />
              </FormField>

              <FormField label="Priority">
                <SelectInput
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' }
                  ]}
                  value={newTask.priority}
                  onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                />
              </FormField>

              <FormField label="Due Date">
                <DateInput
                  value={newTask.dueDate}
                  onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Estimated Hours">
                <TextInput
                  placeholder="e.g. 04h 00m"
                  value={newTask.estimatedHours}
                  onChange={e => setNewTask(p => ({ ...p, estimatedHours: e.target.value }))}
                />
              </FormField>
            </FormSection>

            <FormSection title="Task Requirements" description="Provide detailed instructions and checklists.">
              <FormField label="Description" fullWidth>
                <TextArea
                  placeholder="Describe the task requirements..."
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                />
              </FormField>

              <FormField label="Checklist Items" fullWidth>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {newTask.checklistInput.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10 }}>
                      <input
                        className="ent-input"
                        placeholder={`Checklist item ${idx + 1}`}
                        value={item}
                        onChange={e => {
                          const updated = [...newTask.checklistInput];
                          updated[idx] = e.target.value;
                          setNewTask(p => ({ ...p, checklistInput: updated }));
                        }}
                      />
                      {newTask.checklistInput.length > 1 && (
                        <button
                          type="button"
                          style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '0 12px', borderRadius: 8, cursor: 'pointer' }}
                          onClick={() => setNewTask(p => ({ ...p, checklistInput: p.checklistInput.filter((_, i) => i !== idx) }))}
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px dashed #bfdbfe', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, marginTop: 5 }}
                    onClick={() => setNewTask(p => ({ ...p, checklistInput: [...p.checklistInput, ''] }))}
                  >
                    + Add Checklist Item
                  </button>
                </div>
              </FormField>

              <FormField label="Attachments" fullWidth>
                <FileUpload hint="Upload requirements, mockups, or specs (Max 10MB)" />
              </FormField>
            </FormSection>
          </FormBody>

          <FormFooter
            onCancel={() => setShowModal(false)}
            submitText="Create Task"
            saveDraft={true}
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}
