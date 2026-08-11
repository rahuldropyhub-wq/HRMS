import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Briefcase, MapPin, Monitor } from 'lucide-react';
import '../../../styles/admin/attendance/live-attendance.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllAttendanceToday } from '../../../services/adminService';

// Fallback empty list
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

  const [liveEmployees, setLiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      const { data } = await getAllAttendanceToday();
      if (data) {
        const formatted = data.map(record => ({
          id: record.employee_id,
          firstName: record.profiles?.first_name || 'Unknown',
          lastName: record.profiles?.last_name || '',
          dept: record.profiles?.departments?.name || '-',
          status: record.status || 'Working',
          mode: record.work_mode || 'Office',
          timeIn: new Date(record.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));
        setLiveEmployees(formatted);
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  // Filtering
  const filteredEmployees = liveEmployees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? emp.dept === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    const matchesMode = modeFilter ? emp.mode === modeFilter : true;
    return matchesSearch && matchesDept && matchesStatus && matchesMode;
  });

  // Calculate stats
  const stats = {
    working: liveEmployees.filter(e => e.status === 'Working').length,
    onBreak: liveEmployees.filter(e => e.status === 'On Break').length,
    inMeeting: liveEmployees.filter(e => e.status === 'In Meeting').length,
    notIn: liveEmployees.filter(e => e.status === 'Not In' || e.status === 'Left for Day').length,
    office: liveEmployees.filter(e => e.mode === 'Office').length,
    wfh: liveEmployees.filter(e => e.mode === 'WFH').length,
  };

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
        <div className="stat-pill green">🟢 Working: {stats.working}</div>
        <div className="stat-pill yellow">🟡 On Break: {stats.onBreak}</div>
        <div className="stat-pill blue">🔵 In Meeting: {stats.inMeeting}</div>
        <div className="stat-pill gray">⚪ Not In: {stats.notIn}</div>
        <div className="stat-pill">🏢 Office: {stats.office}</div>
        <div className="stat-pill">🏠 WFH: {stats.wfh}</div>
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
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>Loading live attendance...</div>
      ) : filteredEmployees.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>No employees found.</div>
      ) : (
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
      )}
    </motion.div>
  );
};

export default LiveAttendance;
