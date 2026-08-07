import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Calendar, Briefcase, 
  UserCircle, Edit, UserX, Download, Eye, FileText
} from 'lucide-react';
import '../../../styles/admin/employee/employee-profile.css';

// Using mock data for single employee
const EMPLOYEE_DATA = {
  id: 'EMP-001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@dropyhub.com',
  personalEmail: 'rahul.s89@gmail.com',
  phone: '+91 98765 43210',
  department: 'Engineering',
  designation: 'Sr. Frontend Developer',
  joinDate: '15 Mar 2023',
  dob: '24 Aug 1990',
  gender: 'Male',
  bloodGroup: 'O+',
  maritalStatus: 'Single',
  address: 'Flat 402, Sunshine Apartments, Indiranagar',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560038',
  manager: 'Priya Desai',
  employmentType: 'Full-time',
  workLocation: 'Bangalore HQ',
  shift: 'Morning (9 AM - 6 PM)',
  bankName: 'HDFC Bank',
  accountNumber: 'XXXXX1234',
  ifscCode: 'HDFC0001234',
  panNumber: 'ABCDE1234F',
  aadharNumber: 'XXXX-XXXX-8901',
  leaveBalance: 12,
  activeTasks: 3,
  attendanceScore: '98.5%',
  assetsAllocated: 2,
  skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'Framer Motion'],
  emergency: [
    { name: 'Anil Sharma', relation: 'Father', phone: '+91 98765 11111' },
    { name: 'Sneha Sharma', relation: 'Sister', phone: '+91 98765 22222' }
  ],
  documents: [
    { name: 'Aadhar Card', type: 'PDF', date: '15 Mar 2023' },
    { name: 'PAN Card', type: 'JPG', date: '15 Mar 2023' },
    { name: 'Resume', type: 'PDF', date: '12 Mar 2023' },
    { name: 'Offer Letter', type: 'PDF', date: '14 Mar 2023' }
  ],
  activity: [
    { title: 'Task "Update Dashboard UI" completed', time: 'Today, 10:30 AM' },
    { title: 'Leave request approved by Priya Desai', time: 'Yesterday, 2:15 PM' },
    { title: 'Profile details updated', time: '12 Aug 2026, 4:00 PM' },
    { title: 'Allocated new MacBook Pro', time: '01 Jun 2026, 11:00 AM' }
  ]
};

import { getEmployeeById, updateEmployee } from '../../../services/adminService';

const TABS = ['Personal', 'Company', 'Bank', 'Emergency', 'Documents', 'Activity Log'];

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = (doc) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (doc) => {
    try {
      const base64Data = doc.url;
      const base64Parts = base64Data.split(',');
      if (base64Parts.length < 2) return;
      const mimeString = base64Parts[0].split(':')[1].split(';')[0];
      const byteString = atob(base64Parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error("Error displaying document:", e);
      alert("Unable to open document. It may be corrupted.");
    }
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      const { data, error } = await getEmployeeById(id);
      if (data) {
        setEmp(data);
      } else {
        console.error("Failed to load employee:", error);
      }
      setLoading(false);
    };
    fetchEmployee();
  }, [id]);

  const handleToggleStatus = async () => {
    const isCurrentlyInactive = emp.status === 'Inactive';
    const newStatus = isCurrentlyInactive ? (emp.raw_data?.status || 'Active') : 'Inactive';
    if(window.confirm(`Are you sure you want to ${isCurrentlyInactive ? 'activate' : 'deactivate'} this employee?`)) {
       const { error } = await updateEmployee(id, { status: newStatus });
       if (!error) {
         setEmp(prev => ({ ...prev, status: newStatus }));
       } else {
         alert('Failed to update status');
       }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (!emp) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Employee not found</h2>
        <button className="btn-secondary" onClick={() => navigate('/admin/employees')}>Back to Directory</button>
      </div>
    );
  }

  const getInitials = (first, last) => {
    const f = first ? String(first).trim() : '';
    const l = last ? String(last).trim() : '';
    return `${f ? f[0] : ''}${l ? l[0] : ''}`.toUpperCase() || '?';
  };
  const initials = getInitials(emp.firstName, emp.lastName);

  return (
    <motion.div 
      className="employee-profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-info-main">
          <div className="profile-avatar-large">
            {initials}
          </div>
          <div className="profile-details">
            <h1>{emp.firstName} {emp.lastName}</h1>
            <p className="profile-designation">{emp.designation}</p>
            <div className="profile-meta">
              <div className="meta-item"><Briefcase size={16} /> {emp.department} | {emp.id}</div>
              <div className="meta-item"><Mail size={16} /> {emp.email}</div>
              <div className="meta-item"><Phone size={16} /> {emp.phone}</div>
              <div className="meta-item"><Calendar size={16} /> Joined: {emp.joinDate}</div>
            </div>
            
            {/* Stats Row within header */}
            <div className="profile-stats">
              <div className="profile-stat-box">
                <div className="stat-box-label">Leave Bal</div>
                <div className="stat-box-value">{emp.leaveBalance}</div>
              </div>
              <div className="profile-stat-box">
                <div className="stat-box-label">Active Tasks</div>
                <div className="stat-box-value">{emp.activeTasks}</div>
              </div>
              <div className="profile-stat-box">
                <div className="stat-box-label">Attendance</div>
                <div className="stat-box-value">{emp.attendanceScore}</div>
              </div>
              <div className="profile-stat-box">
                <div className="stat-box-label">Assets</div>
                <div className="stat-box-value">{emp.assetsAllocated}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate(`/admin/employees/edit/${emp.id}`)}
          >
            <Edit size={16} /> Edit Profile
          </button>
          <button 
            className={emp.status === 'Inactive' ? "btn-secondary" : "btn-danger"}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: emp.status === 'Inactive' ? '#10b981' : undefined, color: emp.status === 'Inactive' ? 'white' : undefined }}
            onClick={handleToggleStatus}
          >
            <UserX size={16} /> {emp.status === 'Inactive' ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="tab-content-card">
        {activeTab === 'Personal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-grid">
            <div className="info-group">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{emp.dob}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Gender</span>
              <span className="info-value">{emp.gender}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Blood Group</span>
              <span className="info-value">{emp.bloodGroup}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Marital Status</span>
              <span className="info-value">{emp.maritalStatus}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Personal Email</span>
              <span className="info-value">{emp.personalEmail}</span>
            </div>
            <div className="info-group" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Address</span>
              <span className="info-value">{emp.address}, {emp.city}, {emp.state} - {emp.pincode}</span>
            </div>
          </motion.div>
        )}

        {activeTab === 'Company' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-grid">
            <div className="info-group">
              <span className="info-label">Employee ID</span>
              <span className="info-value">{emp.id}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Department</span>
              <span className="info-value">{emp.department}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Designation</span>
              <span className="info-value">{emp.designation}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Reporting Manager</span>
              <span className="info-value">{emp.manager}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Employment Type</span>
              <span className="info-value">{emp.employmentType}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Work Location</span>
              <span className="info-value">{emp.workLocation}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Shift</span>
              <span className="info-value">{emp.shift}</span>
            </div>
          </motion.div>
        )}

        {activeTab === 'Bank' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-grid">
            <div className="info-group">
              <span className="info-label">Bank Name</span>
              <span className="info-value">{emp.bankName}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Account Number</span>
              <span className="info-value">{emp.accountNumber}</span>
            </div>
            <div className="info-group">
              <span className="info-label">IFSC Code</span>
              <span className="info-value">{emp.ifscCode}</span>
            </div>
            <div className="info-group">
              <span className="info-label">PAN Number</span>
              <span className="info-value">{emp.panNumber}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Aadhar Number</span>
              <span className="info-value">{emp.aadharNumber}</span>
            </div>
          </motion.div>
        )}

        {activeTab === 'Emergency' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-grid">
            {emp.emergency.map((contact, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{contact.name}</h4>
                <div className="info-group" style={{ marginBottom: '8px' }}>
                  <span className="info-label">Relationship</span>
                  <span className="info-value">{contact.relation}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{contact.phone}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Documents' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {emp.documents && emp.documents.length > 0 ? (
              <div className="docs-grid">
                {emp.documents.map((doc, idx) => (
                  <div key={idx} className="doc-card">
                    <FileText size={32} className="doc-icon" />
                    <div>
                      <div className="doc-name">{doc.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Uploaded: {doc.uploadDate || 'Unknown'}</div>
                    </div>
                    <div className="doc-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleView(doc)} title="View Document" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Eye size={16} color="#4b5563" /></button>
                      <button onClick={() => handleDownload(doc)} title="Download" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Download size={16} color="#4b5563" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FileText size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#374151', margin: '0 0 8px 0' }}>No Documents Found</h3>
                <p style={{ margin: 0 }}>This employee hasn't uploaded any documents yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Activity Log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timeline">
            {emp.activity.map((log, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">{log.title}</span>
                  <span className="timeline-time">{log.time}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmployeeProfile;
