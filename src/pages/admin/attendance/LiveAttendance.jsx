import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Briefcase, MapPin, Monitor } from 'lucide-react';
import '../../../styles/admin/attendance/live-attendance.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';

// Mock Data
const MOCK_LIVE = [];

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
