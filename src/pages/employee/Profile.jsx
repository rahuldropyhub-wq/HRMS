import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, User, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  Ticket, PackageOpen, Edit2, Eye, Download, Upload, RotateCcw,
  Briefcase, Phone, Mail, MapPin, CreditCard, FileText as FilePdf,
  Image as FileImage, Shield, Smartphone, Monitor, Clock, CheckCircle2,
  AlertTriangle, History, Link as LinkIcon, Building2, UserCheck, ShieldCheck, Map, Camera
} from 'lucide-react';
import DashboardLayout from '../../components/employee/DashboardLayout';
import { EnterpriseModal, FormHeader, FormBody, FormSection, FormField, TextInput, FormFooter, SelectInput, DateInput } from '../../components/employee/EnterpriseForm';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/profile.css';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/employeeService';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
  { id: 'company', label: 'Company Info', icon: <Briefcase size={16} /> },
  { id: 'bank', label: 'Bank & Statutory', icon: <CreditCard size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FilePdf size={16} /> },
  { id: 'skills', label: 'Skills & Certs', icon: <CheckCircle2 size={16} /> },
  { id: 'emergency', label: 'Emergency Contacts', icon: <Phone size={16} /> }
];

const DOCUMENTS = [
  { id: 1, name: 'Offer_Letter.pdf', size: '1.2 MB', type: 'pdf', verified: true },
  { id: 2, name: 'Aadhaar_Card.pdf', size: '2.4 MB', type: 'pdf', verified: true },
  { id: 3, name: 'PAN_Card.jpg', size: '840 KB', type: 'img', verified: true },
  { id: 4, name: 'Resume_2026.pdf', size: '4.1 MB', type: 'pdf', verified: false }
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');

  // Edit Modal State
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setProfile(prev => ({ ...prev, avatar_url: base64Url, avatarUrl: base64Url }));
      await updateProfile(user.id, { avatar_url: base64Url });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setProfile(prev => ({ ...prev, cover_url: base64Url, coverUrl: base64Url }));
      await updateProfile(user.id, { cover_url: base64Url });
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
      alert(error.message || 'Error updating profile');
    } else {
      setProfile(prev => ({ ...prev, ...data, skills: skillsArray, emergency: emergencyArray }));
      setShowEditModal(false);
    }
    setIsSaving(false);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fullName = ((profile?.first_name || profile?.firstName || '') + ' ' + (profile?.last_name || profile?.lastName || '')).trim() || 'Employee';
  const empCode = profile?.emp_id || profile?.empId || 'DROPY-001';
  const designation = profile?.designations?.title || profile?.designation || 'Software Engineer';
  const department = profile?.departments?.name || profile?.department || 'Engineering';

  return (
    <DashboardLayout>
      <div className="profile-page-wrapper">
        
        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading employee details...</p>
          </div>
        ) : (
          <>
            {/* ── 1. Enterprise Hero Header Card ── */}
            <div className="profile-hero-card">
              <div 
                className="profile-hero-banner"
                style={profile?.cover_url || profile?.coverUrl ? { backgroundImage: `url(${profile.cover_url || profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <label className="hero-cover-btn">
                  <Camera size={14} /> Change Cover
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                </label>
                <div className="hero-banner-badges">
                  <span className="hero-id-badge">ID: {empCode}</span>
                  <span className="hero-status-badge">{profile?.status || 'ACTIVE'}</span>
                </div>
              </div>

              <div className="profile-hero-body">
                <div className="profile-avatar-row">
                  <div className="hero-avatar-wrapper">
                    <div className="hero-avatar-circle" style={{ overflow: 'hidden' }}>
                      {profile?.avatar_url || profile?.avatarUrl ? (
                        <img src={profile.avatar_url || profile.avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          {(profile?.first_name || profile?.firstName || 'E').charAt(0)}
                          {(profile?.last_name || profile?.lastName || '').charAt(0)}
                        </>
                      )}
                    </div>
                    <label className="hero-avatar-camera-btn" title="Change Avatar">
                      <Camera size={16} />
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <button className="hero-edit-btn" onClick={handleEditClick}>
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </div>

                <div className="profile-main-info">
                  <h2>{fullName}</h2>
                  <div className="profile-sub-title">
                    <span className="profile-sub-item"><Briefcase size={15} /> {designation}</span>
                    <span className="dot-separator"></span>
                    <span className="profile-sub-item"><Building2 size={15} /> {department}</span>
                    <span className="dot-separator"></span>
                    <span className="profile-sub-item"><Mail size={15} /> {profile?.email || profile?.officialEmail}</span>
                    <span className="dot-separator"></span>
                    <span className="profile-sub-item"><Phone size={15} /> {profile?.phone || 'N/A'}</span>
                  </div>
                </div>

                {/* Quick Metrics Ribbon */}
                <div className="hero-stats-ribbon">
                  <div className="stat-tile">
                    <div className="stat-icon-bg"><UserCheck size={20} /></div>
                    <div className="stat-content">
                      <span className="stat-label">Reporting Manager</span>
                      <span className="stat-value">{profile?.manager || 'Jayanth Choda'}</span>
                    </div>
                  </div>

                  <div className="stat-tile">
                    <div className="stat-icon-bg" style={{ background: '#fef3c7', color: '#d97706' }}><Calendar size={20} /></div>
                    <div className="stat-content">
                      <span className="stat-label">Leave Balance</span>
                      <span className="stat-value">{profile?.leave_balance || 24} Days</span>
                    </div>
                  </div>

                  <div className="stat-tile">
                    <div className="stat-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}><MapPin size={20} /></div>
                    <div className="stat-content">
                      <span className="stat-label">Work Location</span>
                      <span className="stat-value">{profile?.work_location || 'Hyderabad'}</span>
                    </div>
                  </div>

                  <div className="stat-tile">
                    <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}><Clock size={20} /></div>
                    <div className="stat-content">
                      <span className="stat-label">Shift</span>
                      <span className="stat-value">{profile?.shift || 'General'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Horizontal Sticky Tab Bar ── */}
            <div className="profile-tabs-bar">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  className={`prof-tab-btn ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* ── 3. Content Sections Container ── */}
            <div className="profile-sections-container">
              
              {/* Section 1: Personal Information */}
              <div id="personal" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon"><User size={20} /></div>
                    Personal Information
                  </div>
                  <button className="hero-edit-btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleEditClick}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div className="prof-grid-layout">
                  <div className="prof-grid-item"><span className="item-label">Employee ID</span><span className="item-value">{empCode}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Full Name</span><span className="item-value">{fullName}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Gender</span><span className="item-value">{profile?.gender || 'Male'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Date of Birth</span><span className="item-value">{profile?.dob || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Blood Group</span><span className="item-value">{profile?.blood_group || profile?.bloodGroup || 'B+'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Phone Number</span><span className="item-value">{profile?.phone || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Official Email</span><span className="item-value">{profile?.email || profile?.officialEmail || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Personal Email</span><span className="item-value">{profile?.personal_email || profile?.personalEmail || 'N/A'}</span></div>
                  <div className="prof-grid-item full-width"><span className="item-label">Current Address</span><span className="item-value">{profile?.address || profile?.currentAddress || 'N/A'}</span></div>
                </div>
              </div>

              {/* Section 2: Company Information */}
              <div id="company" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Briefcase size={20} /></div>
                    Company Information
                  </div>
                </div>
                <div className="prof-grid-layout">
                  <div className="prof-grid-item"><span className="item-label">Department</span><span className="item-value">{department}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Designation</span><span className="item-value">{designation}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Reporting Manager</span><span className="item-value">{profile?.manager || 'Jayanth Choda'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Employment Type</span><span className="item-value">{profile?.employment_type || 'Full Time'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Work Location</span><span className="item-value">{profile?.work_location || 'Hyderabad'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Shift Timing</span><span className="item-value">{profile?.shift || 'General (9:30 AM - 6:30 PM)'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Leave Balance</span><span className="item-value">{profile?.leave_balance || 24} Days</span></div>
                  <div className="prof-grid-item"><span className="item-label">Employee Status</span><span className="item-value" style={{ color: '#16a34a' }}>{profile?.status || 'Active'}</span></div>
                </div>
              </div>

              {/* Section 3: Bank Details */}
              <div id="bank" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon" style={{ background: '#fef3c7', color: '#d97706' }}><CreditCard size={20} /></div>
                    Bank & Statutory Details
                  </div>
                  <button className="hero-edit-btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleEditClick}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div className="prof-grid-layout">
                  <div className="prof-grid-item"><span className="item-label">Bank Name</span><span className="item-value">{profile?.bank_name || profile?.bankName || 'HDFC Bank'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Account Number</span><span className="item-value">{profile?.account_number || profile?.accountNumber || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">IFSC Code</span><span className="item-value">{profile?.ifsc_code || profile?.ifscCode || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Account Holder</span><span className="item-value">{profile?.account_holder || profile?.accountHolder || fullName}</span></div>
                  <div className="prof-grid-item"><span className="item-label">PAN Number</span><span className="item-value">{profile?.pan_number || profile?.panNumber || 'N/A'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Aadhar Number</span><span className="item-value">{profile?.aadhar_number || profile?.aadharNumber || 'N/A'}</span></div>
                </div>
              </div>

              {/* Section 4: Documents */}
              <div id="documents" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon" style={{ background: '#fce7f3', color: '#db2777' }}><FilePdf size={20} /></div>
                    Document Center ({profile?.documents?.length || DOCUMENTS.length})
                  </div>
                </div>
                <div className="prof-docs-grid">
                  {profile?.documents && profile.documents.length > 0 ? (
                    profile.documents.map((doc, idx) => (
                      <div className="prof-doc-card-new" key={idx}>
                        <div className="doc-icon-box"><FilePdf size={22} /></div>
                        <div className="doc-details">
                          <span className="doc-name">{doc.type || doc.name}</span>
                          <span className="doc-sub">{doc.name} • <strong style={{ color: '#16a34a' }}>Uploaded</strong></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    DOCUMENTS.map(doc => (
                      <div className="prof-doc-card-new" key={doc.id}>
                        <div className="doc-icon-box"><FilePdf size={22} /></div>
                        <div className="doc-details">
                          <span className="doc-name">{doc.name}</span>
                          <span className="doc-sub">{doc.size} • <strong style={{ color: doc.verified ? '#16a34a' : '#d97706' }}>{doc.verified ? 'Verified' : 'Pending'}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Section 5: Skills & Certifications */}
              <div id="skills" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle2 size={20} /></div>
                    Skills & Certifications
                  </div>
                  <button className="hero-edit-btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleEditClick}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div className="prof-grid-layout">
                  <div className="prof-grid-item full-width">
                    <span className="item-label" style={{ marginBottom: 10, display: 'block' }}>Primary Skills</span>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {profile?.skills && profile.skills.length > 0 ? (
                        (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((sk, i) => (
                          <span key={i} style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{sk.trim()}</span>
                        ))
                      ) : (
                        ['React.js', 'JavaScript (ES6+)', 'Node.js', 'CSS/SASS', 'Git & GitHub'].map((sk, i) => (
                          <span key={i} style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{sk}</span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="prof-grid-item"><span className="item-label">Total Experience</span><span className="item-value">{profile?.experience || '3+ Years'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Certifications</span><span className="item-value">{profile?.certifications || 'AWS Certified Developer'}</span></div>
                  <div className="prof-grid-item"><span className="item-label">Languages Known</span><span className="item-value">{profile?.languages || 'English, Telugu, Hindi'}</span></div>
                </div>
              </div>

              {/* Section 6: Emergency Contacts */}
              <div id="emergency" className="prof-card-section">
                <div className="prof-card-header">
                  <div className="prof-card-title">
                    <div className="prof-title-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Phone size={20} /></div>
                    Emergency Contacts
                  </div>
                  <button className="hero-edit-btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={handleEditClick}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <table className="prof-emergency-table">
                  <thead>
                    <tr>
                      <th>Contact Name</th>
                      <th>Relationship</th>
                      <th>Phone Number</th>
                      <th>Residential Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile?.emergency && profile.emergency.length > 0 ? (
                      profile.emergency.map((c, i) => (
                        <tr key={i}>
                          <td>{c.name}</td>
                          <td>{c.relation || c.relationship}</td>
                          <td>{c.phone}</td>
                          <td>{c.address || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>Lakshmi Kumar</td>
                        <td>Mother</td>
                        <td>+91 98765 11111</td>
                        <td>Hyderabad, Telangana</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        )}
      </div>

      {showEditModal && (
        <EnterpriseModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <FormHeader title="Edit Profile Information" subtitle="Update your personal, bank, skills, and emergency contact details." />
          <FormBody>
            
            {/* 1. Contact & Personal Info */}
            <FormSection title="1. Personal & Contact Info">
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
              <div style={{ marginTop: 16 }}>
                <FormField label="Current Address">
                  <TextInput 
                    icon={<MapPin size={16} />} 
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* 2. Bank & Statutory Details */}
            <FormSection title="2. Bank & Statutory Details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Bank Name">
                  <TextInput 
                    value={editForm.bank_name}
                    onChange={(e) => setEditForm({...editForm, bank_name: e.target.value})}
                  />
                </FormField>
                <FormField label="Account Number">
                  <TextInput 
                    value={editForm.account_number}
                    onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                  />
                </FormField>
                <FormField label="IFSC Code">
                  <TextInput 
                    value={editForm.ifsc_code}
                    onChange={(e) => setEditForm({...editForm, ifsc_code: e.target.value})}
                  />
                </FormField>
                <FormField label="Account Holder Name">
                  <TextInput 
                    value={editForm.account_holder}
                    onChange={(e) => setEditForm({...editForm, account_holder: e.target.value})}
                  />
                </FormField>
                <FormField label="PAN Number">
                  <TextInput 
                    value={editForm.pan_number}
                    onChange={(e) => setEditForm({...editForm, pan_number: e.target.value})}
                  />
                </FormField>
                <FormField label="Aadhar Number">
                  <TextInput 
                    value={editForm.aadhar_number}
                    onChange={(e) => setEditForm({...editForm, aadhar_number: e.target.value})}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* 3. Skills & Experience */}
            <FormSection title="3. Skills & Experience">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField label="Primary Skills (comma separated)">
                    <TextInput 
                      value={editForm.skills}
                      placeholder="e.g. React.js, Node.js, TypeScript"
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

            {/* 4. Emergency Contacts */}
            <FormSection title="4. Emergency Contact">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Contact Name">
                  <TextInput 
                    value={editForm.emergencyName}
                    onChange={(e) => setEditForm({...editForm, emergencyName: e.target.value})}
                  />
                </FormField>
                <FormField label="Relationship">
                  <TextInput 
                    value={editForm.emergencyRelation}
                    onChange={(e) => setEditForm({...editForm, emergencyRelation: e.target.value})}
                  />
                </FormField>
                <FormField label="Phone Number">
                  <TextInput 
                    icon={<Phone size={16} />}
                    value={editForm.emergencyPhone}
                    onChange={(e) => setEditForm({...editForm, emergencyPhone: e.target.value})}
                  />
                </FormField>
                <FormField label="Address">
                  <TextInput 
                    icon={<MapPin size={16} />}
                    value={editForm.emergencyAddress}
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
            saveLabel="Save Changes"
          />
        </EnterpriseModal>
      )}
    </DashboardLayout>
  );
}
