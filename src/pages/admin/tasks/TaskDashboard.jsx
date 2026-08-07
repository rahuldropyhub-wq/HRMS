import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/tasks/task-dashboard.css';
import { getAllTasks } from '../../../services/adminService';

// Mock Data
const MOCK_TASKS = [
  { id: 'TSK-001', title: 'Homepage Redesign', project: 'Website Redesign', status: 'To Do', priority: 'High', assignee: 'Rahul Sharma', avatar: 'RS', due: '10 Aug 2026', comments: 3 },
  { id: 'TSK-002', title: 'API Integration', project: 'Mobile App', status: 'In Progress', priority: 'Medium', assignee: 'Amit Kumar', avatar: 'AK', due: '12 Aug 2026', comments: 1 },
  { id: 'TSK-003', title: 'Dashboard Charts', project: 'CRM System', status: 'Review', priority: 'Low', assignee: 'Priya Patel', avatar: 'PP', due: '08 Aug 2026', comments: 5 },
  { id: 'TSK-004', title: 'Login Page UI', project: 'Website Redesign', status: 'Done', priority: 'Low', assignee: 'Neha Gupta', avatar: 'NG', due: '05 Aug 2026', comments: 2 },
  { id: 'TSK-005', title: 'Mobile App Testing', project: 'Mobile App', status: 'To Do', priority: 'High', assignee: 'Vikram Singh', avatar: 'VS', due: '15 Aug 2026', comments: 0 },
  { id: 'TSK-006', title: 'Email Campaign setup', project: 'Marketing Campaign', status: 'In Progress', priority: 'Medium', assignee: 'Anjali Desai', avatar: 'AD', due: '11 Aug 2026', comments: 4 },
  { id: 'TSK-007', title: 'Database Migration', project: 'CRM System', status: 'Review', priority: 'High', assignee: 'Rohan Verma', avatar: 'RV', due: '09 Aug 2026', comments: 8 },
  { id: 'TSK-008', title: 'Push Notifications', project: 'Mobile App', status: 'To Do', priority: 'Medium', assignee: 'Pooja Iyer', avatar: 'PI', due: '14 Aug 2026', comments: 1 },
  { id: 'TSK-009', title: 'User Feedback Form', project: 'Website Redesign', status: 'Done', priority: 'Low', assignee: 'Rahul Sharma', avatar: 'RS', due: '04 Aug 2026', comments: 0 },
  { id: 'TSK-010', title: 'Ad Copywriting', project: 'Marketing Campaign', status: 'To Do', priority: 'Medium', assignee: 'Neha Gupta', avatar: 'NG', due: '16 Aug 2026', comments: 2 },
  { id: 'TSK-011', title: 'Payment Gateway', project: 'Website Redesign', status: 'In Progress', priority: 'High', assignee: 'Amit Kumar', avatar: 'AK', due: '18 Aug 2026', comments: 6 },
  { id: 'TSK-012', title: 'Analytics Dashboard', project: 'CRM System', status: 'Done', priority: 'Medium', assignee: 'Priya Patel', avatar: 'PP', due: '01 Aug 2026', comments: 3 },
  { id: 'TSK-013', title: 'Social Media Assets', project: 'Marketing Campaign', status: 'Review', priority: 'Low', assignee: 'Anjali Desai', avatar: 'AD', due: '07 Aug 2026', comments: 1 },
  { id: 'TSK-014', title: 'Security Audit', project: 'CRM System', status: 'To Do', priority: 'High', assignee: 'Vikram Singh', avatar: 'VS', due: '20 Aug 2026', comments: 0 },
  { id: 'TSK-015', title: 'App Store Submission', project: 'Mobile App', status: 'Done', priority: 'High', assignee: 'Rohan Verma', avatar: 'RV', due: '30 Jul 2026', comments: 12 },
  { id: 'TSK-016', title: 'SEO Optimization', project: 'Website Redesign', status: 'To Do', priority: 'Medium', assignee: 'Pooja Iyer', avatar: 'PI', due: '22 Aug 2026', comments: 2 },
  { id: 'TSK-017', title: 'Client Onboarding Flow', project: 'CRM System', status: 'In Progress', priority: 'Medium', assignee: 'Rahul Sharma', avatar: 'RS', due: '19 Aug 2026', comments: 4 },
  { id: 'TSK-018', title: 'Video Teaser', project: 'Marketing Campaign', status: 'Done', priority: 'Low', assignee: 'Neha Gupta', avatar: 'NG', due: '02 Aug 2026', comments: 5 },
  { id: 'TSK-019', title: 'Bug Fixes V1.2', project: 'Mobile App', status: 'Done', priority: 'High', assignee: 'Amit Kumar', avatar: 'AK', due: '28 Jul 2026', comments: 8 },
  { id: 'TSK-020', title: 'User Roles Setup', project: 'CRM System', status: 'Done', priority: 'High', assignee: 'Priya Patel', avatar: 'PP', due: '25 Jul 2026', comments: 3 },
  { id: 'TSK-021', title: 'Newsletter Template', project: 'Marketing Campaign', status: 'Done', priority: 'Low', assignee: 'Anjali Desai', avatar: 'AD', due: '29 Jul 2026', comments: 1 },
];

const TaskCard = ({ task }) => (
  <motion.div 
    className="task-card"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2 }}
  >
    <div className="task-badges">
      <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
      <span className="project-badge">{task.project}</span>
    </div>
    <h3 className="task-title">{task.title}</h3>
    <div className="task-footer">
      <div className="assignee-info">
        <div className="assignee-avatar">{task.avatar}</div>
        <span className="assignee-name">{task.assignee.split(' ')[0]}</span>
      </div>
      <div className="task-meta">
        <div className="meta-item"><Calendar size={12} /> {task.status === 'Done' ? 'Done' : task.due.substring(0, 6)}</div>
        <div className="meta-item"><MessageSquare size={12} /> {task.comments}</div>
      </div>
    </div>
  </motion.div>
);

const TaskDashboard = () => {
  const [view, setView] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getAllTasks();
      setTasks(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const columns = [
    { id: 'todo', label: 'To Do', class: 'col-todo' },
    { id: 'in-progress', label: 'In Progress', class: 'col-in-progress' },
    { id: 'review', label: 'Review', class: 'col-review' },
    { id: 'completed', label: 'Done', class: 'col-done' },
  ];

  return (
    <motion.div 
      className="task-dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Task Dashboard</h1>
          <p>Manage and track all company-wide tasks</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/tasks/create" className="btn-primary">
            <Plus size={18} /> Create Task
          </Link>
        </div>
      </div>

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${view === 'board' ? 'active' : ''}`}
          onClick={() => setView('board')}
        >
          <LayoutGrid size={16} /> Board
        </button>
        <button 
          className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          <List size={16} /> List
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'board' ? (
          <motion.div 
            key="board"
            className="kanban-board"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {columns.map(col => {
              const colTasks = MOCK_TASKS.filter(t => t.status === col.id);
              return (
                <div key={col.id} className={`kanban-column ${col.class}`}>
                  <div className="column-header">
                    <span className="column-title">{col.label}</span>
                    <span className="task-count">{colTasks.length}</span>
                  </div>
                  <div className="column-body">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            className="table-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TASKS.map(task => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</td>
                    <td>{task.project}</td>
                    <td>
                      <div className="assignee-info">
                        <div className="assignee-avatar">{task.avatar}</div>
                        <span className="assignee-name">{task.assignee}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </td>
                    <td>{task.due}</td>
                    <td>
                      <span className={`status-badge ${task.status.toLowerCase().replace(' ', '')}`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskDashboard;
