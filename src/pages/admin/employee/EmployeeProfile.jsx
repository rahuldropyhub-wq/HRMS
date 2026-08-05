import React, { useState } from 'react';
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

const TABS = ['Personal', 'Company', 'Bank', 'Emergency', 'Documents', 'Skills', 'Activity Log'];

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  
  // In a real app we would fetch based on id, here we just use the mock
  const emp = EMPLOYEE_DATA;
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;

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
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit size={16} /> Edit Profile
          </button>
          <button className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserX size={16} /> Deactivate
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="docs-grid">
            {emp.documents.map((doc, idx) => (
              <div key={idx} className="doc-card">
                <FileText size={32} className="doc-icon" />
                <div>
                  <div className="doc-name">{doc.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Uploaded: {doc.date}</div>
                </div>
                <div className="doc-actions">
                  <button><Eye size={16} color="#4b5563" /></button>
                  <button><Download size={16} color="#4b5563" /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {emp.skills.map((skill, idx) => (
              <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: '500' }}>
                {skill}
              </span>
            ))}
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
