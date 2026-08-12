import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, CreditCard, FileText as FilePdf,
  CheckCircle2, Phone, Edit2, Mail, MapPin, Clock,
  Camera, Building2, UserCheck, Calendar, Image as FileImage,
  Award, Shield, Download, Eye, Sparkles, Check, AlertCircle,
  Copy, ExternalLink, Heart, Globe, Lock, FileCheck
} from 'lucide-react';
import DashboardLayout from '../../components/employee/DashboardLayout';
import {
  EnterpriseModal, FormHeader, FormBody, FormSection,
  FormField, TextInput, FormFooter, SelectInput, DateInput
} from '../../components/employee/EnterpriseForm';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/profile.css';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/employeeService';

const SECTIONS = [
  { id: 'all', label: 'All Details', icon: <UserCheck size={16} /> },
  { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
  { id: 'company', label: 'Company Info', icon: <Briefcase size={16} /> },
  { id: 'bank', label: 'Bank & Statutory', icon: <CreditCard size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FilePdf size={16} /> },
  { id: 'skills', label: 'Skills & Certs', icon: <CheckCircle2 size={16} /> },
  { id: 'emergency', label: 'Emergency Contacts', icon: <Phone size={16} /> }
];

const DEFAULT_DOCUMENTS = [
  { id: 1, name: 'Offer_Letter.pdf', type: 'PDF Document', size: '1.2 MB', verified: true, date: '15 Jan 2024' },
  { id: 2, name: 'Aadhaar_Card.pdf', type: 'Govt ID Proof', size: '2.4 MB', verified: true, date: '16 Jan 2024' },
  { id: 3, name: 'PAN_Card.jpg', type: 'Tax Document', size: '840 KB', verified: true, date: '16 Jan 2024' },
  { id: 4, name: 'Degree_Certificate.pdf', type: 'Education Proof', size: '3.5 MB', verified: true, date: '20 Jan 2024' },
  { id: 5, name: 'Resume_2026.pdf', type: 'Curriculum Vitae', size: '1.8 MB', verified: false, date: '10 Feb 2026' }
];

const safeText = (val, fallback = 'N/A') => {
  if (!val) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.full_name || `${val.first_name || ''} ${val.last_name || ''}`.trim() || fallback;
  }
  return fallback;
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfileData = async () => {
      setLoading(true);
      const { data } = await getProfile(user.id);
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfileData();
  }, [user]);

  // Calculate Profile Completion Score
  const calculateCompletionScore = () => {
    if (!profile) return 0;
    const fields = [
      profile?.avatar_url || profile?.avatarUrl,
      profile?.phone,
      profile?.personal_email || profile?.personalEmail,
      profile?.address || profile?.currentAddress,
      profile?.dob,
      profile?.blood_group || profile?.bloodGroup,
      profile?.bank_name || profile?.bankName,
      profile?.account_number || profile?.accountNumber,
      profile?.pan_number || profile?.panNumber,
      profile?.aadhar_number || profile?.aadharNumber,
      profile?.skills && profile.skills.length > 0,
      profile?.emergency && profile.emergency.length > 0
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setProfile(prev => ({ ...prev, avatar_url: base64Url, avatarUrl: base64Url }));
      const { error } = await updateProfile(user.id, { avatar_url: base64Url });
      if (error) {
        showNotification('Failed to update avatar photo.', 'error');
      } else {
        showNotification('Profile avatar updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    const firstEmergency = (profile?.emergency && profile.emergency[0]) || {};
    setEditForm({
      phone: profile?.phone || '',
      personal_email: profile?.personal_email || profile?.personalEmail || '',
      address: profile?.address || profile?.currentAddress || '',
      gender: profile?.gender || '',
      dob: profile?.dob || '',
      blood_group: profile?.blood_group || profile?.bloodGroup || '',
      bank_name: profile?.bank_name || profile?.bankName || '',
      account_number: profile?.account_number || profile?.accountNumber || '',
      ifsc_code: profile?.ifsc_code || profile?.ifscCode || '',
      account_holder: profile?.account_holder || profile?.accountHolder || '',
      pan_number: profile?.pan_number || profile?.panNumber || '',
      aadhar_number: profile?.aadhar_number || profile?.aadharNumber || '',
      skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : profile?.skills || '',
      experience: profile?.experience || '',
      certifications: profile?.certifications || '',
      languages: profile?.languages || '',
      emergencyName: firstEmergency.name || '',
      emergencyRelation: firstEmergency.relation || firstEmergency.relationship || '',
      emergencyPhone: firstEmergency.phone || '',
      emergencyAddress: firstEmergency.address || ''
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);

    const skillsArray = typeof editForm.skills === 'string'
      ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      : editForm.skills;

    const emergencyArray = editForm.emergencyName ? [{
      name: editForm.emergencyName,
      relation: editForm.emergencyRelation,
      phone: editForm.emergencyPhone,
      address: editForm.emergencyAddress
    }] : (profile?.emergency || []);

    const payload = {
      ...editForm,
      skills: skillsArray,
      emergency: emergencyArray
    };

    const { data, error } = await updateProfile(user.id, payload);
    if (error) {
      showNotification(error.message || 'Error updating profile', 'error');
    } else {
      setProfile(prev => ({ ...prev, ...data, skills: skillsArray, emergency: emergencyArray }));
      setShowEditModal(false);
      showNotification('Profile updated successfully!');
    }
    setIsSaving(false);
  };

  const copyToClipboard = (text, label) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    showNotification(`Copied ${label} to clipboard!`);
  };

  const fullName = ((profile?.first_name || profile?.firstName || '') + ' ' + (profile?.last_name || profile?.lastName || '')).trim() || 'Employee';
  const empCode = safeText(profile?.emp_id || profile?.empId, 'DROPY-001');
  const designation = safeText(profile?.designation || profile?.designations, 'Software Engineer');
  const department = safeText(profile?.department || profile?.departments, 'Engineering');
  const managerName = safeText(profile?.manager || profile?.reporting_manager, 'Jayanth Choda');
  const workLocation = safeText(profile?.work_location || profile?.workLocation, 'Hyderabad');
  const shiftName = safeText(profile?.shift, 'General');
  const officialEmail = safeText(profile?.email || profile?.officialEmail, 'N/A');
  const phoneNo = safeText(profile?.phone, 'N/A');
  const completionScore = calculateCompletionScore();

  return (
    <DashboardLayout>
      <div className="profile-page-wrapper">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={`profile-toast-banner ${toastType}`}>
            {toastType === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Clean Page Title Header */}
        <div className="profile-page-header">
          <div>
            <h1 className="profile-page-title">Employee Profile</h1>
            <p className="profile-page-subtitle">Manage your personal information, work details, bank account, documents, and emergency contacts.</p>
          </div>
          <button className="hero-edit-btn" onClick={handleEditClick}>
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        {loading ? (
          <div className="profile-loading-card">
            <div className="profile-spinner"></div>
            <p>Loading profile details...</p>
          </div>
        ) : (
          <>
            {/* ── 1. Clean Profile Overview Summary Card (No Cover Header) ── */}
            <div className="profile-overview-card">
              <div className="overview-top-row">
                <div className="overview-user-block">
                  <div className="hero-avatar-wrapper">
                    <div className="hero-avatar-circle">
                      {profile?.avatar_url || profile?.avatarUrl ? (
                        <img src={profile.avatar_url || profile.avatarUrl} alt={fullName} />
                      ) : (
                        <span className="avatar-initials">
                          {(profile?.first_name || profile?.firstName || 'E').charAt(0)}
                          {(profile?.last_name || profile?.lastName || '').charAt(0)}
                        </span>
                      )}
                    </div>
                    <label className="hero-avatar-camera-btn" title="Change Profile Photo">
                      <Camera size={15} />
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>

                  <div className="overview-user-info">
                    <div className="profile-title-wrapper">
                      <h2>{fullName}</h2>
                      <span className="verified-badge">
                        <Shield size={13} /> Verified
                      </span>
                      <span className="hero-id-badge" onClick={() => copyToClipboard(empCode, 'Employee ID')} title="Click to copy ID">
                        <Copy size={12} /> ID: {empCode}
                      </span>
                    </div>

                    <div className="profile-sub-title">
                      <span className="profile-sub-item"><Briefcase size={14} /> {designation}</span>
                      <span className="dot-separator"></span>
                      <span className="profile-sub-item"><Building2 size={14} /> {department}</span>
                      <span className="dot-separator"></span>
                      <span className="profile-sub-item" onClick={() => copyToClipboard(officialEmail, 'Email')} style={{ cursor: 'pointer' }}>
                        <Mail size={14} /> {officialEmail}
                      </span>
                      <span className="dot-separator"></span>
                      <span className="profile-sub-item"><Phone size={14} /> {phoneNo}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-status-block">
                  <span className="hero-status-badge">
                    <span className="status-dot-pulse"></span>
                    {safeText(profile?.status, 'ACTIVE')}
                  </span>
                </div>
              </div>

              {/* Profile Completion Progress */}
              <div className="profile-completion-box">
                <div className="completion-header">
                  <span className="completion-title">
                    <Sparkles size={14} /> Profile Completion Status
                  </span>
                  <span className="completion-pct">{completionScore}% Complete</span>
                </div>
                <div className="completion-track">
                  <div className="completion-fill" style={{ width: `${completionScore}%` }}></div>
                </div>
              </div>

              {/* Metrics Ribbon */}
              <div className="hero-stats-ribbon">
                <div className="stat-tile">
                  <div className="stat-icon-bg" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                    <UserCheck size={18} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Reporting Manager</span>
                    <span className="stat-value">{managerName}</span>
                  </div>
                </div>

                <div className="stat-tile">
                  <div className="stat-icon-bg" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Calendar size={18} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Leave Balance</span>
                    <span className="stat-value">{profile?.leave_balance || 24} Days</span>
                  </div>
                </div>

                <div className="stat-tile">
                  <div className="stat-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <MapPin size={18} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Work Location</span>
                    <span className="stat-value">{workLocation}</span>
                  </div>
                </div>

                <div className="stat-tile">
                  <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                    <Clock size={18} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Shift Schedule</span>
                    <span className="stat-value">{shiftName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Horizontal Tab Bar ── */}
            <div className="profile-tabs-bar">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  className={`prof-tab-btn ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* ── 3. Content Sections Container ── */}
            <div className="profile-sections-container">
              
              {/* Section 1: Personal Information */}
              {(activeSection === 'all' || activeSection === 'personal') && (
                <div id="personal" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <h3>Personal Information</h3>
                        <p className="card-subtitle">General personal identity and contact info</p>
                      </div>
                    </div>
                    <button className="section-edit-btn" onClick={handleEditClick}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="prof-grid-layout">
                    <div className="prof-grid-item">
                      <span className="item-label">Employee ID</span>
                      <span className="item-value">{empCode}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Full Name</span>
                      <span className="item-value">{fullName}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Gender</span>
                      <span className="item-value">{profile?.gender || 'Male'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Date of Birth</span>
                      <span className="item-value">{profile?.dob || 'N/A'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Blood Group</span>
                      <span className="item-value highlight-pill">{profile?.blood_group || profile?.bloodGroup || 'B+'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Phone Number</span>
                      <span className="item-value">{profile?.phone || 'N/A'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Official Email</span>
                      <span className="item-value">{profile?.email || profile?.officialEmail || 'N/A'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Personal Email</span>
                      <span className="item-value">{profile?.personal_email || profile?.personalEmail || 'N/A'}</span>
                    </div>
                    <div className="prof-grid-item full-width">
                      <span className="item-label">Residential Address</span>
                      <span className="item-value">{profile?.address || profile?.currentAddress || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Company Information */}
              {(activeSection === 'all' || activeSection === 'company') && (
                <div id="company" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3>Company Information</h3>
                        <p className="card-subtitle">Department, role, manager, and workplace structure</p>
                      </div>
                    </div>
                  </div>

                  <div className="prof-grid-layout">
                    <div className="prof-grid-item">
                      <span className="item-label">Department</span>
                      <span className="item-value">{department}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Designation</span>
                      <span className="item-value">{designation}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Reporting Manager</span>
                      <span className="item-value">{managerName}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Employment Type</span>
                      <span className="item-value">{profile?.employment_type || 'Full Time'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Work Location</span>
                      <span className="item-value">{workLocation}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Shift Timing</span>
                      <span className="item-value">{shiftName}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Leave Balance</span>
                      <span className="item-value" style={{ color: '#d97706' }}>{profile?.leave_balance || 24} Days</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Employee Status</span>
                      <span className="item-value status-active-text">
                        <Check size={14} /> {profile?.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Bank & Statutory Details */}
              {(activeSection === 'all' || activeSection === 'bank') && (
                <div id="bank" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3>Bank & Statutory Details</h3>
                        <p className="card-subtitle">Payroll bank account and national tax identity info</p>
                      </div>
                    </div>
                    <button className="section-edit-btn" onClick={handleEditClick}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="prof-grid-layout">
                    <div className="prof-grid-item">
                      <span className="item-label">Bank Name</span>
                      <span className="item-value">{profile?.bank_name || profile?.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">
                        Account Number
                        <button 
                          type="button"
                          className="mask-toggle-btn"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                        >
                          <Eye size={12} /> {showAccountNumber ? 'Hide' : 'Show'}
                        </button>
                      </span>
                      <span className="item-value font-mono">
                        {showAccountNumber
                          ? (profile?.account_number || profile?.accountNumber || '50100239102938')
                          : '•••• •••• ' + (profile?.account_number || profile?.accountNumber || '2938').slice(-4)
                        }
                      </span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">IFSC Code</span>
                      <span className="item-value font-mono">{profile?.ifsc_code || profile?.ifscCode || 'HDFC0001234'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Account Holder</span>
                      <span className="item-value">{profile?.account_holder || profile?.accountHolder || fullName}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">PAN Number</span>
                      <span className="item-value font-mono">{profile?.pan_number || profile?.panNumber || 'ABCDE1234F'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Aadhaar Number</span>
                      <span className="item-value font-mono">{profile?.aadhar_number || profile?.aadharNumber || '1234 5678 9012'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Document Center */}
              {(activeSection === 'all' || activeSection === 'documents') && (
                <div id="documents" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                        <FilePdf size={20} />
                      </div>
                      <div>
                        <h3>Document Center</h3>
                        <p className="card-subtitle">Verified identity, offer letter, and qualification records</p>
                      </div>
                    </div>
                  </div>

                  <div className="prof-docs-grid">
                    {(profile?.documents && profile.documents.length > 0 ? profile.documents : DEFAULT_DOCUMENTS).map((doc, idx) => (
                      <div className="prof-doc-card-new" key={doc.id || idx}>
                        <div className="doc-icon-box">
                          <FilePdf size={22} />
                        </div>
                        <div className="doc-details">
                          <span className="doc-name" title={doc.name}>{doc.name}</span>
                          <span className="doc-type-label">{doc.type || 'Document'}</span>
                          <div className="doc-meta-bar">
                            <span className="doc-size">{doc.size || '1.5 MB'}</span>
                            <span className={`doc-status-badge ${doc.verified !== false ? 'verified' : 'pending'}`}>
                              {doc.verified !== false ? <FileCheck size={12} /> : null}
                              {doc.verified !== false ? 'Verified' : 'Pending Review'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Skills & Certifications */}
              {(activeSection === 'all' || activeSection === 'skills') && (
                <div id="skills" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h3>Skills & Certifications</h3>
                        <p className="card-subtitle">Technical skills, work experience, and domain expertise</p>
                      </div>
                    </div>
                    <button className="section-edit-btn" onClick={handleEditClick}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="prof-grid-layout">
                    <div className="prof-grid-item full-width">
                      <span className="item-label" style={{ marginBottom: 12, display: 'block' }}>Primary Technical Skills</span>
                      <div className="skills-pill-wrapper">
                        {profile?.skills && profile.skills.length > 0 ? (
                          (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((sk, i) => (
                            <span key={i} className="skill-pill-tag">
                              {typeof sk === 'string' ? sk.trim() : sk}
                            </span>
                          ))
                        ) : (
                          ['React.js', 'JavaScript (ES6+)', 'Node.js', 'CSS3/SASS', 'Git & GitHub', 'REST APIs', 'SQL Database'].map((sk, i) => (
                            <span key={i} className="skill-pill-tag">
                              {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Total Work Experience</span>
                      <span className="item-value">{profile?.experience || '3+ Years'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Professional Certifications</span>
                      <span className="item-value">{profile?.certifications || 'AWS Certified Developer'}</span>
                    </div>
                    <div className="prof-grid-item">
                      <span className="item-label">Languages Known</span>
                      <span className="item-value">{profile?.languages || 'English, Telugu, Hindi'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 6: Emergency Contacts */}
              {(activeSection === 'all' || activeSection === 'emergency') && (
                <div id="emergency" className="prof-card-section">
                  <div className="prof-card-header">
                    <div className="prof-card-title">
                      <div className="prof-title-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <h3>Emergency Contacts</h3>
                        <p className="card-subtitle">Primary emergency contacts and relative details</p>
                      </div>
                    </div>
                    <button className="section-edit-btn" onClick={handleEditClick}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="emergency-cards-grid">
                    {profile?.emergency && profile.emergency.length > 0 ? (
                      profile.emergency.map((c, i) => (
                        <div className="emergency-card" key={i}>
                          <div className="emergency-card-avatar">
                            <Heart size={20} />
                          </div>
                          <div className="emergency-card-body">
                            <h4 className="emergency-name">{c.name}</h4>
                            <span className="emergency-relation">{c.relation || c.relationship || 'Relative'}</span>
                            <div className="emergency-contact-info">
                              <a href={`tel:${c.phone}`} className="emergency-phone-link">
                                <Phone size={14} /> {c.phone}
                              </a>
                              <span className="emergency-address">
                                <MapPin size={14} /> {c.address || 'Address N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="emergency-card">
                        <div className="emergency-card-avatar">
                          <Heart size={20} />
                        </div>
                        <div className="emergency-card-body">
                          <h4 className="emergency-name">Lakshmi Kumar</h4>
                          <span className="emergency-relation">Mother</span>
                          <div className="emergency-contact-info">
                            <a href="tel:+919876511111" className="emergency-phone-link">
                              <Phone size={14} /> +91 98765 11111
                            </a>
                            <span className="emergency-address">
                              <MapPin size={14} /> Hyderabad, Telangana
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      {/* ── Enterprise Edit Profile Modal ── */}
      {showEditModal && (
        <EnterpriseModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <FormHeader 
            icon={Edit2}
            title="Edit Employee Profile" 
            subtitle="Update your contact, financial details, skills, and emergency contact information." 
          />
          <FormBody>
            
            {/* Photos Upload */}
            <FormSection title="1. Profile Photo">
              <div className="form-responsive-grid">
                <FormField label="Profile Photo">
                  <label className="form-file-picker">
                    <Camera size={16} /> 
                    <span>{profile?.avatar_url || profile?.avatarUrl ? 'Replace Profile Photo' : 'Upload Profile Photo'}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  </label>
                </FormField>
              </div>
            </FormSection>

            {/* Personal & Contact Details */}
            <FormSection title="2. Personal & Contact Info">
              <div className="form-responsive-grid">
                <FormField label="Phone Number">
                  <TextInput 
                    icon={<Phone size={16} />} 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </FormField>
                <FormField label="Personal Email">
                  <TextInput 
                    icon={<Mail size={16} />} 
                    value={editForm.personal_email}
                    onChange={(e) => setEditForm({...editForm, personal_email: e.target.value})}
                    placeholder="john.doe@gmail.com"
                  />
                </FormField>
                <FormField label="Gender">
                  <SelectInput 
                    value={editForm.gender}
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    options={[
                      {value: '', label: 'Select Gender'},
                      {value: 'Male', label: 'Male'},
                      {value: 'Female', label: 'Female'},
                      {value: 'Other', label: 'Other'}
                    ]}
                  />
                </FormField>
                <FormField label="Blood Group">
                  <TextInput 
                    value={editForm.blood_group}
                    placeholder="e.g. B+, O+"
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
              <div style={{ marginTop: 16 }}>
                <FormField label="Current Address">
                  <TextInput 
                    icon={<MapPin size={16} />} 
                    value={editForm.address}
                    placeholder="Enter street, city, state and pincode"
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Bank Details */}
            <FormSection title="3. Bank & Statutory Details">
              <div className="form-responsive-grid">
                <FormField label="Bank Name">
                  <TextInput 
                    value={editForm.bank_name}
                    placeholder="e.g. HDFC Bank"
                    onChange={(e) => setEditForm({...editForm, bank_name: e.target.value})}
                  />
                </FormField>
                <FormField label="Account Number">
                  <TextInput 
                    value={editForm.account_number}
                    placeholder="Enter Account Number"
                    onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                  />
                </FormField>
                <FormField label="IFSC Code">
                  <TextInput 
                    value={editForm.ifsc_code}
                    placeholder="e.g. HDFC0001234"
                    onChange={(e) => setEditForm({...editForm, ifsc_code: e.target.value})}
                  />
                </FormField>
                <FormField label="Account Holder Name">
                  <TextInput 
                    value={editForm.account_holder}
                    placeholder="Name as per Bank Account"
                    onChange={(e) => setEditForm({...editForm, account_holder: e.target.value})}
                  />
                </FormField>
                <FormField label="PAN Number">
                  <TextInput 
                    value={editForm.pan_number}
                    placeholder="ABCDE1234F"
                    onChange={(e) => setEditForm({...editForm, pan_number: e.target.value})}
                  />
                </FormField>
                <FormField label="Aadhaar Number">
                  <TextInput 
                    value={editForm.aadhar_number}
                    placeholder="1234 5678 9012"
                    onChange={(e) => setEditForm({...editForm, aadhar_number: e.target.value})}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Skills & Experience */}
            <FormSection title="4. Skills & Experience">
              <div className="form-responsive-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField label="Primary Skills (Comma Separated)">
                    <TextInput 
                      value={editForm.skills}
                      placeholder="e.g. React.js, Node.js, JavaScript, TailwindCSS"
                      onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                    />
                  </FormField>
                </div>
                <FormField label="Total Experience">
                  <TextInput 
                    value={editForm.experience}
                    placeholder="e.g. 3+ Years"
                    onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                  />
                </FormField>
                <FormField label="Certifications">
                  <TextInput 
                    value={editForm.certifications}
                    placeholder="e.g. AWS Certified Developer"
                    onChange={(e) => setEditForm({...editForm, certifications: e.target.value})}
                  />
                </FormField>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField label="Languages Known">
                    <TextInput 
                      value={editForm.languages}
                      placeholder="e.g. English, Telugu, Hindi"
                      onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                    />
                  </FormField>
                </div>
              </div>
            </FormSection>

            {/* Emergency Contacts */}
            <FormSection title="5. Emergency Contact">
              <div className="form-responsive-grid">
                <FormField label="Contact Name">
                  <TextInput 
                    value={editForm.emergencyName}
                    placeholder="e.g. Lakshmi Kumar"
                    onChange={(e) => setEditForm({...editForm, emergencyName: e.target.value})}
                  />
                </FormField>
                <FormField label="Relationship">
                  <TextInput 
                    value={editForm.emergencyRelation}
                    placeholder="e.g. Mother / Spouse"
                    onChange={(e) => setEditForm({...editForm, emergencyRelation: e.target.value})}
                  />
                </FormField>
                <FormField label="Phone Number">
                  <TextInput 
                    icon={<Phone size={16} />}
                    value={editForm.emergencyPhone}
                    placeholder="+91 98765 11111"
                    onChange={(e) => setEditForm({...editForm, emergencyPhone: e.target.value})}
                  />
                </FormField>
                <FormField label="Residential Address">
                  <TextInput 
                    icon={<MapPin size={16} />}
                    value={editForm.emergencyAddress}
                    placeholder="City, State"
                    onChange={(e) => setEditForm({...editForm, emergencyAddress: e.target.value})}
                  />
                </FormField>
              </div>
            </FormSection>

          </FormBody>
          <FormFooter 
            onCancel={() => setShowEditModal(false)}
            onSave={handleSave}
            isSaving={isSaving}
            saveLabel="Save Profile Changes"
          />
        </EnterpriseModal>
      )}
    </DashboardLayout>
  );
}
