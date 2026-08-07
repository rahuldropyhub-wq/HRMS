import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/tasks/task-dashboard.css';
import { getAllTasks } from '../../../services/adminService';

// Mock Data
const MOCK_TASKS = [];

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
