import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, FileText, ChevronDown, ChevronUp, 
  MapPin, Monitor, Globe, Clock, SearchX
} from 'lucide-react';
import '../../../styles/admin/attendance/attendance-history.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';

// Mock Data
const MOCK_HISTORY = [
  { id: 1, empName: 'Rahul Sharma', empId: 'EMP-001', dept: 'Engineering', date: '05 Aug 2026', checkIn: '09:02 AM', checkOut: '-', breakHrs: '0:30', workHrs: '4:15', mode: 'Office', status: 'Present', late: false, early: false, location: 'Bangalore HQ', device: 'MacBook Pro 14"', ip: '192.168.1.45', breaks: [{ start: '01:00 PM', end: '01:30 PM' }] },
  { id: 2, empName: 'Amit Kumar', empId: 'EMP-003', dept: 'Design', date: '05 Aug 2026', checkIn: '-', checkOut: '-', breakHrs: '-', workHrs: '-', mode: '-', status: 'Absent', late: false, early: false, location: '-', device: '-', ip: '-', breaks: [] },
  { id: 3, empName: 'Priya Patel', empId: 'EMP-002', dept: 'Marketing', date: '04 Aug 2026', checkIn: '09:15 AM', checkOut: '06:30 PM', breakHrs: '1:00', workHrs: '8:15', mode: 'WFH', status: 'Present', late: false, early: false, location: 'Mumbai, MH', device: 'Dell XPS 15', ip: '103.21.45.67', breaks: [{ start: '01:00 PM', end: '01:45 PM'}, {start: '04:00 PM', end: '04:15 PM'}] },
  { id: 4, empName: 'Neha Gupta', empId: 'EMP-004', dept: 'HR', date: '04 Aug 2026', checkIn: '09:45 AM', checkOut: '06:00 PM', breakHrs: '1:00', workHrs: '7:15', mode: 'Office', status: 'Present', late: true, early: false, location: 'Bangalore HQ', device: 'Lenovo ThinkPad', ip: '192.168.1.112', breaks: [{ start: '01:30 PM', end: '02:30 PM' }] },
  { id: 5, empName: 'Vikram Singh', empId: 'EMP-005', dept: 'Finance', date: '03 Aug 2026', checkIn: '09:00 AM', checkOut: '02:00 PM', breakHrs: '0:30', workHrs: '4:30', mode: 'Office', status: 'Half Day', late: false, early: true, location: 'Bangalore HQ', device: 'MacBook Air', ip: '192.168.1.77', breaks: [{ start: '01:00 PM', end: '01:30 PM' }] },
  { id: 6, empName: 'Anjali Desai', empId: 'EMP-006', dept: 'Sales', date: '03 Aug 2026', checkIn: '-', checkOut: '-', breakHrs: '-', workHrs: '-', mode: '-', status: 'On Leave', late: false, early: false, location: '-', device: '-', ip: '-', breaks: [] },
  { id: 7, empName: 'Rahul Sharma', empId: 'EMP-001', dept: 'Engineering', date: '04 Aug 2026', checkIn: '08:55 AM', checkOut: '06:10 PM', breakHrs: '1:00', workHrs: '8:15', mode: 'Office', status: 'Present', late: false, early: false, location: 'Bangalore HQ', device: 'MacBook Pro 14"', ip: '192.168.1.45', breaks: [{ start: '01:00 PM', end: '02:00 PM' }] },
  { id: 8, empName: 'Rahul Sharma', empId: 'EMP-001', dept: 'Engineering', date: '03 Aug 2026', checkIn: '09:10 AM', checkOut: '07:00 PM', breakHrs: '1:00', workHrs: '8:50', mode: 'WFH', status: 'Present', late: false, early: false, location: 'Indiranagar, BLR', device: 'MacBook Pro 14"', ip: '45.112.56.89', breaks: [{ start: '01:30 PM', end: '02:30 PM' }] },
];

const AttendanceHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'badge present';
      case 'Absent': return 'badge absent';
      case 'On Leave': return 'badge leave';
      case 'Half Day': return 'badge half-day';
      default: return 'badge';
    }
  };

  // Filter Logic
  const filteredHistory = MOCK_HISTORY.filter(record => {
    const matchesSearch = `${record.empName} ${record.empId}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmp = empFilter ? record.empName === empFilter : true;
    const matchesDept = deptFilter ? record.dept === deptFilter : true;
    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    return matchesSearch && matchesEmp && matchesDept && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage) || 1;
  const currentRecords = filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedRow(null); // collapse rows on page change
    }
  };

  return (
    <motion.div 
      className="attendance-history-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Attendance History</h1>
          <p>View and export past attendance records</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><Download size={16} /> Export CSV</button>
          <button className="btn-export"><FileText size={16} /> Export PDF</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={empFilter}
            onChange={setEmpFilter}
            options={[
              { value: '', label: 'All Employees' },
              { value: 'Rahul Sharma', label: 'Rahul Sharma' },
              { value: 'Priya Patel', label: 'Priya Patel' },
              { value: 'Amit Kumar', label: 'Amit Kumar' }
            ]}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Design', label: 'Design' },
              { value: 'HR', label: 'HR' }
            ]}
          />
        </div>
        <input type="date" className="filter-date" />
        <input type="date" className="filter-date" />
        <div style={{ width: '160px' }}>
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Present', label: 'Present' },
              { value: 'Absent', label: 'Absent' },
              { value: 'Half Day', label: 'Half Day' },
              { value: 'On Leave', label: 'On Leave' }
            ]}
          />
        </div>
      </div>

      <div className="table-container">
        {filteredHistory.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No records found"
            message="Try adjusting your date or department filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Break Hrs</th>
              <th>Work Hrs</th>
              <th>Mode</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(record => (
              <React.Fragment key={record.id}>
                <tr 
                  onClick={() => toggleRow(record.id)}
                  className={expandedRow === record.id ? 'expanded-row' : ''}
                >
                  <td>
                    <div className="employee-cell">
                      <div>
                        <div>{record.empName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '400' }}>{record.empId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{record.date}</td>
                  <td>
                    {record.checkIn} 
                    {record.late && <span style={{ color: '#dc2626', fontSize: '10px', marginLeft: '4px' }}>(Late)</span>}
                  </td>
                  <td>
                    {record.checkOut}
                    {record.early && <span style={{ color: '#d97706', fontSize: '10px', marginLeft: '4px' }}>(Early)</span>}
                  </td>
                  <td>{record.breakHrs}</td>
                  <td>{record.workHrs}</td>
                  <td>
                    {record.mode !== '-' && (
                      <div className="work-mode-icon">
                        {record.mode === 'Office' ? '🏢' : '🏠'} {record.mode}
                      </div>
                    )}
                    {record.mode === '-' && '-'}
                  </td>
                  <td>
                    <span className={getStatusBadge(record.status)}>
                      {record.status === 'Present' && '🟢'}
                      {record.status === 'Absent' && '🔴'}
                      {record.status === 'Half Day' && '🟡'}
                      {record.status === 'On Leave' && '⚪'}
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn ghost icon-only" title="Toggle Details">
                      {expandedRow === record.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRow === record.id && (
                    <tr>
                      <td colSpan="9" style={{ padding: 0 }}>
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="expanded-details">
                            <div className="detail-group">
                              <span className="detail-label">Location</span>
                              <span className="detail-value"><MapPin size={16} color="#64748b" /> {record.location}</span>
                            </div>
                            <div className="detail-group">
                              <span className="detail-label">Device & IP</span>
                              <span className="detail-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Monitor size={16} color="#64748b" /> {record.device}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}><Globe size={14} /> {record.ip}</span>
                              </span>
                            </div>
                            <div className="detail-group">
                              <span className="detail-label">Break Details</span>
                              {record.breaks.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {record.breaks.map((b, i) => (
                                    <span key={i} className="detail-value" style={{ fontSize: '12px' }}>
                                      <Clock size={14} color="#64748b" /> {b.start} - {b.end}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="detail-value" style={{ color: '#94a3b8' }}>No breaks recorded</span>
                              )}
                            </div>
                            <div className="detail-group">
                              <span className="detail-label">Notes</span>
                              <span className="detail-value" style={{ color: '#64748b', fontSize: '13px' }}>
                                {record.late ? 'Employee arrived after 9:30 AM.' : ''}
                                {record.early ? 'Employee left before 6:00 PM without prior approval.' : ''}
                                {!record.late && !record.early && record.status === 'Present' ? 'Regular shift completed.' : ''}
                                {record.status === 'Absent' ? 'Unmarked attendance.' : ''}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        )}
      </div>
        
        <div className="pagination">
          <div className="page-info">
            Showing {(currentPage - 1) * rowsPerPage + (currentRecords.length > 0 ? 1 : 0)} to {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length}
            <div style={{ marginLeft: '12px', display: 'inline-block', width: '100px', verticalAlign: 'middle' }}>
              <CustomDropdown
                value={rowsPerPage}
                onChange={(val) => { setRowsPerPage(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: 5, label: '5 / page' },
                  { value: 10, label: '10 / page' },
                  { value: 20, label: '20 / page' }
                ]}
                size="sm"
              />
            </div>
          </div>
          <div className="page-controls">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>◀</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>▶</button>
          </div>
        </div>
    </motion.div>
  );
};

export default AttendanceHistory;
