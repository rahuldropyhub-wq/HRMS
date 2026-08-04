import React, { useState } from 'react';
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
  X
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
import '../styles/worksheet.css';

const workEntries = [
  {
    id: 1,
    title: 'HRMS Dashboard UI Development',
    project: 'HRMS Portal',
    description: 'Designed and implemented the dashboard UI using React and Tailwind CSS. Created reusable components for cards, charts and tables.',
    status: 'Completed',
    timeRange: '09:00 AM - 10:30 AM',
    attachments: [
      { name: 'dashboard-design.png', size: '1.2 MB', type: 'image' },
      { name: 'dashboard-components.svg', size: '450 KB', type: 'file' }
    ]
  },
  {
    id: 2,
    title: 'Employee Attendance Module',
    project: 'HRMS Portal',
    description: 'Worked on attendance list view, filters and pagination. Integration with mock API in progress.',
    status: 'In Progress',
    timeRange: '11:00 AM - 01:00 PM',
    attachments: [
      { name: 'attendance-flow.pdf', size: '890 KB', type: 'file' }
    ]
  },
  {
    id: 3,
    title: 'Fix Leave Application Bug',
    project: 'HRMS Portal',
    description: 'Fixed validation issue while applying leave for half day. Tested on different devices.',
    status: 'In Progress',
    timeRange: '02:00 PM - 03:30 PM',
    attachments: []
  },
  {
    id: 4,
    title: 'Team Meeting',
    project: 'Internal',
    description: 'Daily standup meeting and task discussion with the team.',
    status: 'Completed',
    timeRange: '03:30 PM - 04:30 PM',
    attachments: []
  }
];

function Worksheet() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [entries, setEntries] = useState(workEntries);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    project: '',
    description: '',
    timeRange: '',
    status: 'In Progress'
  });

  const handleAddEntry = (e) => {
    e.preventDefault();
    const entryObj = {
      id: entries.length + 1,
      ...newEntry,
      attachments: []
    };
    setEntries([entryObj, ...entries]);
    setShowModal(false);
    setNewEntry({ title: '', project: '', description: '', timeRange: '', status: 'In Progress' });
  };

  return (
    <DashboardLayout>

        {/* Page Content */}
        <div className="worksheet-content">
          <div className="page-header-row">
            <div className="page-title-box">
              <h1>Worksheet</h1>
              <p>Track and manage your daily work progress</p>
            </div>
            <div className="worksheet-header-actions">
              <button className="btn-outline">
                <History size={16} /> View History
              </button>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Add Work Entry
              </button>
            </div>
          </div>

          {/* Top Bar / Stats */}
          <div className="worksheet-top-bar">
            <div className="worksheet-date-selector">
              <div>
                <p className="select-date-label">Select Date</p>
                <h4 className="select-date-value">08 May 2025, Thursday</h4>
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
                  <h4>4</h4>
                </div>
              </div>

              <div className="ws-stat-card">
                <div className="ws-icon completed">
                  <CheckCircle2 size={18} />
                </div>
                <div className="ws-stat-info">
                  <p>Completed</p>
                  <h4>2</h4>
                </div>
              </div>

              <div className="ws-stat-card">
                <div className="ws-icon in-progress">
                  <Hourglass size={18} />
                </div>
                <div className="ws-stat-info">
                  <p>In Progress</p>
                  <h4>2</h4>
                </div>
              </div>

              <div className="ws-stat-card">
                <div className="ws-icon hours">
                  <Clock size={18} />
                </div>
                <div className="ws-stat-info">
                  <p>Total Hours</p>
                  <h4>06h 30m</h4>
                </div>
              </div>
            </div>
          </div>

          <h3 className="entries-title">Today's Work Entries</h3>

          {/* Work Entries List */}
          <div className="work-entries-list">
            {entries.map((entry) => (
              <div className={`work-entry-card ${entry.status === 'Completed' ? 'completed-border' : 'progress-border'}`} key={entry.id}>
                <div className="entry-number">{entry.id}</div>
                <div className="entry-content">
                  <div className="entry-header">
                    <div className="entry-title-group">
                      <h4>{entry.title}</h4>
                      <p className="entry-project">Project <span>{entry.project}</span></p>
                    </div>
                    <div className="entry-meta">
                      <span className={`entry-status ${entry.status === 'Completed' ? 'status-completed' : 'status-progress'}`}>
                        {entry.status}
                      </span>
                      <span className="entry-time">{entry.timeRange}</span>
                      <button className="entry-options">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="entry-description">{entry.description}</p>

                  {entry.attachments.length > 0 && (
                    <div className="entry-attachments">
                      <p className="attachments-title">Attachments ({entry.attachments.length})</p>
                      <div className="attachments-list">
                        {entry.attachments.map((file, idx) => (
                          <div className="attachment-chip" key={idx}>
                            {file.type === 'image' ? (
                              <div className="chip-icon image"><ImageIcon size={16} /></div>
                            ) : (
                              <div className="chip-icon file"><FileIcon size={16} /></div>
                            )}
                            <div className="chip-info">
                              <p className="chip-name">{file.name}</p>
                              <p className="chip-size">{file.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Footer */}
          <div className="worksheet-summary-footer">
            <div className="summary-item">
              <p>Total Working Hours</p>
              <h4>06h 30m</h4>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-item">
              <p>Break Time</p>
              <h4>00h 30m</h4>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-item">
              <p>Net Working Hours</p>
              <h4>06h 00m</h4>
            </div>
          </div>
        </div>
      {/* Add Work Entry Enterprise Modal */}
      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FormHeader 
          icon={FileIcon} 
          title="Worksheet Submission" 
          description="Log your daily project hours, achievements, and challenges." 
        />
        
        <form onSubmit={handleAddEntry}>
          <FormBody>
            <FormSection title="Today's Work" description="Specify what you worked on today.">
              <FormField label="Working Date" required>
                <DateInput 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  required
                />
              </FormField>

              <FormField label="Project" required>
                <SelectInput 
                  options={['HRMS Portal', 'E-commerce App', 'Internal Dashboard', 'Client Website']}
                  value={newEntry.project}
                  onChange={(e) => setNewEntry({...newEntry, project: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Task" required>
                <TextInput 
                  placeholder="e.g. Design Dashboard"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Task Category" required>
                <SelectInput 
                  options={['Design', 'Development', 'Testing', 'Meeting', 'Planning']}
                  required
                />
              </FormField>
            </FormSection>

            <FormSection title="Work Summary" description="Describe your progress and any issues faced.">
              <FormField label="Description" required fullWidth>
                <TextArea 
                  placeholder="Detailed description of the work done..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Start Time" required>
                <input type="time" className="ent-input" required />
              </FormField>
              
              <FormField label="End Time" required>
                <input type="time" className="ent-input" required />
              </FormField>

              <FormField label="Hours Worked" required>
                <TextInput placeholder="e.g. 4.5" />
              </FormField>

              <FormField label="Status" required>
                <SelectInput 
                  options={['In Progress', 'Completed', 'On Hold', 'Blocked']}
                  value={newEntry.status}
                  onChange={(e) => setNewEntry({...newEntry, status: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Challenges Faced" fullWidth optional>
                <TextArea placeholder="Any blockers or issues?" />
              </FormField>
              
              <FormField label="Achievements" fullWidth optional>
                <TextArea placeholder="Any milestones reached?" />
              </FormField>
              
              <FormField label="Attachments" fullWidth optional>
                <FileUpload hint="Upload screenshots, code snippets, or logs (Max 5MB)" />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowModal(false)} 
            submitText="Submit Worksheet" 
            saveDraft={true}
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default Worksheet;
