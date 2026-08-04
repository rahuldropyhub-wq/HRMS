import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  User,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  Lock,
  Shield,
  Palette,
  Globe,
  ShieldCheck,
  Monitor,
  Edit2,
  Camera,
  Eye,
  ListTodo,
  Ticket,
  PackageOpen
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/settings.css';

function Settings() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toggle states
  const [leaveUpdates, setLeaveUpdates] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [worksheetReminders, setWorksheetReminders] = useState(true);
  const [systemAnnouncements, setSystemAnnouncements] = useState(true);
  const [birthdays, setBirthdays] = useState(false);
  const [promotions, setPromotions] = useState(false);

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
            <li>
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
            <li className="active">
              <Link to="/settings" className="nav-item-content"><SettingsIcon size={18} /> Settings</Link>
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
                      <SettingsIcon size={16} /> Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="settings-content">
          <div className="page-header-row">
            <div className="page-title-box">
              <h1>Settings</h1>
              <p className="breadcrumb">Dashboard &gt; Settings</p>
            </div>
          </div>

          <div className="settings-layout">
            {/* Settings Left Navigation */}
            <div className="settings-nav">
              <ul>
                <li className="active">
                  <div className="settings-nav-item"><User size={18} /> Profile Information</div>
                </li>
              </ul>
            </div>

            {/* Settings Main Content Area */}
            <div className="settings-main">
              {/* Profile Information Card */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h3>Profile Information</h3>
                    <p>View and update your personal details</p>
                  </div>
                  <button className="btn-outline">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>

                <div className="profile-photo-section">
                  <p className="field-label">Profile Photo</p>
                  <div className="profile-photo-upload">
                    <div className="photo-preview">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Profile" />
                      <button className="camera-btn">
                        <Camera size={14} />
                      </button>
                    </div>
                    <p className="photo-help-text">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue="Balaji Kumar" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue="balaji.kumar@dropyhub.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" defaultValue="+91 9030545655" />
                  </div>
                  <div className="form-group">
                    <label>Date of Joining</label>
                    <div className="input-with-icon">
                      <Calendar size={16} className="input-icon" />
                      <input type="text" defaultValue="01 Jan 2025" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
