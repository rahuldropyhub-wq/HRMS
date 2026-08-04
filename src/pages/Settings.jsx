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
import DashboardLayout from '../components/DashboardLayout';
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
    <DashboardLayout>

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
      </DashboardLayout>
  );
}

export default Settings;
