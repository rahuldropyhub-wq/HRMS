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
  PackageOpen
} from 'lucide-react';
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

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">D</div>
          <div className="sidebar-logo-text">
            <h2>Dropyhub</h2>
            <p>HRMS Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard" className="nav-item-content"><LayoutDashboard size={18} /> Dashboard</Link>
            </li>
            <li>
              <Link to="/attendance" className="nav-item-content"><CheckSquare size={18} /> Attendance</Link>
            </li>
            <li>
              <Link to="/leave-management" className="nav-item-content"><Calendar size={18} /> Leave Management</Link>
            </li>
            <li className="active">
              <Link to="/worksheet" className="nav-item-content"><FileText size={18} /> Worksheet</Link>
            </li>
            <li>
              <Link to="/tasks" className="nav-item-content"><ListTodo size={18} /> Task Management</Link>
            </li>
            <li>
              <Link to="/tickets" className="nav-item-content"><Ticket size={18} /> Tickets</Link>
            </li>
            <li>
              <Link to="/assets" className="nav-item-content"><PackageOpen size={18} /> Assets</Link>
            </li>
            <li>
              <Link to="/settings" className="nav-item-content"><Settings size={18} /> Settings</Link>
            </li>

            <li className="logout-nav-item">
              <div className="nav-item-content logout-item"><LogOut size={18} /> Logout</div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="copyright">
            <p>© 2025 Dropyhub HRMS</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="search-bar">
            <Search size={20} color="#9ca3af" style={{ marginLeft: 8 }} />
            <input type="text" placeholder="Search anything..." />
            <button className="search-btn">Search</button>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification">
              <Bell size={20} />
              <span className="dot">3</span>
            </button>
            <button className="icon-btn message">
              <MessageSquare size={20} />
            </button>
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="avatar"></div>
              <div className="user-info">
                <h4>Balaji Kumar</h4>
                <p>Frontend Developer</p>
              </div>
              <ChevronDown size={16} color="#6b7280" />

              {isProfileOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setIsProfileOpen(false)} />
                  <div className="profile-dropdown">
                    <Link to="/profile" className="profile-dropdown-item">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/settings" className="profile-dropdown-item">
                      <Settings size={16} /> Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

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
              <button className="btn-primary">
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
            {workEntries.map((entry) => (
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
      </main>
    </div>
  );
}

export default Worksheet;
