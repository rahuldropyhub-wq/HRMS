import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, User, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  Ticket, PackageOpen, Edit2, Eye, Download, Upload, RotateCcw,
  Briefcase, Phone, Mail, MapPin, CreditCard, FileText as FilePdf,
  Image as FileImage, Shield, Smartphone, Monitor, Clock, CheckCircle2,
  AlertTriangle, History, Link as LinkIcon
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/profile.css';

const SECTIONS = [
  { id: 'personal', label: 'Personal Information', icon: <User size={16} /> },
  { id: 'company', label: 'Company Information', icon: <Briefcase size={16} /> },
  { id: 'bank', label: 'Bank Details', icon: <CreditCard size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FilePdf size={16} /> },
  { id: 'skills', label: 'Skills & Certs', icon: <CheckCircle2 size={16} /> },
  { id: 'emergency', label: 'Emergency Contacts', icon: <Phone size={16} /> },
  { id: 'history', label: 'Employment History', icon: <History size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings size={16} /> },
  { id: 'activity', label: 'Activity Summary', icon: <LayoutDashboard size={16} /> },
];

const DOCUMENTS = [
  { id: 1, name: 'Offer_Letter.pdf', size: '1.2 MB', type: 'pdf', verified: true },
  { id: 2, name: 'Aadhaar_Card.pdf', size: '2.4 MB', type: 'pdf', verified: true },
  { id: 3, name: 'PAN_Card.jpg', size: '840 KB', type: 'img', verified: true },
  { id: 4, name: 'Resume_2025.pdf', size: '4.1 MB', type: 'pdf', verified: false },
  { id: 5, name: 'Experience_Letter_Prev.pdf', size: '1.5 MB', type: 'pdf', verified: true },
  { id: 6, name: 'Degree_Certificate.pdf', size: '3.2 MB', type: 'pdf', verified: true },
  { id: 7, name: 'Salary_Slip_Jan2025.pdf', size: '1.1 MB', type: 'pdf', verified: true },
];

export default function Profile() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Handle smooth scroll to section
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Intersection Observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">D</div>
          <div className="sidebar-logo-text"><h2>Dropyhub</h2><p>HRMS Portal</p></div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/dashboard" className="nav-item-content"><LayoutDashboard size={18} /> Dashboard</Link></li>
            <li><Link to="/attendance" className="nav-item-content"><CheckSquare size={18} /> Attendance</Link></li>
            <li><Link to="/leave-management" className="nav-item-content"><Calendar size={18} /> Leave Management</Link></li>
            <li><Link to="/worksheet" className="nav-item-content"><FileText size={18} /> Worksheet</Link></li>
            <li><Link to="/tasks" className="nav-item-content"><ListTodo size={18} /> Task Management</Link></li>
            <li><Link to="/tickets" className="nav-item-content"><Ticket size={18} /> Tickets</Link></li>
            <li><Link to="/assets" className="nav-item-content"><PackageOpen size={18} /> Assets</Link></li>
            <li><Link to="/settings" className="nav-item-content"><Settings size={18} /> Settings</Link></li>
            <li className="logout-nav-item">
              <div className="nav-item-content logout-item"><LogOut size={18} /> Logout</div>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="search-bar">
            <Search size={20} color="#9ca3af" style={{ marginLeft: 8 }} />
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn notification"><Bell size={20} /><span className="dot">3</span></button>
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="avatar"></div>
              <div className="user-info"><h4>Balaji Kumar</h4><p>Frontend Developer</p></div>
              <ChevronDown size={16} color="#6b7280" />
              {isProfileOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setIsProfileOpen(false)} />
                  <div className="profile-dropdown">
                    <Link to="/profile" className="profile-dropdown-item"><User size={16} /> My Profile</Link>
                    <Link to="/settings" className="profile-dropdown-item"><Settings size={16} /> Settings</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="profile-layout">
          <div className="profile-container">
            
            {/* ── Left Sidebar ── */}
            <div className="profile-sidebar">
              <div className="profile-card">
                <div className="profile-avatar-lg">BK</div>
                <div className="profile-name">Balaji Kumar</div>
                <div className="profile-role">Frontend Developer</div>
                <div className="profile-badge">Active</div>
              </div>

              <div className="profile-nav">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    className={`profile-nav-item ${activeSection === s.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(s.id)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right Scrolling Content ── */}
            <div className="profile-content-area">

              {/* 1. Personal Information */}
              <div id="personal" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><User size={18} /> Personal Information</div>
                  <button className="prof-edit-btn"><Edit2 size={14} /> Edit</button>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Employee ID</span><span className="prof-value">DH-1042</span></div>
                  <div className="prof-field"><span className="prof-label">Full Name</span><span className="prof-value">Balaji Kumar</span></div>
                  <div className="prof-field"><span className="prof-label">Gender</span><span className="prof-value">Male</span></div>
                  <div className="prof-field"><span className="prof-label">Date of Birth</span><span className="prof-value">14 Aug 1995</span></div>
                  <div className="prof-field"><span className="prof-label">Blood Group</span><span className="prof-value">O+</span></div>
                  <div className="prof-field"><span className="prof-label">Phone</span><span className="prof-value">+91 98765 43210</span></div>
                  <div className="prof-field"><span className="prof-label">Official Email</span><span className="prof-value">balaji.k@dropyhub.com</span></div>
                  <div className="prof-field"><span className="prof-label">Personal Email</span><span className="prof-value">balaji.dev95@gmail.com</span></div>
                  <div className="prof-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="prof-label">Current Address</span>
                    <span className="prof-value">123 Tech Park Road, Block B, Madhapur, Hyderabad, Telangana 500081</span>
                  </div>
                </div>
              </div>

              {/* 2. Company Information */}
              <div id="company" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><Briefcase size={18} /> Company Information</div>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Department</span><span className="prof-value">Engineering</span></div>
                  <div className="prof-field"><span className="prof-label">Designation</span><span className="prof-value">Senior Frontend Developer</span></div>
                  <div className="prof-field"><span className="prof-label">Reporting Manager</span><span className="prof-value">Rajesh Verma (VP Eng)</span></div>
                  <div className="prof-field"><span className="prof-label">Joining Date</span><span className="prof-value">01 Feb 2023</span></div>
                  <div className="prof-field"><span className="prof-label">Employment Type</span><span className="prof-value">Full Time</span></div>
                  <div className="prof-field"><span className="prof-label">Office Location</span><span className="prof-value">Hyderabad HQ</span></div>
                  <div className="prof-field"><span className="prof-label">Employee Status</span><span className="prof-value" style={{ color: '#16a34a' }}>Confirmed</span></div>
                  <div className="prof-field"><span className="prof-label">Shift</span><span className="prof-value">General (9 AM - 6 PM)</span></div>
                </div>
              </div>

              {/* 3. Bank Details */}
              <div id="bank" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><CreditCard size={18} /> Bank Details</div>
                  <button className="prof-edit-btn"><Edit2 size={14} /> Update</button>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Bank Name</span><span className="prof-value">HDFC Bank</span></div>
                  <div className="prof-field"><span className="prof-label">Account Number</span><span className="prof-value masked">XXXX-XXXX-4589</span></div>
                  <div className="prof-field"><span className="prof-label">IFSC Code</span><span className="prof-value">HDFC0001234</span></div>
                  <div className="prof-field"><span className="prof-label">Branch</span><span className="prof-value">Madhapur</span></div>
                  <div className="prof-field"><span className="prof-label">UPI ID</span><span className="prof-value">balaji@hdfc</span></div>
                  <div className="prof-field"><span className="prof-label">PAN Number</span><span className="prof-value masked">ABCDE1234F</span></div>
                </div>
              </div>

              {/* 4. Documents */}
              <div id="documents" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><FilePdf size={18} /> Document Center</div>
                  <button className="prof-edit-btn" style={{ background: '#3b82f6', color: '#fff', border: 'none' }}>
                    <Upload size={14} /> Upload New
                  </button>
                </div>
                <div className="prof-doc-grid">
                  {DOCUMENTS.map(doc => (
                    <div className="prof-doc-card" key={doc.id}>
                      <div className={`prof-doc-icon ${doc.type}`}>
                        {doc.type === 'pdf' ? <FilePdf size={20} /> : <FileImage size={20} />}
                      </div>
                      <div className="prof-doc-info">
                        <div className="prof-doc-name">{doc.name}</div>
                        <div className="prof-doc-meta">
                          {doc.size} • {doc.verified ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Verified</span> : <span style={{ color: '#d97706', fontWeight: 600 }}>Pending</span>}
                        </div>
                        <div className="prof-doc-actions">
                          <button className="prof-doc-btn" title="Preview"><Eye size={13} /></button>
                          <button className="prof-doc-btn" title="Download"><Download size={13} /></button>
                          <button className="prof-doc-btn" title="Replace"><RotateCcw size={13} /></button>
                          <button className="prof-doc-btn" title="History"><History size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Skills */}
              <div id="skills" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><CheckCircle2 size={18} /> Skills & Experience</div>
                  <button className="prof-edit-btn"><Edit2 size={14} /> Edit</button>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <span className="prof-label" style={{ marginBottom: 8, display: 'block' }}>Primary Skills</span>
                  <div className="prof-tags">
                    <span className="prof-tag primary">React.js</span>
                    <span className="prof-tag primary">JavaScript (ES6+)</span>
                    <span className="prof-tag primary">TypeScript</span>
                    <span className="prof-tag primary">CSS/SASS</span>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span className="prof-label" style={{ marginBottom: 8, display: 'block' }}>Secondary Skills</span>
                  <div className="prof-tags">
                    <span className="prof-tag">Node.js</span>
                    <span className="prof-tag">Express</span>
                    <span className="prof-tag">MongoDB</span>
                    <span className="prof-tag">Figma</span>
                  </div>
                </div>
                
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Total Experience</span><span className="prof-value">5 Years 4 Months</span></div>
                  <div className="prof-field"><span className="prof-label">Certifications</span><span className="prof-value">AWS Certified Developer</span></div>
                  <div className="prof-field"><span className="prof-label">Languages</span><span className="prof-value">English, Telugu, Hindi</span></div>
                </div>
              </div>

              {/* 6. Emergency Contacts */}
              <div id="emergency" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><Phone size={18} /> Emergency Contacts</div>
                  <button className="prof-edit-btn"><Edit2 size={14} /> Edit</button>
                </div>
                <table className="prof-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>Phone Number</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Lakshmi Kumar</td>
                      <td>Mother</td>
                      <td>+91 98765 11111</td>
                      <td>Hyderabad, Telangana</td>
                    </tr>
                    <tr>
                      <td>Ramesh Kumar</td>
                      <td>Father</td>
                      <td>+91 98765 22222</td>
                      <td>Hyderabad, Telangana</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 7. Employment History */}
              <div id="history" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><History size={18} /> Employment History</div>
                </div>
                <div className="prof-timeline">
                  <div className="prof-tl-item">
                    <div className="prof-tl-left">
                      <div className="prof-tl-icon active"><Briefcase size={14} /></div>
                      <div className="prof-tl-line"></div>
                    </div>
                    <div className="prof-tl-content">
                      <div className="prof-tl-title">Senior Frontend Developer</div>
                      <div className="prof-tl-dept">Engineering Dept • Dropyhub</div>
                      <div className="prof-tl-date"><Clock size={12} /> Apr 2024 - Present</div>
                    </div>
                  </div>
                  <div className="prof-tl-item">
                    <div className="prof-tl-left">
                      <div className="prof-tl-icon"><Briefcase size={14} /></div>
                    </div>
                    <div className="prof-tl-content">
                      <div className="prof-tl-title">Frontend Developer</div>
                      <div className="prof-tl-dept">Engineering Dept • Dropyhub</div>
                      <div className="prof-tl-date"><Clock size={12} /> Feb 2023 - Mar 2024</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Security */}
              <div id="security" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><Shield size={18} /> Security & Sessions</div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <button className="prof-edit-btn"><Settings size={14} /> Change Password</button>
                  <button className="prof-edit-btn" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                    <CheckCircle2 size={14} /> 2FA Enabled
                  </button>
                </div>
                
                <h4 style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>Active Sessions</h4>
                <table className="prof-table">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Location</th>
                      <th>IP Address</th>
                      <th>Last Active</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Monitor size={14}/> Windows PC (Chrome)</div></td>
                      <td>Hyderabad, IN</td>
                      <td>192.168.1.14</td>
                      <td>Current Session</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Smartphone size={14}/> iPhone 14 Pro (Safari)</div></td>
                      <td>Hyderabad, IN</td>
                      <td>117.220.10.5</td>
                      <td>2 hours ago</td>
                      <td><button className="prof-edit-btn" style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}>Revoke</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 9. Preferences */}
              <div id="preferences" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><Settings size={18} /> Preferences</div>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field">
                    <span className="prof-label">System Language</span>
                    <select style={{ marginTop: 4, padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>
                      <option>English (US)</option>
                    </select>
                  </div>
                  <div className="prof-field">
                    <span className="prof-label">Timezone</span>
                    <select style={{ marginTop: 4, padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>
                      <option>Asia/Kolkata (IST)</option>
                    </select>
                  </div>
                  <div className="prof-field">
                    <span className="prof-label">Theme</span>
                    <select style={{ marginTop: 4, padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>
                      <option>Light Mode</option>
                      <option>Dark Mode</option>
                      <option>System Default</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 10. Activity Summary */}
              <div id="activity" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><LayoutDashboard size={18} /> Activity Summary</div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 150, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Leaves Taken</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>4 / 18</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Assets Assigned</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>3</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Open Tickets</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>1</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                    <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Tasks To Do</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>2</div>
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
