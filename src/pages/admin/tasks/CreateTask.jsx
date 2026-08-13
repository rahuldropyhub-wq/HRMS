import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, X, ArrowLeft, Plus, CheckCircle, Clock, User, ShieldCheck, Tag, FileText, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import '../../../styles/admin/tasks/create-task.css';
import { useForm } from 'react-hook-form';
import { createTask, getAllEmployees, getProjects, getCompanyProjects, createCompanyProject, validateProjectMembership } from '../../../services/adminService';
import { useAuth } from '../../../contexts/AuthContext';

const CreateTask = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [employees, setEmployees] = useState([]);
  const [projectsList, setProjectsList] = useState([]); // Full project objects
  const [projects, setProjects] = useState([]);
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectName, setCustomProjectName] = useState('');
  const [tags, setTags] = useState(['Development', 'Urgent']);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();

  const selectedProjectName = watch('project');

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: empsData } = await getAllEmployees();
      const { data: fullProjects } = await getProjects();
      const { data: projNames } = await getCompanyProjects();

      if (empsData && Array.isArray(empsData)) {
        setEmployees(empsData);
      }
      if (fullProjects && Array.isArray(fullProjects)) {
        setProjectsList(fullProjects);
      }
      if (projNames && Array.isArray(projNames)) {
        setProjects(projNames);
      }
    };
    loadInitialData();
  }, []);

  // Compute filtered employees for Assign To dropdown based on selected project
  const matchedProject = projectsList.find(p => p.name === selectedProjectName);
  const projectMembers = matchedProject?.members || [];

  const filteredEmployees = useMemo ? projectMembers : projectMembers.length > 0
    ? employees.filter(e => projectMembers.some(m => m.id === e.id || m.empCode === e.empCode || m.email === e.email))
    : employees;

  const activeEmployeeList = (projectMembers.length > 0 && filteredEmployees.length > 0)
    ? filteredEmployees
    : employees;

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

  const onSubmit = async (data) => {
    setSubmitting(true);

    const finalProject = isCustomProject ? customProjectName.trim() : data.project;
    if (isCustomProject && finalProject) {
      createCompanyProject(finalProject);
    }

    const taskId = 'TSK-2026-' + Math.floor(100 + Math.random() * 900);
    const assigneeStr = data.assignee || (employees.length > 0 ? `${employees[0].first_name} ${employees[0].last_name} (${employees[0].emp_id || 'EMP-001'})` : 'Balaji Sarabu (EMP-001)');

    const newTaskItem = {
      id: taskId,
      title: data.title,
      description: data.description || '',
      project: finalProject || 'General Project',
      project_name: finalProject || 'General Project',
      assignee: assigneeStr,
      assignedTo: assigneeStr,
      assigned_to: assigneeStr,
      avatar: assigneeStr.substring(0, 2).toUpperCase(),
      priority: (data.priority || 'Medium').charAt(0).toUpperCase() + (data.priority || 'medium').slice(1),
      status: 'todo',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      due_date: data.dueDate || new Date().toISOString().split('T')[0],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      estimatedHours: data.estimatedHours || '5.0',
      tags: tags,
      attachments: selectedFile ? [{ name: selectedFile.name, size: (selectedFile.size / 1024).toFixed(1) + ' KB' }] : []
    };

    // Save locally for instant persistence
    const stored = getStoredLocalTasks();
    saveLocalTasks([newTaskItem, ...stored]);

    // Send to Supabase DB
    createTask({
      title: data.title,
      description: data.description,
      project_name: finalProject,
      priority: data.priority?.toLowerCase() || 'medium',
      status: 'todo',
      due_date: data.dueDate,
      assigned_to: assigneeStr,
      assigned_by: user?.id,
      estimated_hours: data.estimatedHours
    }).catch(err => console.warn('Create task DB notice:', err));

    setSubmitting(false);
    navigate('/admin/tasks');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const employeeOptions = activeEmployeeList.map(e => {
    const fName = e.firstName || e.first_name || (e.email ? e.email.split('@')[0] : 'Employee');
    const lName = e.lastName || e.last_name || '';
    const fullName = `${fName} ${lName}`.trim();
    const code = e.empCode || e.emp_id || 'EMP-001';
    const dept = e.department && e.department !== '-' ? e.department : (e.departments?.name || '');
    const displayLabel = `${fullName} (${code})${dept ? ` - ${dept}` : ''}`;
    return {
      id: `${fullName} (${code})`,
      name: displayLabel
    };
  });

  if (employeeOptions.length === 0) {
    employeeOptions.push(
      { id: 'Balaji Sarabu (EMP-001)', name: 'Balaji Sarabu (EMP-001) - Engineering' },
      { id: 'Rahul Sharma (EMP-002)', name: 'Rahul Sharma (EMP-002) - Marketing' },
      { id: 'Priya Verma (EMP-003)', name: 'Priya Verma (EMP-003) - HR' }
    );
  }

  return (
    <motion.div 
      className="create-task-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}
    >
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/admin/tasks" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', background: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="page-title">
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>Create & Assign New Task</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Fill in task details, set priorities, and assign deliverables to team members</p>
        </div>
      </div>

      <div className="form-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* TASK TITLE */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input 
              type="text" 
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Implement Mobile App Responsive Design & API Integration"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: errors.title ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '15px', fontWeight: 500 }}
              {...register('title', { required: 'Task title is required' })}
            />
            {errors.title && <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title.message}</span>}
          </div>

          {/* DESCRIPTION */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Detailed Instructions & Deliverables</label>
            <textarea 
              className="form-control"
              rows="4"
              placeholder="Provide step-by-step instructions, acceptance criteria, and specific requirements for the assignee..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', lineHeight: 1.5 }}
              {...register('description')}
            ></textarea>
          </div>

          {/* PROJECT & ASSIGNEE ROW */}
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Select Project <span style={{ color: '#ef4444' }}>*</span></label>
              {!isCustomProject ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className={`form-control ${errors.project ? 'error' : ''}`}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    {...register('project', { required: 'Please select a project' })}
                    onChange={e => {
                      if (e.target.value === '+ Add Custom Project...') {
                        setIsCustomProject(true);
                      } else {
                        setValue('project', e.target.value);
                      }
                    }}
                  >
                    <option value="">Select Company Project</option>
                    {projects.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="+ Add Custom Project...">+ Add Custom Project...</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Type custom project name..."
                    value={customProjectName}
                    onChange={e => setCustomProjectName(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsCustomProject(false)} 
                    style={{ padding: '0 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Select List
                  </button>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Assign To Employee <span style={{ color: '#ef4444' }}>*</span></label>
              <select 
                className={`form-control ${errors.assignee ? 'error' : ''}`}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: errors.assignee ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '14px' }}
                {...register('assignee', { required: 'Please assign an employee' })}
              >
                <option value="">Select Employee</option>
                {employeeOptions.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              {projectMembers.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} /> Showing {activeEmployeeList.length} members assigned to "{selectedProjectName}"
                </div>
              )}
              {errors.assignee && <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.assignee.message}</span>}
            </div>
          </div>

          {/* PRIORITY SELECTION */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '10px', display: 'block', fontSize: '14px' }}>Priority Level <span style={{ color: '#ef4444' }}>*</span></label>
            <div className="radio-group" style={{ display: 'flex', gap: '16px' }}>
              {['Low', 'Medium', 'High', 'Critical'].map(p => (
                <label key={p} className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  <input type="radio" value={p} defaultChecked={p === 'Medium'} {...register('priority', { required: 'Select priority' })} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* DATES ROW */}
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="date" 
                className={`form-control ${errors.startDate ? 'error' : ''}`}
                defaultValue={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                {...register('startDate', { required: 'Start date is required' })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Due Date <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="date" 
                className={`form-control ${errors.dueDate ? 'error' : ''}`}
                defaultValue={new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                {...register('dueDate', { required: 'Due date is required' })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Estimated Hours</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g., 6.5"
                step="0.5"
                defaultValue="6.0"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                {...register('estimatedHours')}
              />
            </div>
          </div>

          {/* TAGS */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Task Labels / Tags</label>
            <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}>
              {tags.map(tag => (
                <span key={tag} className="tag" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 600, padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {tag} <button type="button" onClick={() => removeTag(tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb', padding: 0 }}><X size={12} /></button>
                </span>
              ))}
              <input 
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '160px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block', fontSize: '14px' }}>Attachments & Files</label>
            <div 
              className="file-upload-zone" 
              onClick={() => document.getElementById('task-file-input').click()}
              style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}
            >
              <input type="file" id="task-file-input" style={{ display: 'none' }} onChange={handleFileChange} />
              <UploadCloud size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#334155' }}>
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to upload task specification file'}
              </p>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>PDF, DOCX, PNG, JPG, or ZIP (max. 20MB)</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/admin/tasks')} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-submit" style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', fontWeight: 600, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {submitting ? 'Creating Task...' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTask;
