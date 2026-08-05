import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Briefcase, MapPin, Monitor } from 'lucide-react';
import '../../../styles/admin/attendance/live-attendance.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';

// Mock Data
const MOCK_LIVE = [
  { id: 'EMP-001', firstName: 'Rahul', lastName: 'Sharma', dept: 'Engineering', status: 'Working', mode: 'Office', timeIn: '9:02 AM', hours: '4h 15m', task: 'Frontend Dev' },
  { id: 'EMP-002', firstName: 'Priya', lastName: 'Patel', dept: 'Marketing', status: 'On Break', mode: 'WFH', timeIn: '9:15 AM', hours: '3h 45m', task: 'Q3 Planning' },
  { id: 'EMP-003', firstName: 'Amit', lastName: 'Kumar', dept: 'Design', status: 'In Meeting', mode: 'Office', timeIn: '8:45 AM', hours: '4h 30m', task: 'UI Review' },
  { id: 'EMP-004', firstName: 'Neha', lastName: 'Gupta', dept: 'HR', status: 'Working', mode: 'Office', timeIn: '9:30 AM', hours: '3h 45m', task: 'Interviews' },
  { id: 'EMP-005', firstName: 'Vikram', lastName: 'Singh', dept: 'Finance', status: 'Working', mode: 'WFH', timeIn: '9:00 AM', hours: '4h 15m', task: 'Payroll Processing' },
  { id: 'EMP-006', firstName: 'Anjali', lastName: 'Desai', dept: 'Sales', status: 'Not In', mode: 'Office', timeIn: '-', hours: '-', task: '-' },
  { id: 'EMP-007', firstName: 'Rohan', lastName: 'Verma', dept: 'Operations', status: 'Working', mode: 'Office', timeIn: '8:30 AM', hours: '4h 45m', task: 'Logistics Check' },
  { id: 'EMP-008', firstName: 'Pooja', lastName: 'Iyer', dept: 'QA', status: 'Left for Day', mode: 'WFH', timeIn: '8:00 AM', hours: '9h 15m', task: 'Testing done' },
  { id: 'EMP-009', firstName: 'Sanjay', lastName: 'Nair', dept: 'Engineering', status: 'Working', mode: 'Office', timeIn: '9:45 AM', hours: '3h 30m', task: 'API Integration' },
  { id: 'EMP-010', firstName: 'Divya', lastName: 'Reddy', dept: 'Design', status: 'On Break', mode: 'WFH', timeIn: '10:00 AM', hours: '3h 15m', task: 'Coffee break' },
  { id: 'EMP-011', firstName: 'Arjun', lastName: 'Menon', dept: 'Engineering', status: 'Working', mode: 'Office', timeIn: '9:10 AM', hours: '4h 05m', task: 'DevOps Setup' },
  { id: 'EMP-012', firstName: 'Kavita', lastName: 'Joshi', dept: 'HR', status: 'In Meeting', mode: 'WFH', timeIn: '9:25 AM', hours: '3h 50m', task: 'Orientation' },
  { id: 'EMP-013', firstName: 'Mohit', lastName: 'Chauhan', dept: 'Sales', status: 'Working', mode: 'Office', timeIn: '9:05 AM', hours: '4h 10m', task: 'Client Calls' },
  { id: 'EMP-014', firstName: 'Shruti', lastName: 'Hasan', dept: 'Marketing', status: 'Working', mode: 'Office', timeIn: '8:55 AM', hours: '4h 20m', task: 'Content Draft' },
  { id: 'EMP-015', firstName: 'Raj', lastName: 'Malhotra', dept: 'Operations', status: 'Not In', mode: 'WFH', timeIn: '-', hours: '-', task: '-' },
  { id: 'EMP-016', firstName: 'Sneha', lastName: 'Paul', dept: 'Engineering', status: 'Working', mode: 'WFH', timeIn: '9:20 AM', hours: '3h 55m', task: 'Bug fixing' },
  { id: 'EMP-017', firstName: 'Aditya', lastName: 'Roy', dept: 'Finance', status: 'Working', mode: 'Office', timeIn: '9:35 AM', hours: '3h 40m', task: 'Audit Report' },
  { id: 'EMP-018', firstName: 'Manoj', lastName: 'Tiwari', dept: 'QA', status: 'On Break', mode: 'Office', timeIn: '8:40 AM', hours: '4h 35m', task: 'Lunch' },
  { id: 'EMP-019', firstName: 'Ritu', lastName: 'Bhatia', dept: 'Design', status: 'Working', mode: 'WFH', timeIn: '9:15 AM', hours: '4h 00m', task: 'Wireframes' },
  { id: 'EMP-020', firstName: 'Deepak', lastName: 'Kumar', dept: 'Engineering', status: 'In Meeting', mode: 'Office', timeIn: '9:00 AM', hours: '4h 15m', task: 'Sync up' },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Working': return 'status-badge working';
    case 'On Break': return 'status-badge break';
    case 'In Meeting': return 'status-badge meeting';
    case 'Not In':
    case 'Left for Day': return 'status-badge offline';
    default: return 'status-badge';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Working': return '🟢';
    case 'On Break': return '🟡';
    case 'In Meeting': return '🔵';
    case 'Not In':
    case 'Left for Day': return '⚪';
    default: return '⚪';
  }
};

const LiveAttendance = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Filtering
  const filteredEmployees = MOCK_LIVE.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? emp.dept === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    const matchesMode = modeFilter ? emp.mode === modeFilter : true;
    return matchesSearch && matchesDept && matchesStatus && matchesMode;
  });

  return (
    <motion.div 
      className="live-attendance-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Live Attendance</h1>
          <p>Real-time employee status across the organization</p>
        </div>
        <div className="live-indicator">
          <div className="pulsing-dot"></div>
          Live Updates
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-row">
        <div className="stat-pill green">🟢 Working: 14</div>
        <div className="stat-pill yellow">🟡 On Break: 3</div>
        <div className="stat-pill blue">🔵 In Meeting: 3</div>
        <div className="stat-pill gray">⚪ Not In: 2</div>
        <div className="stat-pill">🏢 Office: 13</div>
        <div className="stat-pill">🏠 WFH: 7</div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Design', label: 'Design' },
              { value: 'HR', label: 'HR' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Sales', label: 'Sales' },
              { value: 'QA', label: 'QA' }
            ]}
          />
        </div>
        <div style={{ width: '160px' }}>
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Working', label: 'Working' },
              { value: 'On Break', label: 'On Break' },
              { value: 'In Meeting', label: 'In Meeting' },
              { value: 'Not In', label: 'Not In' }
            ]}
          />
        </div>
        <div style={{ width: '160px' }}>
          <CustomDropdown
            value={modeFilter}
            onChange={setModeFilter}
            options={[
              { value: '', label: 'All Work Modes' },
              { value: 'Office', label: 'Office' },
              { value: 'WFH', label: 'WFH' }
            ]}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="employee-grid">
        {filteredEmployees.map(emp => (
          <div 
            key={emp.id} 
            className="emp-status-card"
            onClick={() => navigate(`/admin/employees/${emp.id}`)}
          >
            <div className="card-header">
              <div className="avatar">
                {emp.firstName[0]}{emp.lastName[0]}
              </div>
              <div className="emp-info">
                <h3>{emp.firstName} {emp.lastName}</h3>
                <p>{emp.dept}</p>
              </div>
            </div>

            <div className="card-badges">
              <div className={getStatusBadgeClass(emp.status)}>
                {getStatusIcon(emp.status)} {emp.status}
              </div>
              <div className="mode-badge">
                {emp.mode === 'Office' ? '🏢' : '🏠'} {emp.mode}
              </div>
            </div>

            <div className="card-stats">
              <div className="card-stat-item">
                <Clock size={14} /> In: {emp.timeIn}
              </div>
              <div className="card-stat-item">
                <Monitor size={14} /> Hrs: {emp.hours}
              </div>
              <div className="card-stat-item">
                <Briefcase size={14} /> Task: {emp.task}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LiveAttendance;
