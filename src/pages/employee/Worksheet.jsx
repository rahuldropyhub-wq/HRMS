import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Loader2
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
  getMyTasks
} from '../../services/employeeService';
import { Edit, Trash2 } from 'lucide-react';

function Worksheet() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, inProgress: 0 });
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
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [wsRes, attRes, taskRes] = await Promise.all([
        getMyWorksheets(user.id),
        getTodayAttendance(user.id),
        getMyTasks(user.id)
      ]);

      if (wsRes.data) {
        setEntries(wsRes.data);
      }
      if (attRes.data) {
        setAttendance(attRes.data);
      }
      if (taskRes.data) {
        const total = taskRes.data.length;
        const completed = taskRes.data.filter(t => (t.status || '').toLowerCase() === 'completed' || (t.status || '').toLowerCase() === 'done').length;
        const inProgress = taskRes.data.filter(t => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'in-progress').length;
        setTaskStats({ total, completed, inProgress });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const openCreateModal = () => {
    setEditingEntry(null);
    setFormState({
      date: new Date().toISOString().split('T')[0],
      project: 'HRMS Portal',
      title: '',
      category: 'Development',
      description: '',
      startTime: '09:00',
      endTime: '17:00',
      hours: '8.0',
      status: 'Completed',
      challenges: '',
      achievements: ''
    });
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormState({
      date: entry.date || new Date().toISOString().split('T')[0],
      project: entry.project || 'HRMS Portal',
      title: entry.title || entry.project || '',
      category: entry.category || 'Development',
      description: entry.description || '',
      startTime: entry.start_time || '09:00',
      endTime: entry.end_time || '17:00',
      hours: entry.hours || '1.0',
      status: entry.work_status || 'Completed',
      challenges: entry.challenges || '',
      achievements: entry.achievements || ''
    });
    setShowModal(true);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formState.project || !formState.description) {
      alert('Please fill in Project Name and Description.');
      return;
    }

    setSubmitting(true);
    const payload = {
      project: formState.project,
      title: formState.title || formState.project,
      category: formState.category,
      description: formState.description,
      start_time: formState.startTime,
      end_time: formState.endTime,
      hours: formState.hours || '1.0',
      work_status: formState.status,
      challenges: formState.challenges,
      achievements: formState.achievements,
      date: formState.date || new Date().toISOString().split('T')[0]
    };

    if (editingEntry) {
      // Update existing entry
      const { data, error } = await updateWorksheet(editingEntry.id, payload);
      if (!error && data) {
        setEntries(entries.map(item => item.id === editingEntry.id ? data : item));
        setShowModal(false);
      } else {
        alert('Error updating worksheet: ' + error?.message);
      }
    } else {
      // Create new entry
      const { data, error } = await submitWorksheet({
        employee_id: user.id,
        ...payload,
        status: 'submitted'
      });
      if (!error && data) {
        setEntries([data, ...entries]);
        setShowModal(false);
      } else {
        alert('Error submitting worksheet: ' + error?.message);
      }
    }
    setSubmitting(false);
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work entry?')) return;
    const { error } = await deleteWorksheet(id);
    if (!error) {
      setEntries(entries.filter(e => e.id !== id));
    } else {
      alert('Error deleting worksheet: ' + error.message);
    }
  };

  // Calculate working hours dynamically
  const grossHours = attendance?.total_hours ? parseFloat(attendance.total_hours) : 0;
  const breakHours = attendance?.total_break_hours ? parseFloat(attendance.total_break_hours) : 0;
  const netHours = Math.max(0, grossHours - breakHours);

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
                <h4>{taskStats.total}</h4>
              </div>
            </div>

            <div className="ws-stat-card">
              <div className="ws-icon completed">
                <CheckCircle2 size={18} />
              </div>
              <div className="ws-stat-info">
                <p>Completed</p>
                <h4>{taskStats.completed}</h4>
              </div>
            </div>

            <div className="ws-stat-card">
              <div className="ws-icon in-progress">
                <Hourglass size={18} />
              </div>
              <div className="ws-stat-info">
                <p>In Progress</p>
                <h4>{taskStats.inProgress}</h4>
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
            entries.map((entry, index) => (
              <div className="work-entry-card" key={entry.id || index}>
                <div className="entry-status-bar"></div>
                <div className="entry-main">
                  <div className="entry-header">
                    <div className="entry-title-group">
                      <h4>{entry.project}</h4>
                      <p className="entry-project">Hours Spent: <span>{entry.hours || '1.0'} hrs</span></p>
                    </div>
                    <div className="entry-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`entry-status ${entry.status === 'approved' ? 'status-completed' : 'status-progress'}`}>
                        {entry.status ? entry.status.toUpperCase() : 'SUBMITTED'}
                      </span>
                      <span className="entry-time">{entry.date}</span>
                      
                      {/* Action Buttons for Edit & Delete */}
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
                        <button 
                          onClick={() => openEditModal(entry)} 
                          title="Edit Entry"
                          style={{
                            background: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)} 
                          title="Delete Entry"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="entry-description">{entry.description}</p>
                </div>
              </div>
            ))
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
                  onChange={(e) => setFormState({...formState, startTime: e.target.value})}
                  required 
                />
              </FormField>
              
              <FormField label="End Time" required>
                <input 
                  type="time" 
                  className="ent-input" 
                  value={formState.endTime} 
                  onChange={(e) => setFormState({...formState, endTime: e.target.value})}
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
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowModal(false)} 
            submitText={submitting ? "Saving..." : (editingEntry ? "Update Entry" : "Submit Entry")} 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default Worksheet;
