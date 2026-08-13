import React, { useState, useEffect } from 'react';
import { compressAttachment } from '../../utils/imageCompressor';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  User,
  Bell,
  Settings,
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  Plus,
  History,
  ListTodo,
  CheckCircle2,
  Hourglass,
  Clock,
  MoreHorizontal,
  Image as ImageIcon,
  FileText as FileIcon,
  Ticket,
  PackageOpen,
  X,
  Loader2,
  AlertTriangle
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
import '../../styles/employee/worksheet.css';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyWorksheets,
  submitWorksheet,
  updateWorksheet,
  deleteWorksheet,
  getTodayAttendance,
  getMyTasks,
  checkOut
} from '../../services/employeeService';
import { Edit, Trash2, Download, Eye, Paperclip } from 'lucide-react';

function Worksheet() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // custom delete modal
  const [previewFile, setPreviewFile] = useState(null); // file preview modal
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [attendance, setAttendance] = useState(null);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };
  const [formState, setFormState] = useState({
    project: '',
    description: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  const formattedToday = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'long'
  });

  const fetchWorksheets = async () => {
    if (!user) return;
    const { data } = await getMyWorksheets(user.id);
    if (data) setEntries(data);
  };

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    const load = async () => {
      // 1. Fetch primary worksheets data FIRST for instant page load
      try {
        const wsRes = await getMyWorksheets(user.id);
        if (isMounted && wsRes?.data) {
          setEntries(wsRes.data);
        }
      } catch (err) {
        console.error('Worksheets load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false); // Instant load!
        }
      }

      // 2. Load secondary stats (attendance & tasks) asynchronously without blocking UI
      try {
        const [attRes, taskRes] = await Promise.allSettled([
          getTodayAttendance(user.id),
          getMyTasks(user.id)
        ]);

        if (isMounted) {
          if (attRes.status === 'fulfilled' && attRes.value?.data) {
            setAttendance(attRes.value.data);
          }
          if (taskRes.status === 'fulfilled' && taskRes.value?.data) {
            const data = taskRes.value.data;
            const total = data.length;
            const completed = data.filter(t => (t.status || '').toLowerCase() === 'completed' || (t.status || '').toLowerCase() === 'done').length;
            const inProgress = data.filter(t => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'in-progress').length;
            setTaskStats({ total, completed, inProgress });
          }
        }
      } catch (err) {
        console.error('Secondary stats error:', err);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [user]);

  const encodeWorksheetData = (form) => {
    const meta = {
      t: form.title || '',
      c: form.category || 'Development',
      st: form.startTime || '10:00',
      et: form.endTime || '18:00',
      ws: form.status || 'Completed',
      ch: form.challenges || '',
      ac: form.achievements || '',
      fn: form.fileName || '',
      fd: form.fileData || '',
      d: form.description || ''
    };
    return `__META__${JSON.stringify(meta)}__META__${form.description || ''}`;
  };

  const decodeWorksheetData = (entry) => {
    const rawDesc = entry?.description || '';
    if (rawDesc.startsWith('__META__')) {
      try {
        const parts = rawDesc.split('__META__');
        const meta = JSON.parse(parts[1]);
        return {
          ...entry,
          title: meta.t,
          category: meta.c,
          startTime: meta.st,
          endTime: meta.et,
          work_status: meta.ws,
          challenges: meta.ch,
          achievements: meta.ac,
          fileName: meta.fn || '',
          fileData: meta.fd || '',
          displayDescription: meta.d || parts[2] || ''
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      ...entry,
      title: entry?.project || '',
      category: 'Development',
      startTime: '10:00',
      endTime: '18:00',
      work_status: 'Completed',
      challenges: '',
      achievements: '',
      fileName: '',
      fileData: '',
      displayDescription: rawDesc
    };
  };

  const calculateHoursBetween = (startStr, endStr) => {
    if (!startStr || !endStr) return '';
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    if (isNaN(startH) || isNaN(endH)) return '';

    let startMinutes = startH * 60 + (startM || 0);
    let endMinutes = endH * 60 + (endM || 0);

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Overnight shift
    }

    const diffMins = endMinutes - startMinutes;
    const numHours = (diffMins / 60).toFixed(1);
    return numHours.endsWith('.0') ? numHours.slice(0, -2) : numHours;
  };

  const handleStartTimeChange = (newStartTime) => {
    const computedHours = calculateHoursBetween(newStartTime, formState.endTime);
    setFormState(prev => ({
      ...prev,
      startTime: newStartTime,
      hours: computedHours || prev.hours
    }));
  };

  const handleEndTimeChange = (newEndTime) => {
    const computedHours = calculateHoursBetween(formState.startTime, newEndTime);
    setFormState(prev => ({
      ...prev,
      endTime: newEndTime,
      hours: computedHours || prev.hours
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressAttachment(file).then(({ dataUrl }) => {
        setFormState(prev => ({
          ...prev,
          fileName: file.name,
          fileData: dataUrl
        }));
      }).catch(() => {
        triggerToast('Failed to process file.', 'error');
      });
    }
  };

  const openCreateModal = () => {
    setEditingEntry(null);
    const initialStart = '10:00';
    const initialEnd = '18:00';
    setFormState({
      date: new Date().toISOString().split('T')[0],
      project: 'HRMS Portal',
      title: '',
      category: 'Development',
      description: '',
      startTime: initialStart,
      endTime: initialEnd,
      hours: calculateHoursBetween(initialStart, initialEnd),
      status: 'Completed',
      challenges: '',
      achievements: '',
      fileName: '',
      fileData: ''
    });
    setShowModal(true);
  };

  const openEditModal = (rawEntry) => {
    const entry = decodeWorksheetData(rawEntry);
    setEditingEntry(entry);
    setFormState({
      date: entry.date || new Date().toISOString().split('T')[0],
      project: entry.project || 'HRMS Portal',
      title: entry.title || entry.project || '',
      category: entry.category || 'Development',
      description: entry.displayDescription || '',
      startTime: entry.startTime || '10:00',
      endTime: entry.endTime || '18:00',
      hours: entry.hours ? String(entry.hours) : calculateHoursBetween(entry.startTime, entry.endTime),
      status: entry.work_status || 'Completed',
      challenges: entry.challenges || '',
      achievements: entry.achievements || '',
      fileName: entry.fileName || '',
      fileData: entry.fileData || ''
    });
    setShowModal(true);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formState.project || !formState.description) {
      triggerToast('Please fill in Project Name and Description.', 'error');
      return;
    }

    setSubmitting(true);
    const encodedDescription = encodeWorksheetData(formState);
    const payload = {
      project: formState.project,
      description: encodedDescription,
      hours: formState.hours || '1.0',
      date: formState.date || new Date().toISOString().split('T')[0]
    };

    if (editingEntry) {
      // Update existing entry in Supabase
      const { data, error } = await updateWorksheet(editingEntry.id, payload);
      if (!error) {
        const updated = data || { ...editingEntry, ...payload };
        setEntries(entries.map(item => item.id === editingEntry.id ? updated : item));
        setShowModal(false);
        triggerToast('Work entry updated successfully!', 'success');
      } else {
        triggerToast('Error updating worksheet: ' + error?.message, 'error');
      }
    } else {
      // Create new entry in Supabase
      const { data, error } = await submitWorksheet({
        employee_id: user.id,
        ...payload,
        status: 'submitted'
      });
      if (!error) {
        if (data) {
          setEntries([data, ...entries]);
        } else {
          const { data: fresh } = await getMyWorksheets(user.id);
          if (fresh) setEntries(fresh);
        }
        setShowModal(false);
        triggerToast('Work entry submitted successfully!', 'success');

        // Check if automatic checkout was requested during checkout flow
        if (sessionStorage.getItem('pending_auto_checkout') === 'true') {
          sessionStorage.removeItem('pending_auto_checkout');
          if (user?.id) {
            await checkOut(user.id).catch(() => {});
          }
          triggerToast('Worksheet submitted & Shift checked out automatically!', 'success');
          setTimeout(() => navigate('/attendance'), 800);
        }
      } else {
        triggerToast('Error submitting worksheet: ' + error?.message, 'error');
      }
    }
    setSubmitting(false);
  };

  const confirmDeleteEntry = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    
    // Optimistically update UI list
    const previousEntries = [...entries];
    setEntries(prev => prev.filter(e => String(e.id) !== String(id)));
    setDeleteTarget(null);

    const { error } = await deleteWorksheet(id);
    if (error) {
      // Revert if DB delete failed
      setEntries(previousEntries);
      triggerToast('Error deleting worksheet: ' + (error?.message || 'Permission denied in Supabase DB'), 'error');
    } else {
      triggerToast('Work entry deleted successfully!', 'success');
    }
  };

  // Calculate Worksheet Entry Stats dynamically
  const totalEntries = entries.length;
  const completedEntriesCount = entries.filter(raw => {
    const e = decodeWorksheetData(raw);
    const st = (e.work_status || e.status || '').toLowerCase();
    return st === 'completed' || st === 'approved';
  }).length;
  const inProgressEntriesCount = entries.filter(raw => {
    const e = decodeWorksheetData(raw);
    const st = (e.work_status || e.status || '').toLowerCase();
    return st === 'in progress' || st === 'submitted' || st === 'in-progress';
  }).length;

  const totalWorksheetHours = entries.reduce((acc, raw) => {
    const hrs = parseFloat(raw.hours) || 0;
    return acc + hrs;
  }, 0);

  // Calculate working hours dynamically (from attendance or worksheet entries)
  const grossHours = attendance?.total_hours ? parseFloat(attendance.total_hours) : totalWorksheetHours;
  const breakHours = attendance?.total_break_hours ? parseFloat(attendance.total_break_hours) : 0;
  const netHours = Math.max(0, grossHours - breakHours);

  const displayTotalTasks = Math.max(totalEntries, taskStats.total);
  const displayCompleted = Math.max(completedEntriesCount, taskStats.completed);
  const displayInProgress = Math.max(inProgressEntriesCount, taskStats.inProgress);

  const formatHoursMins = (numHours) => {
    const h = Math.floor(numHours);
    const m = Math.round((numHours - h) * 60);
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  };

  return (
    <DashboardLayout>
      <div className="worksheet-content">
        <div className="page-header-row">
          <div className="page-title-box">
            <h1>Worksheet</h1>
            <p>Track and manage your daily work progress</p>
          </div>
          <div className="worksheet-header-actions">
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Add Work Entry
            </button>
          </div>
        </div>

        {/* Top Bar / Stats */}
        <div className="worksheet-top-bar">
          <div className="worksheet-date-selector">
            <div>
              <p className="select-date-label">Current Date</p>
              <h4 className="select-date-value">{formattedToday}</h4>
            </div>
            <Calendar size={18} color="#6b7280" />
          </div>

          <div className="worksheet-stats-row">
            <div className="ws-stat-card">
              <div className="ws-icon total">
                <ListTodo size={18} />
              </div>
              <div className="ws-stat-info">
                <p>Total Tasks</p>
                <h4>{displayTotalTasks}</h4>
              </div>
            </div>

            <div className="ws-stat-card">
              <div className="ws-icon completed">
                <CheckCircle2 size={18} />
              </div>
              <div className="ws-stat-info">
                <p>Completed</p>
                <h4>{displayCompleted}</h4>
              </div>
            </div>

            <div className="ws-stat-card">
              <div className="ws-icon in-progress">
                <Hourglass size={18} />
              </div>
              <div className="ws-stat-info">
                <p>In Progress</p>
                <h4>{displayInProgress}</h4>
              </div>
            </div>

            <div className="ws-stat-card">
              <div className="ws-icon hours">
                <Clock size={18} />
              </div>
              <div className="ws-stat-info">
                <p>Total Hours</p>
                <h4>{formatHoursMins(grossHours)}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Entries List Header */}
        <div className="entries-header">
          <h3>Today's Work Entries</h3>
        </div>

        {/* Work Entries List */}
        <div className="work-entries-list">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
              <p>Loading your daily entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <FileText size={32} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 4px', color: '#374151' }}>No Work Entries Submitted Yet</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Click "Add Work Entry" above to record your daily tasks.</p>
            </div>
          ) : (
            entries.map((rawEntry, index) => {
              const entry = decodeWorksheetData(rawEntry);
              return (
                <div className="work-entry-card" key={entry.id || index}>
                  <div className={`entry-status-bar ${entry.status === 'approved' ? 'approved' : 'submitted'}`}></div>
                  <div className="entry-main">
                    <div className="entry-header">
                      <div className="entry-title-group">
                        <div className="entry-badges-row">
                          <span className="entry-project-tag">{entry.project}</span>
                          {entry.category && <span className="entry-category-tag">{entry.category}</span>}
                          <span className={`entry-status-badge ${entry.status === 'approved' ? 'approved' : 'submitted'}`}>
                            {entry.status ? entry.status.toUpperCase() : 'SUBMITTED'}
                          </span>
                        </div>
                        <h3 className="entry-task-title">{entry.title || entry.project}</h3>
                      </div>
                      
                      <div className="entry-actions-right">
                        <div className="entry-time-pills">
                          <span className="pill-hours">⏱️ <strong>{entry.hours || '1.0'} hrs</strong></span>
                          {entry.startTime && entry.endTime && (
                            <span className="pill-time">🕒 {entry.startTime} - {entry.endTime}</span>
                          )}
                          <span className="pill-date">📅 {entry.date}</span>
                        </div>
                        
                        <div className="entry-btn-group">
                          <button className="ws-btn-edit" onClick={() => openEditModal(rawEntry)} title="Edit Entry">
                            <Edit size={14} /> Edit
                          </button>
                          <button className="ws-btn-delete" onClick={() => setDeleteTarget(entry)} title="Delete Entry">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="entry-body-box">
                      <p className="entry-description-text">{entry.displayDescription}</p>
                    </div>

                    {(entry.challenges || entry.achievements || entry.fileName) && (
                      <div className="entry-footer-meta">
                        {entry.challenges && (
                          <div className="meta-chip challenge">
                            <span>⚠️ <strong>Blockers:</strong> {entry.challenges}</span>
                          </div>
                        )}
                        {entry.achievements && (
                          <div className="meta-chip achievement">
                            <span>🏆 <strong>Achievement:</strong> {entry.achievements}</span>
                          </div>
                        )}
                        {entry.fileName && (
                          <div className="meta-chip attachment" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span>📎 <strong>Attachment:</strong> {entry.fileName}</span>
                            <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
                              <button 
                                type="button" 
                                onClick={() => setPreviewFile({ name: entry.fileName, url: entry.fileData })}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  padding: '3px 9px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Eye size={13} /> View
                              </button>
                              {entry.fileData && (
                                <a 
                                  href={entry.fileData} 
                                  download={entry.fileName}
                                  style={{
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    borderRadius: '6px',
                                    padding: '3px 9px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Download size={13} /> Download
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Summary Footer */}
        <div className="worksheet-summary-footer">
          <div className="summary-item">
            <p>Total Working Hours</p>
            <h4>{formatHoursMins(grossHours)}</h4>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <p>Break Time</p>
            <h4>{formatHoursMins(breakHours)}</h4>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <p>Net Working Hours</p>
            <h4>{formatHoursMins(netHours)}</h4>
          </div>
        </div>
      </div>

      {/* Add / Edit Work Entry Enterprise Modal */}
      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FormHeader 
          icon={FileIcon} 
          title={editingEntry ? "Edit Work Entry" : "Add Work Entry"} 
          description={editingEntry ? "Update your logged project hours and task description." : "Log your daily project hours, achievements, and tasks."} 
        />
        
        <form onSubmit={handleSaveEntry}>
          <FormBody>
            <FormSection title="Today's Work" description="Specify what you worked on today.">
              <FormField label="Working Date" required>
                <DateInput 
                  value={formState.date}
                  onChange={(e) => setFormState({...formState, date: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Project" required>
                <SelectInput 
                  options={['HRMS Portal', 'E-commerce App', 'Internal Dashboard', 'Client Website']}
                  value={formState.project}
                  onChange={(e) => setFormState({...formState, project: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Task Title" required>
                <TextInput 
                  placeholder="e.g. Design Dashboard UI"
                  value={formState.title}
                  onChange={(e) => setFormState({...formState, title: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Task Category" required>
                <SelectInput 
                  options={['Design', 'Development', 'Testing', 'Meeting', 'Planning']}
                  value={formState.category}
                  onChange={(e) => setFormState({...formState, category: e.target.value})}
                  required
                />
              </FormField>
            </FormSection>

            <FormSection title="Work Summary" description="Describe your progress and task details.">
              <FormField label="Task Description" required fullWidth>
                <TextArea 
                  placeholder="Detailed description of the work done..."
                  value={formState.description}
                  onChange={(e) => setFormState({...formState, description: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Start Time" required>
                <input 
                  type="time" 
                  className="ent-input" 
                  value={formState.startTime} 
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required 
                />
              </FormField>
              
              <FormField label="End Time" required>
                <input 
                  type="time" 
                  className="ent-input" 
                  value={formState.endTime} 
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  required 
                />
              </FormField>

              <FormField label="Hours Worked" required>
                <TextInput 
                  placeholder="e.g. 4.5"
                  value={formState.hours}
                  onChange={(e) => setFormState({...formState, hours: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Work Status" required>
                <SelectInput 
                  options={['Completed', 'In Progress', 'On Hold', 'Blocked']}
                  value={formState.status}
                  onChange={(e) => setFormState({...formState, status: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Challenges Faced" fullWidth optional>
                <TextArea 
                  placeholder="Any blockers or issues?" 
                  value={formState.challenges}
                  onChange={(e) => setFormState({...formState, challenges: e.target.value})}
                />
              </FormField>
              
              <FormField label="Achievements" fullWidth optional>
                <TextArea 
                  placeholder="Any milestones reached?" 
                  value={formState.achievements}
                  onChange={(e) => setFormState({...formState, achievements: e.target.value})}
                />
              </FormField>

              <FormField label="Work Attachment" fullWidth optional>
                <FileUpload 
                  fileName={formState.fileName}
                  onChange={handleFileChange}
                  hint="Attach screenshots, code snippets, logs, or documents (max 10MB)"
                />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowModal(false)} 
            submitText={submitting ? "Saving..." : (editingEntry ? "Update Entry" : "Submit Entry")} 
          />
        </form>
      </EnterpriseModal>

      {/* Custom Delete Confirmation Modal Popup */}
      <EnterpriseModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid #fee2e2'
          }}>
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '18px', fontWeight: '700' }}>
            Delete Work Entry?
          </h3>
          <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
            Are you sure you want to delete this work entry for <strong>{deleteTarget?.project}</strong>? This action cannot be undone.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setDeleteTarget(null)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={confirmDeleteEntry}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} /> Yes, Delete
            </button>
          </div>
        </div>
      </EnterpriseModal>

      {/* Animated Toast Success / Error Message Banner */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5',
          border: toast.type === 'error' ? '1px solid #fecaca' : '1px solid #a7f3d0',
          color: toast.type === 'error' ? '#991b1b' : '#065f46',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toast.type === 'error' ? (
            <AlertTriangle size={20} color="#dc2626" />
          ) : (
            <CheckCircle2 size={20} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* File Preview Modal Popup */}
      <EnterpriseModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>{previewFile?.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {previewFile?.url && (
                <a 
                  href={previewFile.url} 
                  download={previewFile.name} 
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Download
                </a>
              )}
              <button 
                onClick={() => setPreviewFile(null)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {previewFile?.url?.startsWith('data:image') || previewFile?.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <img 
                src={previewFile.url} 
                alt={previewFile.name} 
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
            ) : (
              <div style={{ padding: '40px', color: '#64748b' }}>
                <FileIcon size={56} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '15px', margin: '0 0 12px', fontWeight: '500' }}>Document Preview</p>
                <p style={{ fontSize: '13px', margin: '0 0 16px', color: '#94a3b8' }}>Click download below to open this attachment in your application.</p>
                {previewFile?.url && (
                  <a href={previewFile.url} download={previewFile.name} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'underline' }}>
                    Download {previewFile.name}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default Worksheet;
