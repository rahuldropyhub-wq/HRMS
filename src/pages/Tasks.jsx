import React, { useState, useMemo } from 'react';
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
} from '../components/EnterpriseForm';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/dashboard.css';
import '../styles/tasks.css';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const INITIAL_TASKS = [
  {
    id: 1, name: 'Design HRMS Dashboard UI', project: 'HRMS Portal',
    assignedBy: 'Balaji Kumar', department: 'Engineering',
    priority: 'high', status: 'in-progress', dueDate: '2025-05-08',
    estimatedHours: '06h 00m', progress: 70, attachmentsCount: 2, commentsCount: 3,
    description: 'Design and develop a responsive and modern dashboard UI for the HRMS portal using React and Tailwind CSS. The design should follow enterprise SaaS standards.',
    requirements: '- Desktop and mobile responsive\n- Clean white cards\n- Blue primary color\n- Professional typography',
    acceptanceCriteria: 'UI matches approved Figma designs, all breakpoints tested, components are reusable.',
    checklist: [
      { id: 1, text: 'Create layout structure', done: true },
      { id: 2, text: 'Build summary cards', done: true },
      { id: 3, text: 'Add charts and graphs', done: true },
      { id: 4, text: 'Responsive for mobile', done: false },
      { id: 5, text: 'Dark mode support', done: false },
    ],
    comments: [
      { id: 1, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: 'Today, 10:30 AM', text: 'Great progress! Please ensure the mobile layout is tested on iPhone 14 and Samsung Galaxy S23.' },
      { id: 2, author: 'Ravi Sharma', role: 'Employee', avatar: 'RS', avatarColor: 'green', time: 'Today, 11:00 AM', text: 'Dashboard UI completed for desktop view. Working on mobile responsive now.' },
      { id: 3, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: 'Today, 11:45 AM', text: 'Perfect. Also check the accessibility standards — WCAG 2.1 AA compliance required.' },
    ],
    attachments: [
      { id: 1, name: 'dashboard-design.png', size: '1.2 MB', type: 'img' },
      { id: 2, name: 'dashboard-flow.pdf', size: '890 KB', type: 'pdf' },
    ],
    activity: [
      { id: 1, actor: 'BK', actorColor: 'blue', action: 'You updated progress to 70%.', sub: 'Working on mobile responsive.', time: 'Today, 10:30 AM' },
      { id: 2, actor: 'RS', actorColor: 'green', action: 'You uploaded dashboard-design.png', time: 'Today, 10:09 AM' },
      { id: 3, actor: 'BK', actorColor: 'blue', action: 'Task created by Balaji Kumar', time: 'Yesterday, 04:11 PM' },
    ],
    startTime: '09:00', endTime: '17:00', breakTime: '00:30',
  },
  {
    id: 2, name: 'Fix Attendance Page Issues', project: 'HRMS Portal',
    assignedBy: 'Balaji Kumar', department: 'Engineering',
    priority: 'medium', status: 'in-progress', dueDate: '2025-05-09',
    estimatedHours: '03h 00m', progress: 40, attachmentsCount: 1, commentsCount: 2,
    description: 'Fix the pagination and filter issues on the Attendance page. Ensure dates and hours are correctly formatted.',
    requirements: 'Pagination must work, date filters should be accurate.',
    acceptanceCriteria: 'All edge cases tested, no console errors.',
    checklist: [
      { id: 1, text: 'Identify broken pagination', done: true },
      { id: 2, text: 'Fix date filter logic', done: false },
      { id: 3, text: 'Test all scenarios', done: false },
    ],
    comments: [
      { id: 1, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: 'Yesterday, 03:00 PM', text: 'Please fix the date range filter first, that is blocking QA.' },
      { id: 2, author: 'Anjali Mehta', role: 'Employee', avatar: 'AM', avatarColor: 'orange', time: 'Yesterday, 04:30 PM', text: 'On it. Will push a fix by tomorrow morning.' },
    ],
    attachments: [{ id: 1, name: 'attendance-flow.pdf', size: '890 KB', type: 'pdf' }],
    activity: [
      { id: 1, actor: 'AM', actorColor: 'orange', action: 'Task status changed to In Progress', time: 'Yesterday, 03:15 PM' },
      { id: 2, actor: 'BK', actorColor: 'blue', action: 'Task assigned to Anjali Mehta', time: 'Yesterday, 02:00 PM' },
    ],
    startTime: '10:00', endTime: '13:00', breakTime: '00:00',
  },
  {
    id: 3, name: 'Create Leave Management API', project: 'HRMS Portal',
    assignedBy: 'Balaji Kumar', department: 'Engineering',
    priority: 'high', status: 'not-started', dueDate: '2025-05-18',
    estimatedHours: '08h 00m', progress: 0, attachmentsCount: 0, commentsCount: 0,
    description: 'Build RESTful APIs for leave management including apply, approve, reject, and history endpoints.',
    requirements: 'JWT authentication, role-based access, proper error handling.',
    acceptanceCriteria: 'All endpoints return correct HTTP status codes, unit tests written.',
    checklist: [
      { id: 1, text: 'Design API schema', done: false },
      { id: 2, text: 'Write leave apply endpoint', done: false },
      { id: 3, text: 'Write approve/reject endpoints', done: false },
      { id: 4, text: 'Write unit tests', done: false },
    ],
    comments: [], attachments: [],
    activity: [{ id: 1, actor: 'BK', actorColor: 'blue', action: 'Task created and assigned', time: '2 days ago' }],
    startTime: '', endTime: '', breakTime: '',
  },
  {
    id: 4, name: 'Update Employee Profile UI', project: 'HRMS Portal',
    assignedBy: 'Priya Nair', department: 'Design',
    priority: 'low', status: 'not-started', dueDate: '2025-05-18',
    estimatedHours: '04h 00m', progress: 0, attachmentsCount: 0, commentsCount: 0,
    description: 'Revamp the employee profile page with a modern card layout and better information hierarchy.',
    requirements: 'Must include profile photo upload, skills section, and work history.',
    acceptanceCriteria: 'Design matches Figma mockup, responsive on all devices.',
    checklist: [
      { id: 1, text: 'Review Figma designs', done: false },
      { id: 2, text: 'Build profile card', done: false },
      { id: 3, text: 'Add skills section', done: false },
    ],
    comments: [], attachments: [],
    activity: [{ id: 1, actor: 'PN', actorColor: 'orange', action: 'Task assigned by Priya Nair', time: '3 days ago' }],
    startTime: '', endTime: '', breakTime: '',
  },
  {
    id: 5, name: 'Integrate Payment Gateway', project: 'Payroll Module',
    assignedBy: 'Balaji Kumar', department: 'Engineering',
    priority: 'medium', status: 'on-hold', dueDate: '2025-05-20',
    estimatedHours: '12h 00m', progress: 0, attachmentsCount: 0, commentsCount: 1,
    description: 'Integrate Razorpay payment gateway for salary disbursement and advance payment modules.',
    requirements: 'Test mode first, production after QA sign-off.',
    acceptanceCriteria: 'Payment flows work end-to-end, webhook is configured.',
    checklist: [
      { id: 1, text: 'Setup Razorpay account', done: false },
      { id: 2, text: 'Build payment initiation flow', done: false },
      { id: 3, text: 'Build webhook handler', done: false },
      { id: 4, text: 'Test all payment scenarios', done: false },
    ],
    comments: [{ id: 1, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: '1 day ago', text: 'Putting this on hold until we get the API keys from finance team.' }],
    attachments: [],
    activity: [
      { id: 1, actor: 'BK', actorColor: 'blue', action: 'Task status changed to On Hold', time: '1 day ago' },
      { id: 2, actor: 'BK', actorColor: 'blue', action: 'Task created', time: '3 days ago' },
    ],
    startTime: '', endTime: '', breakTime: '',
  },
  {
    id: 6, name: 'Write Onboarding Documentation', project: 'HR Operations',
    assignedBy: 'Priya Nair', department: 'HR',
    priority: 'low', status: 'completed', dueDate: '2025-05-05',
    estimatedHours: '05h 00m', progress: 100, attachmentsCount: 2, commentsCount: 4,
    description: 'Create comprehensive onboarding documentation for new employees including IT setup, HR policies, and team introduction.',
    requirements: 'Cover all departments, include screenshots, PDF format.',
    acceptanceCriteria: 'Document reviewed and approved by HR head.',
    checklist: [
      { id: 1, text: 'Draft IT setup guide', done: true },
      { id: 2, text: 'Write HR policy summary', done: true },
      { id: 3, text: 'Create welcome checklist', done: true },
      { id: 4, text: 'Review with HR head', done: true },
    ],
    comments: [
      { id: 1, author: 'Priya Nair', role: 'Manager', avatar: 'PN', avatarColor: 'orange', time: '3 days ago', text: 'Excellent work! The documentation is very thorough.' },
      { id: 2, author: 'Ravi Sharma', role: 'Employee', avatar: 'RS', avatarColor: 'green', time: '3 days ago', text: 'Thank you! Happy to help.' },
    ],
    attachments: [
      { id: 1, name: 'onboarding-guide-v2.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 2, name: 'welcome-checklist.docx', size: '340 KB', type: 'doc' },
    ],
    activity: [
      { id: 1, actor: 'RS', actorColor: 'green', action: 'Task marked as Completed', time: '3 days ago' },
      { id: 2, actor: 'RS', actorColor: 'green', action: 'Progress updated to 100%', time: '3 days ago' },
      { id: 3, actor: 'PN', actorColor: 'orange', action: 'Task approved by Priya Nair', time: '2 days ago' },
    ],
    startTime: '09:00', endTime: '14:00', breakTime: '00:00',
  },
  {
    id: 7, name: 'Audit System Permissions', project: 'Security',
    assignedBy: 'Balaji Kumar', department: 'IT',
    priority: 'critical', status: 'waiting-review', dueDate: '2025-05-10',
    estimatedHours: '06h 00m', progress: 90, attachmentsCount: 1, commentsCount: 2,
    description: 'Conduct a full audit of user permissions across all HRMS modules. Identify and revoke unnecessary access.',
    requirements: 'Export a permission matrix. Flag anomalies.',
    acceptanceCriteria: 'Permission matrix reviewed and signed off by CTO.',
    checklist: [
      { id: 1, text: 'Export user roles list', done: true },
      { id: 2, text: 'Identify excessive permissions', done: true },
      { id: 3, text: 'Create permission matrix', done: true },
      { id: 4, text: 'Get CTO sign-off', done: false },
    ],
    comments: [
      { id: 1, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: 'Today, 09:00 AM', text: 'This is under review. Please send the matrix document to my email.' },
      { id: 2, author: 'Ravi Sharma', role: 'Employee', avatar: 'RS', avatarColor: 'green', time: 'Today, 09:30 AM', text: 'Sent! Waiting for CTO review.' },
    ],
    attachments: [{ id: 1, name: 'permissions-matrix.xlsx', size: '560 KB', type: 'doc' }],
    activity: [
      { id: 1, actor: 'RS', actorColor: 'green', action: 'Status changed to Waiting Review', time: 'Today, 09:30 AM' },
      { id: 2, actor: 'RS', actorColor: 'green', action: 'Permission matrix uploaded', time: 'Today, 09:15 AM' },
    ],
    startTime: '09:00', endTime: '15:00', breakTime: '00:30',
  },
  {
    id: 8, name: 'Setup CI/CD Pipeline', project: 'DevOps',
    assignedBy: 'Balaji Kumar', department: 'Engineering',
    priority: 'high', status: 'blocked', dueDate: '2025-05-07',
    estimatedHours: '10h 00m', progress: 30, attachmentsCount: 0, commentsCount: 1,
    description: 'Setup GitHub Actions CI/CD pipeline for automated testing and deployment to staging environment.',
    requirements: 'Auto deploy on merge to main, run tests on every PR.',
    acceptanceCriteria: 'Pipeline runs successfully on all branches.',
    checklist: [
      { id: 1, text: 'Write GitHub Actions workflow', done: true },
      { id: 2, text: 'Setup staging server', done: false },
      { id: 3, text: 'Configure environment variables', done: false },
      { id: 4, text: 'Test full pipeline', done: false },
    ],
    comments: [{ id: 1, author: 'Balaji Kumar', role: 'Manager', avatar: 'BK', avatarColor: 'blue', time: '2 days ago', text: 'Blocked waiting for DevOps team to provision the staging server. Please follow up with them.' }],
    attachments: [],
    activity: [
      { id: 1, actor: 'BK', actorColor: 'blue', action: 'Task marked as Blocked', time: '2 days ago' },
      { id: 2, actor: 'BK', actorColor: 'blue', action: 'Task created', time: '4 days ago' },
    ],
    startTime: '', endTime: '', breakTime: '',
  },
];

const STATUS_OPTIONS = ['not-started', 'in-progress', 'waiting-review', 'blocked', 'completed'];
const STATUS_LABELS = {
  'not-started': 'Not Started', 'assigned': 'Assigned', 'in-progress': 'In Progress',
  'waiting-review': 'Waiting Review', 'completed': 'Completed', 'approved': 'Approved',
  'rejected': 'Rejected', 'blocked': 'Blocked', 'on-hold': 'On Hold', 'cancelled': 'Cancelled',
};
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const TABS = ['My Tasks', 'Today', 'In Progress', 'Completed', 'Overdue', 'Archived'];
const today = '2025-05-08';

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
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('My Tasks');
  const [selectedTask, setSelectedTask] = useState(tasks[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('All Projects');
  const [filterPriority, setFilterPriority] = useState('All Priority');
  const [commentDraft, setCommentDraft] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

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
    if (searchTerm) list = list.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return list;
  }, [tasks, activeTab, filterProject, filterPriority, searchTerm]);

  const PER_PAGE = 6;
  const totalPages = Math.ceil(filteredTasks.length / PER_PAGE);
  const pagedTasks = filteredTasks.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const projects = ['All Projects', ...Array.from(new Set(tasks.map(t => t.project)))];

  // Update a task field
  function updateTaskField(id, field, value) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, [field]: value }));
  }

  // Toggle checklist item
  function toggleChecklist(taskId, itemId) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updated = { ...t, checklist: t.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) };
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      return updated;
    }));
  }

  // Add comment
  function addComment() {
    if (!commentDraft.trim() || !selectedTask) return;
    const newComment = {
      id: Date.now(), author: 'Ravi Sharma', role: 'Employee',
      avatar: 'RS', avatarColor: 'green',
      time: 'Just now', text: commentDraft.trim(),
    };
    updateTaskField(selectedTask.id, 'comments', [...(selectedTask.comments || []), newComment]);
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
    const task = {
      id: Date.now(), name: newTask.name, project: newTask.project || 'HRMS Portal',
      assignedBy: newTask.assignedBy || 'Balaji Kumar', department: newTask.department || 'Engineering',
      priority: newTask.priority, status: newTask.status, dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours, progress: 0,
      description: newTask.description, requirements: '', acceptanceCriteria: '',
      checklist: newTask.checklistInput.filter(Boolean).map((text, i) => ({ id: i + 1, text, done: false })),
      comments: [], attachments: [], activity: [{ id: 1, actor: 'BK', actorColor: 'blue', action: 'Task created', time: 'Just now' }],
      attachmentsCount: 0, commentsCount: 0, startTime: '', endTime: '', breakTime: '',
    };
    setTasks(prev => [task, ...prev]);
    setShowModal(false);
    setNewTask({ name: '', project: '', department: '', assignedBy: '', priority: 'medium', status: 'not-started', dueDate: '', estimatedHours: '', description: '', checklistInput: [''] });
  }

  const checklistDone = selectedTask ? selectedTask.checklist.filter(c => c.done).length : 0;
  const checklistTotal = selectedTask ? selectedTask.checklist.length : 0;
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
                          {selectedTask.assignedBy.split(' ').map(n => n[0]).join('')}
                        </span>
                        {selectedTask.assignedBy}
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
                    {value: 'low', label: 'Low'},
                    {value: 'medium', label: 'Medium'},
                    {value: 'high', label: 'High'},
                    {value: 'critical', label: 'Critical'}
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
