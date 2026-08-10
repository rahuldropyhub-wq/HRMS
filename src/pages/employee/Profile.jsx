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
import DashboardLayout from '../../components/employee/DashboardLayout';
import { EnterpriseModal, FormHeader, FormBody, FormSection, FormField, TextInput, FormFooter, SelectInput, DateInput } from '../../components/employee/EnterpriseForm';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/profile.css';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/employeeService';

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
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Edit Personal Info Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await getProfile(user.id);
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleEditClick = () => {
    setEditForm({
      phone: profile?.phone || '',
      personal_email: profile?.personal_email || '',
      address: profile?.address || '',
      gender: profile?.gender || '',
      dob: profile?.dob || '',
      blood_group: profile?.blood_group || ''
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { data, error } = await updateProfile(user.id, editForm);
    if (error) {
      alert(error.message || 'Error updating profile');
    } else {
      setProfile(data);
      setShowEditModal(false);
    }
    setIsSaving(false);
  };

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
    <DashboardLayout>


        {/* Profile Content */}
        <div className="profile-layout">
          <div className="profile-container">
            
            {/* ── Left Sidebar ── */}
            <div className="profile-sidebar">
              <div className="profile-card">
                <div className="profile-avatar-lg">
                  {profile?.first_name?.charAt(0) || 'U'}
                  {profile?.last_name?.charAt(0) || ''}
                </div>
                <div className="profile-name">{profile?.first_name} {profile?.last_name}</div>
                <div className="profile-role">{profile?.designations?.title || profile?.designation || 'Employee'}</div>
                <div className="profile-badge">{profile?.status || 'Active'}</div>
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

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading profile...</div>
              ) : (
                <>
              {/* 1. Personal Information */}
              <div id="personal" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><User size={18} /> Personal Information</div>
                  <button className="prof-edit-btn" onClick={handleEditClick}><Edit2 size={14} /> Edit</button>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Employee ID</span><span className="prof-value">{profile?.emp_id || profile?.id?.slice(0, 8)}</span></div>
                  <div className="prof-field"><span className="prof-label">Full Name</span><span className="prof-value">{profile?.first_name} {profile?.last_name}</span></div>
                  <div className="prof-field"><span className="prof-label">Gender</span><span className="prof-value">{profile?.gender || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Date of Birth</span><span className="prof-value">{profile?.dob || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Blood Group</span><span className="prof-value">{profile?.blood_group || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Phone</span><span className="prof-value">{profile?.phone || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Official Email</span><span className="prof-value">{profile?.email || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Personal Email</span><span className="prof-value">{profile?.personal_email || '-'}</span></div>
                  <div className="prof-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="prof-label">Current Address</span>
                    <span className="prof-value">{profile?.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Company Information */}
              <div id="company" className="prof-section">
                <div className="prof-section-header">
                  <div className="prof-section-title"><Briefcase size={18} /> Company Information</div>
                </div>
                <div className="prof-info-grid">
                  <div className="prof-field"><span className="prof-label">Department</span><span className="prof-value">{profile?.departments?.name || profile?.department || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Designation</span><span className="prof-value">{profile?.designations?.title || profile?.designation || '-'}</span></div>
                  <div className="prof-field"><span className="prof-label">Employment Type</span><span className="prof-value">{profile?.employment_type || 'Full Time'}</span></div>
                  <div className="prof-field"><span className="prof-label">Office Location</span><span className="prof-value">{profile?.office_location || 'Headquarters'}</span></div>
                  <div className="prof-field"><span className="prof-label">Employee Status</span><span className="prof-value" style={{ color: '#16a34a' }}>{profile?.status || 'Confirmed'}</span></div>
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

                </>
              )}

            </div>
          </div>
        </div>

        {showEditModal && (
          <EnterpriseModal onClose={() => setShowEditModal(false)}>
            <FormHeader title="Edit Personal Information" subtitle="Update your contact details and address." />
            <FormBody>
              <FormSection title="Contact Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label="Phone Number">
                    <TextInput 
                      icon={<Phone size={16} />} 
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </FormField>
                  <FormField label="Personal Email">
                    <TextInput 
                      icon={<Mail size={16} />} 
                      value={editForm.personal_email}
                      onChange={(e) => setEditForm({...editForm, personal_email: e.target.value})}
                    />
                  </FormField>
                  <FormField label="Gender">
                    <SelectInput 
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      options={[
                        {value: '', label: 'Select'},
                        {value: 'Male', label: 'Male'},
                        {value: 'Female', label: 'Female'},
                        {value: 'Other', label: 'Other'}
                      ]}
                    />
                  </FormField>
                  <FormField label="Blood Group">
                    <TextInput 
                      value={editForm.blood_group}
                      onChange={(e) => setEditForm({...editForm, blood_group: e.target.value})}
                    />
                  </FormField>
                  <FormField label="Date of Birth">
                    <DateInput 
                      value={editForm.dob}
                      onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                    />
                  </FormField>
                </div>
              </FormSection>
              
              <FormSection title="Address">
                <FormField label="Current Address">
                  <TextInput 
                    icon={<MapPin size={16} />} 
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                </FormField>
              </FormSection>
            </FormBody>
            <FormFooter 
              onCancel={() => setShowEditModal(false)}
              onSave={handleSave}
              isSaving={isSaving}
              saveLabel="Save Changes"
            />
          </EnterpriseModal>
        )}

    </DashboardLayout>
  );
}
