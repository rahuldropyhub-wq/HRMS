import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, RefreshCw, X, SearchX, Clock, Paperclip, Undo2, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/tasks/task-review.css';
import EmptyState from '../../../components/admin/EmptyState';
import ActionBtn from '../../../components/admin/ActionBtn';
import { getAllTasks, updateTask } from '../../../services/adminService';

const TaskReview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getStoredLocalTasks = () => {
    try {
      return JSON.parse(localStorage.getItem('hrms_local_tasks') || '[]');
    } catch (e) {
      return [];
    }
  };

  const saveLocalTasks = (items) => {
    try {
      localStorage.setItem('hrms_local_tasks', JSON.stringify(items));
    } catch (e) {}
  };

  const fetchReviewTasks = async () => {
    setLoading(true);
    const { data: dbTasks } = await getAllTasks();
    const localTasks = getStoredLocalTasks();

    const mergedMap = new Map();
    [...localTasks, ...(dbTasks || [])].forEach(t => {
      let st = (t.status || 'todo').toLowerCase();
      if (st === 'review' || st === 'waiting-review' || st === 'completed') {
        const assigneeStr = t.assigned_to || t.assignedTo || t.assignee || 'Balaji Sarabu (EMP-001)';
        const key = t.id || `${t.title}-${t.due_date}`;
        mergedMap.set(key, {
          id: t.id || ('TSK-' + Math.floor(1000 + Math.random() * 9000)),
          title: t.title || t.name || 'Untitled Task',
          project: t.project_name || t.project || 'General Project',
          assignee: assigneeStr,
          avatar: assigneeStr.substring(0, 2).toUpperCase(),
          status: st,
          completedOn: t.due_date || new Date().toISOString().split('T')[0],
          timeTaken: '4h 30m',
          description: t.description || 'Employee completed this task and submitted for review.',
          notes: t.notes || 'Completed deliverable as requested.',
          attachments: t.attachments || []
        });
      }
    });

    const parsed = Array.from(mergedMap.values());
    setTasks(parsed);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviewTasks();
  }, []);

  const openDrawer = (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  const handleAction = async (task, action) => {
    const newStatus = action === 'approve' ? 'completed' : 'in-progress';

    // Update local storage
    const stored = getStoredLocalTasks();
    const updatedLocal = stored.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    saveLocalTasks(updatedLocal);

    // Update state
    setTasks(prev => prev.filter(t => t.id !== task.id));

    // Update database
    updateTask(task.id, { status: newStatus }).catch(err => console.warn('Task review DB update notice:', err));

    if (isDrawerOpen) closeDrawer();
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      className="task-review-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link to="/admin/tasks" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Task Review Queue</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Review, verify, and approve tasks submitted by employees</p>
        </div>

        <div className="search-box" style={{ width: '280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search review tasks..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 8px', color: '#2563eb' }} />
          <p>Loading task review queue...</p>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState 
              icon={<SearchX size={32} />}
              title="No pending tasks for review"
              message="All employee submitted tasks have been reviewed and approved!"
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Task</th>
                  <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Assignee</th>
                  <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Completed Date</th>
                  <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div className="task-cell">
                        <div className="title" style={{ fontWeight: 600, color: '#0f172a' }}>{task.title}</div>
                        <div className="project" style={{ fontSize: '12px', color: '#64748b' }}>{task.project}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div className="assignee-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="assignee-avatar" style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{task.avatar}</div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{task.assignee}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#475569', fontSize: '14px' }}>{task.completedOn}</td>
                    <td style={{ padding: '16px' }}>
                      <span className="badge-status waiting-review" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        Waiting Review
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <ActionBtn variant="secondary" title="View Task Details" onClick={() => openDrawer(task)}>
                          <Eye size={14} /> View Details
                        </ActionBtn>
                        <button 
                          onClick={() => handleAction(task, 'approve')} 
                          style={{ border: 'none', background: '#22c55e', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(task, 'reject')} 
                          style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Undo2 size={14} /> Send Back
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* DRAWER FOR TASK REVIEW DETAILS */}
      <AnimatePresence>
        {isDrawerOpen && selectedTask && (
          <div className="drawer-overlay" onClick={closeDrawer} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div 
              className="drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '480px', background: '#fff', height: '100%', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Task Review Details</h2>
                <button onClick={closeDrawer} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', margin: '0 0 6px 0' }}>{selectedTask.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Project: {selectedTask.project}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>ASSIGNEE INFORMATION</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedTask.avatar}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{selectedTask.assignee}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Submitted for review on {selectedTask.completedOn}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Task Instructions & Description</h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>{selectedTask.description}</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button 
                  onClick={() => handleAction(selectedTask, 'reject')} 
                  style={{ flex: 1, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Send Back for Revision
                </button>
                <button 
                  onClick={() => handleAction(selectedTask, 'approve')} 
                  style={{ flex: 1, border: 'none', background: '#22c55e', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Approve Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskReview;
