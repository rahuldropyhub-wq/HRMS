import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, MessageSquare, Calendar, Edit, Trash2, CheckCircle, Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/tasks/task-dashboard.css';
import { getAllTasks, createTask, updateTask, deleteTask, getAllEmployees, getCompanyProjects, createCompanyProject } from '../../../services/adminService';
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
  FormFooter
} from '../../../components/employee/EnterpriseForm';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => (
  <motion.div
    className="task-card"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2 }}
    style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
  >
    <div className="task-badges" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span className={`priority-badge ${task.priority.toLowerCase()}`} style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>
        {task.priority}
      </span>
      <span className="project-badge" style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
        {task.project}
      </span>
    </div>
    <h3 className="task-title" style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>{task.title}</h3>
    {task.description && <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>}

    <div className="task-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '8px' }}>
      <div className="assignee-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="assignee-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {task.avatar}
        </div>
        <span className="assignee-name" style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{task.assignee}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          title="Edit Task"
          onClick={() => onEdit(task)}
          style={{ border: 'none', background: '#f1f5f9', color: '#475569', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Edit size={13} />
        </button>
        <button
          title="Delete Task"
          onClick={() => onDelete(task.id)}
          style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  </motion.div>
);

const TaskDashboard = () => {
  const [view, setView] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    title: '',
    project: 'Website Redesign',
    assignedTo: '',
    priority: 'Medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  };

  const [form, setForm] = useState(initialForm);

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
    } catch (e) { }
  };

  const fetchTasksData = async () => {
    setLoading(true);
    const { data: dbTasks } = await getAllTasks();
    const { data: empsData } = await getAllEmployees();
    const { data: projectsData } = await getCompanyProjects();

    if (empsData && Array.isArray(empsData)) {
      setEmployees(empsData);
    }
    if (projectsData && Array.isArray(projectsData)) {
      setProjectList(projectsData);
    }

    const localSaved = getStoredLocalTasks();
    const mergedMap = new Map();

    [...localSaved, ...(dbTasks || [])].forEach(t => {
      let st = (t.status || 'todo').toLowerCase();
      if (st === 'pending' || st === 'not-started') st = 'todo';
      if (st === 'in progress') st = 'in-progress';
      if (st === 'done') st = 'completed';

      const assigneeStr = t.assigned_to || t.assignedTo || 'Balaji Sarabu (EMP-001)';
      const initials = assigneeStr.substring(0, 2).toUpperCase();

      const key = t.id || `${t.title}-${t.due_date}`;
      mergedMap.set(key, {
        id: t.id || ('TSK-' + Math.floor(1000 + Math.random() * 9000)),
        title: t.title || t.name || 'Untitled Task',
        project: t.project_name || t.project || 'General',
        assignee: assigneeStr,
        assignedTo: assigneeStr,
        avatar: initials,
        priority: (t.priority || 'Medium').charAt(0).toUpperCase() + (t.priority || 'medium').slice(1),
        dueDate: t.due_date || t.dueDate || new Date().toISOString().split('T')[0],
        status: st,
        rawStatus: t.status || 'todo',
        description: t.description || ''
      });
    });

    const parsed = Array.from(mergedMap.values());
    setTasks(parsed);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setForm({
      ...initialForm,
      assignedTo: employees.length > 0 ? `${employees[0].first_name} ${employees[0].last_name} (${employees[0].emp_id || 'EMP-001'})` : 'Balaji Sarabu (EMP-001)'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTask(t);
    setForm({
      title: t.title,
      project: t.project,
      assignedTo: t.assignedTo || t.assignee,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      description: t.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Please enter task title');
      return;
    }

    setSubmitting(true);
    const taskId = editingTask ? editingTask.id : ('TSK-2026-' + Math.floor(100 + Math.random() * 900));

    const assigneeStr = form.assignedTo || 'Balaji Sarabu (EMP-001)';
    const newTaskItem = {
      id: taskId,
      title: form.title,
      project: form.project,
      assignee: assigneeStr,
      assignedTo: assigneeStr,
      avatar: assigneeStr.substring(0, 2).toUpperCase(),
      priority: form.priority,
      status: form.status.toLowerCase(),
      dueDate: form.dueDate,
      due_date: form.dueDate,
      description: form.description
    };

    // Instant local storage persistence
    const stored = getStoredLocalTasks();
    const updatedLocal = editingTask
      ? stored.map(t => t.id === editingTask.id ? newTaskItem : t)
      : [newTaskItem, ...stored];

    saveLocalTasks(updatedLocal);

    setTasks(prev => {
      const filtered = prev.filter(t => t.id !== taskId);
      return [newTaskItem, ...filtered];
    });

    // Supabase DB sync
    if (editingTask) {
      updateTask(editingTask.id, {
        title: form.title,
        project_name: form.project,
        assigned_to: assigneeStr,
        priority: form.priority.toLowerCase(),
        status: form.status.toLowerCase(),
        due_date: form.dueDate,
        description: form.description
      }).catch(err => console.warn('Update task DB notice:', err));
    } else {
      createTask({
        title: form.title,
        project_name: form.project,
        assigned_to: assigneeStr,
        priority: form.priority.toLowerCase(),
        status: form.status.toLowerCase(),
        due_date: form.dueDate,
        description: form.description
      }).catch(err => console.warn('Create task DB notice:', err));
    }

    setSubmitting(false);
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    const stored = getStoredLocalTasks();
    saveLocalTasks(stored.filter(t => t.id !== id));

    setTasks(prev => prev.filter(t => t.id !== id));
    deleteTask(id).catch(err => console.warn('Delete task DB notice:', err));
  };

  const columns = [
    { id: 'todo', label: 'To Do', class: 'col-todo' },
    { id: 'in-progress', label: 'In Progress', class: 'col-in-progress' },
    { id: 'review', label: 'Review', class: 'col-review' },
    { id: 'completed', label: 'Done', class: 'col-done' },
  ];

  const employeeOptions = employees.map(e => {
    const fName = e.firstName || e.first_name || (e.email ? e.email.split('@')[0] : 'Employee');
    const lName = e.lastName || e.last_name || '';
    const fullName = `${fName} ${lName}`.trim();
    const code = e.empCode || e.emp_id || 'EMP-001';
    return `${fullName} (${code})`;
  });
  if (employeeOptions.length === 0) employeeOptions.push('Balaji Sarabu (EMP-001)', 'Rahul Sharma (EMP-002)', 'Priya Verma (EMP-003)');

  return (
    <motion.div
      className="task-dashboard-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Task Dashboard</h1>
          <p>Assign, manage, and track organization tasks across all teams</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/tasks/create" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> Create Task
          </Link>
          <Link to="/admin/tasks/review" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            <CheckCircle size={16} /> Task Review Queue
          </Link>
        </div>
      </div>

      <div className="view-toggle">
        <button
          className={`toggle-btn ${view === 'board' ? 'active' : ''}`}
          onClick={() => setView('board')}
        >
          <LayoutGrid size={16} /> Board View
        </button>
        <button
          className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          <List size={16} /> Table View
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 8px', color: '#2563eb' }} />
          <p>Loading company tasks board...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'board' ? (
            <motion.div
              key="board"
              className="kanban-board"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id || (col.id === 'review' && t.status === 'waiting-review'));
                return (
                  <div key={col.id} className={`kanban-column ${col.class}`}>
                    <div className="column-header">
                      <span className="column-title">{col.label}</span>
                      <span className="task-count">{colTasks.length}</span>
                    </div>
                    <div className="column-body">
                      {colTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={handleOpenEdit} onDelete={handleDeleteTask} />
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
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{task.title}</td>
                      <td style={{ color: '#475569' }}>{task.project}</td>
                      <td>
                        <div className="assignee-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="assignee-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {task.avatar}
                          </div>
                          <span className="assignee-name">{task.assignee}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{task.dueDate}</td>
                      <td>
                        <span className={`status-badge ${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="btn-icon" title="Edit Task" onClick={() => handleOpenEdit(task)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon danger" title="Delete Task" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* CREATE / EDIT TASK ENTERPRISE MODAL */}
      <EnterpriseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FormHeader
          icon={Plus}
          title={editingTask ? "Edit Company Task" : "Create New Company Task"}
          description={editingTask ? "Update assignment details or task priorities." : "Assign a new task to an employee or department team."}
        />

        <form onSubmit={handleSubmitTask}>
          <FormBody>
            <FormSection title="Task Details" description="Define task title, project, and assignee." singleColumn>
              <FormField label="Task Title" required>
                <TextInput
                  placeholder="e.g., Update HRMS Database Indexing"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Assign To Employee" required>
                <SelectInput
                  options={employeeOptions}
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Project Name" required>
                <TextInput
                  placeholder="e.g., HRMS Core Development"
                  value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Priority Level" required>
                <SelectInput
                  options={['Low', 'Medium', 'High', 'Critical']}
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Status" required>
                <SelectInput
                  options={['todo', 'in-progress', 'waiting-review', 'completed']}
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Due Date" required>
                <DateInput
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Task Description / Instructions" optional>
                <TextArea
                  placeholder="Provide clear steps, deliverables, and acceptance criteria..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
            </FormSection>
          </FormBody>

          <FormFooter
            onCancel={() => setIsModalOpen(false)}
            submitText={submitting ? "Saving..." : (editingTask ? "Update Task" : "Assign Task")}
          />
        </form>
      </EnterpriseModal>
    </motion.div>
  );
};

export default TaskDashboard;
