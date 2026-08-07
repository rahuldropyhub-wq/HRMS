import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, RefreshCw, X, SearchX, Clock, Paperclip, Undo2 } from 'lucide-react';
import '../../../styles/admin/tasks/task-review.css';
import EmptyState from '../../../components/admin/EmptyState';
import ActionBtn from '../../../components/admin/ActionBtn';

const MOCK_REVIEW_TASKS = [];

const TaskReview = () => {
  const [tasks, setTasks] = useState(MOCK_REVIEW_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  const handleAction = (task, action) => {
    // In a real app, send API request
    setTasks(prev => prev.filter(t => t.id !== task.id));
    if (isDrawerOpen) closeDrawer();
  };

  return (
    <motion.div 
      className="task-review-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Task Review</h1>
          <p>Review and approve tasks marked as completed by employees</p>
        </div>
      </div>

      <div className="table-container">
        {filteredTasks.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No tasks found"
            message="No tasks match your current filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Completed On</th>
              <th>Time Taken</th>
              <th>Attachments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>
                  <div className="task-cell">
                    <div className="title">{task.title}</div>
                    <div className="project">{task.project}</div>
                  </div>
                </td>
                <td>
                  <div className="assignee-cell">
                    <div className="assignee-avatar">{task.avatar}</div>
                    <span>{task.assignee}</span>
                  </div>
                </td>
                <td>{task.completedOn}</td>
                <td>
                  <span className="time-badge"><Clock size={14} /> {task.timeTaken}</span>
                </td>
                <td>
                  {task.attachments.length > 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Paperclip size={14} /> {task.attachments.length} Files
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ActionBtn variant="success" title="Approve" onClick={() => handleAction(task, 'approve')}>
                      <CheckCircle size={14} /> Approve
                    </ActionBtn>
                    <ActionBtn variant="warning" title="Send Back" onClick={() => handleAction(task, 'reject')}>
                      <Undo2 size={14} /> Send Back
                    </ActionBtn>
                    <ActionBtn variant="ghost" iconOnly title="View Details" onClick={() => openDrawer(task)}>
                      <Eye size={15} />
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No tasks currently awaiting review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      <AnimatePresence>
        {isDrawerOpen && selectedTask && (
          <div className="drawer-overlay" onClick={closeDrawer}>
            <motion.div 
              className="drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h2>Task Review Details</h2>
                <button className="close-btn" onClick={closeDrawer}><X size={24} /></button>
              </div>
              
              <div className="drawer-body">
                <div className="drawer-section">
                  <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedTask.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                    Project: {selectedTask.project}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Completed By</div>
                      <div className="assignee-cell">
                        <div className="assignee-avatar" style={{ width: 24, height: 24, fontSize: '10px' }}>{selectedTask.avatar}</div>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedTask.assignee}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Time Taken</div>
                      <span className="time-badge"><Clock size={14} /> {selectedTask.timeTaken}</span>
                    </div>
                  </div>
                </div>

                <div className="drawer-section">
                  <h3>Original Task Description</h3>
                  <div className="info-box">
                    {selectedTask.description}
                  </div>
                </div>

                <div className="drawer-section">
                  <h3>Employee Notes / Comments</h3>
                  <div className="info-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    "{selectedTask.notes}"
                  </div>
                </div>

                {selectedTask.attachments.length > 0 && (
                  <div className="drawer-section">
                    <h3>Attachments ({selectedTask.attachments.length})</h3>
                    {selectedTask.attachments.map((att, idx) => (
                      <div key={idx} className="attachment-item">
                        <Paperclip size={16} className="attachment-icon" />
                        <div className="attachment-info">
                          <div className="attachment-name">{att.name}</div>
                          <div className="attachment-size">{att.size}</div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="drawer-footer">
                <button className="btn-reject" onClick={() => handleAction(selectedTask, 'reject')}>Send Back</button>
                <button className="btn-approve" onClick={() => handleAction(selectedTask, 'approve')}>Approve Task</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskReview;
