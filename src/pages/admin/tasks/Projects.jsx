import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, FolderKanban, Users, Calendar, Tag, X,
  Edit2, Trash2, ChevronDown, Loader2, CheckCircle2,
  AlertCircle, Clock, Layers, UserCheck, ArrowRight, Briefcase
} from 'lucide-react';
import {
  getProjects, createProject, updateProject, deleteProject,
  addProjectMember, removeProjectMember
} from '../../../services/adminService';
import { getAllEmployees } from '../../../services/adminService';
import '../../../styles/admin/tasks/projects.css';

const STATUS_CONFIG = {
  planning:  { label: 'Planning',   color: '#8b5cf6', bg: '#ede9fe' },
  active:    { label: 'Active',     color: '#059669', bg: '#d1fae5' },
  on_hold:   { label: 'On Hold',    color: '#d97706', bg: '#fef3c7' },
  completed: { label: 'Completed',  color: '#2563eb', bg: '#dbeafe' },
  cancelled: { label: 'Cancelled',  color: '#dc2626', bg: '#fee2e2' },
};

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#64748b', bg: '#f1f5f9' },
  medium:   { label: 'Medium',   color: '#d97706', bg: '#fef3c7' },
  high:     { label: 'High',     color: '#ea580c', bg: '#ffedd5' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
};

const MEMBER_ROLES = [
  { value: 'project_manager',  label: 'Project Manager' },
  { value: 'developer',        label: 'Developer' },
  { value: 'ui_ux_designer',   label: 'UI/UX Designer' },
  { value: 'tester',           label: 'Tester' },
  { value: 'devops',           label: 'DevOps' },
  { value: 'member',           label: 'Member' },
];

const DEPARTMENTS = [
  'Engineering', 'UI/UX', 'QA & Testing', 'DevOps', 'Product',
  'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'
];

const ALL_STATUSES = ['planning', 'active', 'on_hold', 'completed'];
const ALL_PRIORITIES = ['low', 'medium', 'high', 'critical'];

const EMPTY_FORM = {
  name: '', description: '', status: 'planning', priority: 'medium',
  start_date: '', end_date: '', tags: [], departments: [], tagInput: '',
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [membersDrawer, setMembersDrawer] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [projRes, empRes] = await Promise.all([getProjects(), getAllEmployees()]);
    setProjects(projRes.data || []);
    setAllEmployees(empRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = projects.filter(p => {
    const matchSearch = !searchTerm ||
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setSelectedMembers([]);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      tags: Array.isArray(project.tags) ? [...project.tags] : [],
      departments: project.departments || [],
      tagInput: '',
    });
    setSelectedMembers((project.members || []).map(m => ({
      id: m.id, firstName: m.firstName, lastName: m.lastName,
      empCode: m.empCode, department: m.department, role: m.role || 'member',
    })));
    setFormError('');
    setModalOpen(true);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && form.tagInput.trim()) {
      e.preventDefault();
      const tag = form.tagInput.trim();
      if (!form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: '' }));
      else setForm(f => ({ ...f, tagInput: '' }));
    }
  };
  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const toggleDept = (dept) => {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(dept)
        ? f.departments.filter(d => d !== dept)
        : [...f.departments, dept],
    }));
  };

  const filteredAvailableEmployees = allEmployees.filter(e => {
    if (selectedMembers.some(m => m.id === e.id)) return false;
    if (!memberSearch) return false;
    const term = memberSearch.toLowerCase();
    const name = `${e.firstName || e.first_name || ''} ${e.lastName || e.last_name || ''}`.toLowerCase();
    return name.includes(term) || (e.empCode || e.emp_id || '').toLowerCase().includes(term)
      || (e.department || '').toLowerCase().includes(term);
  });

  const addMember = (emp) => {
    setSelectedMembers(prev => [...prev, {
      id: emp.id,
      firstName: emp.firstName || emp.first_name || '',
      lastName: emp.lastName || emp.last_name || '',
      empCode: emp.empCode || emp.emp_id || '',
      department: emp.department || '',
      role: 'member',
    }]);
    setMemberSearch('');
  };

  const removeMember = (id) => setSelectedMembers(prev => prev.filter(m => m.id !== id));
  const updateMemberRole = (id, role) => setSelectedMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Project name is required.'); return; }
    if (form.departments.length === 0) { setFormError('Select at least one department.'); return; }

    setSaving(true);
    try {
      let projectId;
      if (editingProject) {
        const { error } = await updateProject(editingProject.id, {
          name: form.name.trim(), description: form.description.trim(),
          status: form.status, priority: form.priority,
          start_date: form.start_date || null, end_date: form.end_date || null,
          tags: form.tags, departments: form.departments,
        });
        if (error) throw new Error(error);
        projectId = editingProject.id;
        for (const m of (editingProject.members || [])) {
          await removeProjectMember(projectId, m.id);
        }
      } else {
        const { data, error } = await createProject({
          name: form.name.trim(), description: form.description.trim(),
          status: form.status, priority: form.priority,
          start_date: form.start_date || null, end_date: form.end_date || null,
          tags: form.tags, departments: form.departments,
        });
        if (error) throw new Error(error);
        projectId = data.id;
      }
      for (const m of selectedMembers) {
        await addProjectMember(projectId, m.id, m.role);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save project.');
    }
    setSaving(false);
  };

  const handleDelete = async (projectId) => {
    await deleteProject(projectId);
    setDeleteConfirm(null);
    await loadData();
  };

  return (
    <div className="projects-page">
      {/* Header */}
      <div className="projects-header">
        <div>
          <h1 className="projects-title"><FolderKanban size={26} /> Projects</h1>
          <p className="projects-subtitle">Create projects, assign team members across departments, and manage task allocation.</p>
        </div>
        <button className="btn-create-project" onClick={openCreate}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="projects-search">
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-status-tabs">
          {['all', ...ALL_STATUSES].map(s => (
            <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="projects-stats">
        {ALL_STATUSES.map(s => (
          <div key={s} className="stat-chip" style={{ borderColor: STATUS_CONFIG[s].color }}>
            <span className="stat-dot" style={{ background: STATUS_CONFIG[s].color }} />
            <span>{STATUS_CONFIG[s].label}</span>
            <strong>{projects.filter(p => p.status === s).length}</strong>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="projects-loading"><Loader2 size={32} className="spin" /> Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="projects-empty">
          <FolderKanban size={56} color="#cbd5e1" />
          <h3>No projects found</h3>
          <p>Create your first project and assign team members to get started.</p>
          <button className="btn-create-project" onClick={openCreate}><Plus size={16} /> Create Project</button>
        </div>
      ) : (
        <motion.div className="projects-grid" layout>
          <AnimatePresence>
            {filtered.map(project => {
              const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
              const pc = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.medium;
              return (
                <motion.div key={project.id} className="project-card" layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <div className="project-card-header">
                    <div className="project-name-row">
                      <div className="project-icon-box" style={{ background: sc.bg }}>
                        <FolderKanban size={20} color={sc.color} />
                      </div>
                      <div className="project-name-info">
                        <h3 className="project-name">{project.name}</h3>
                        <div className="project-badges">
                          <span className="badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                          <span className="badge" style={{ color: pc.color, background: pc.bg }}>{pc.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button className="icon-btn" onClick={() => openEdit(project)}><Edit2 size={15} /></button>
                      <button className="icon-btn danger" onClick={() => setDeleteConfirm(project)}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  {project.description && <p className="project-desc">{project.description}</p>}
                  {project.departments?.length > 0 && (
                    <div className="project-depts">
                      {project.departments.map(d => <span key={d} className="dept-chip"><Briefcase size={11} /> {d}</span>)}
                    </div>
                  )}
                  {(project.start_date || project.end_date) && (
                    <div className="project-timeline">
                      <Calendar size={13} color="#64748b" />
                      <span>{project.start_date || '—'} → {project.end_date || '—'}</span>
                    </div>
                  )}
                  {project.tags?.length > 0 && (
                    <div className="project-tags">
                      {project.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                    </div>
                  )}
                  <div className="project-card-footer">
                    <div className="member-avatars">
                      {(project.members || []).slice(0, 5).map((m, i) => (
                        <div key={m.id || i} className="member-avatar-circle" title={`${m.firstName} ${m.lastName}`} style={{ zIndex: 10 - i }}>
                          {String(m.firstName || 'M')[0].toUpperCase()}
                        </div>
                      ))}
                      {(project.memberCount || 0) > 5 && <div className="member-avatar-circle more">+{project.memberCount - 5}</div>}
                    </div>
                    <button className="btn-view-members" onClick={() => setMembersDrawer(project)}>
                      <Users size={14} /> {project.memberCount || 0} Members <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
            <motion.div className="project-modal" initial={{ opacity: 0, scale: 0.93, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 30 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                <button className="modal-close-btn" onClick={() => setModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                {formError && <div className="form-error-banner"><AlertCircle size={16} /> {formError}</div>}
                <div className="form-field">
                  <label>Project Name <span className="req">*</span></label>
                  <input type="text" placeholder="e.g., HRMS Portal Upgrade" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Brief description of project goals and scope..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-row-2">
                  <div className="form-field">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {ALL_PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-field">
                    <label>Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>End Date / Deadline</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-field">
                  <label>Departments Involved <span className="req">*</span></label>
                  <div className="dept-chip-grid">
                    {DEPARTMENTS.map(d => (
                      <button key={d} type="button" className={`dept-toggle-chip ${form.departments.includes(d) ? 'selected' : ''}`} onClick={() => toggleDept(d)}>
                        {form.departments.includes(d) && <CheckCircle2 size={13} />} {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>Tags</label>
                  <div className="tags-input-box">
                    {form.tags.map(t => (
                      <span key={t} className="tag-pill">{t} <button type="button" onClick={() => removeTag(t)}><X size={11} /></button></span>
                    ))}
                    <input type="text" placeholder="Type tag and press Enter" value={form.tagInput} onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))} onKeyDown={addTag} />
                  </div>
                </div>
                <div className="form-field">
                  <label>Assign Team Members</label>
                  <input type="text" className="member-search-input" placeholder="Search by name, code or department..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                  {memberSearch && filteredAvailableEmployees.length > 0 && (
                    <div className="member-suggestions">
                      {filteredAvailableEmployees.slice(0, 8).map(emp => (
                        <div key={emp.id} className="member-suggestion-item" onClick={() => addMember(emp)}>
                          <div className="emp-avatar-sm">{String(emp.firstName || emp.first_name || 'E')[0].toUpperCase()}</div>
                          <div>
                            <div className="emp-name">{emp.firstName || emp.first_name} {emp.lastName || emp.last_name} ({emp.empCode || emp.emp_id})</div>
                            <div className="emp-dept">{emp.department}</div>
                          </div>
                          <Plus size={16} className="add-icon" />
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedMembers.length > 0 && (
                    <div className="selected-members-list">
                      {selectedMembers.map(m => (
                        <div key={m.id} className="selected-member-row">
                          <div className="emp-avatar-sm role-color">{String(m.firstName || 'M')[0].toUpperCase()}</div>
                          <div className="selected-member-info">
                            <span className="emp-name">{m.firstName} {m.lastName} ({m.empCode})</span>
                            <span className="emp-dept">{m.department}</span>
                          </div>
                          <select className="role-select" value={m.role} onChange={e => updateMemberRole(m.id, e.target.value)}>
                            {MEMBER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <button type="button" className="remove-member-btn" onClick={() => removeMember(m.id)}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel-modal" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-save-modal" disabled={saving}>
                    {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><CheckCircle2 size={16} /> {editingProject ? 'Update Project' : 'Create Project'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)}>
            <motion.div className="confirm-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <Trash2 size={36} color="#dc2626" />
              <h3>Archive Project?</h3>
              <p>"{deleteConfirm.name}" will be marked as Cancelled. Tasks and members remain intact.</p>
              <div className="confirm-actions">
                <button className="btn-cancel-modal" onClick={() => setDeleteConfirm(null)}>Keep It</button>
                <button className="btn-delete-confirm" onClick={() => handleDelete(deleteConfirm.id)}>Yes, Archive</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members Drawer */}
      <AnimatePresence>
        {membersDrawer && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMembersDrawer(null)}>
            <motion.div className="members-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <div>
                  <h3>{membersDrawer.name}</h3>
                  <p>{membersDrawer.memberCount || 0} team members assigned</p>
                </div>
                <button className="modal-close-btn" onClick={() => setMembersDrawer(null)}><X size={20} /></button>
              </div>
              <div className="drawer-body">
                {(membersDrawer.members || []).length === 0 ? (
                  <div className="no-members">No members assigned yet.</div>
                ) : (
                  (membersDrawer.members || []).map(m => (
                    <div key={m.id} className="drawer-member-row">
                      <div className="drawer-avatar">{String(m.firstName || 'M')[0].toUpperCase()}</div>
                      <div className="drawer-member-info">
                        <strong>{m.firstName} {m.lastName}</strong>
                        <span>{m.empCode} · {m.department}</span>
                      </div>
                      <span className="drawer-role-badge">
                        {MEMBER_ROLES.find(r => r.value === m.role)?.label || m.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
