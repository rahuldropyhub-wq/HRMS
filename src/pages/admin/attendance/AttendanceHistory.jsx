import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, FileText, ChevronDown, ChevronUp, 
  MapPin, Monitor, Globe, Clock, SearchX, RefreshCw
} from 'lucide-react';
import '../../../styles/admin/attendance/attendance-history.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllAttendanceRecords, getAllEmployees } from '../../../services/adminService';

function formatLocation(loc) {
  if (!loc) return 'Office HQ, Hyderabad';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    if (loc.address && typeof loc.address === 'string') return loc.address;
    if (loc.lat || loc.lng) return `${loc.lat || '—'}, ${loc.lng || '—'}`;
    try {
      return JSON.stringify(loc);
    } catch (e) {
      return 'Office HQ, Hyderabad';
    }
  }
  return String(loc);
}

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [employeesList, setEmployeesList] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [attRes, empRes] = await Promise.all([
      getAllAttendanceRecords(),
      getAllEmployees()
    ]);

    if (empRes.data) {
      setEmployeesList(empRes.data);
    }

    if (attRes.data) {
      const mapped = attRes.data.map(record => {
        const empName = record.profiles 
          ? `${record.profiles.first_name || ''} ${record.profiles.last_name || ''}`.trim() 
          : 'Employee';
        const empId = record.profiles?.emp_id || record.employee_id?.substring(0, 8) || 'DROPY-001';
        const dept = record.profiles?.departments?.name || record.profiles?.department || 'Engineering';
        
        const recordBreaks = Array.isArray(record.breaks) ? record.breaks : [];
        const calcSecs = recordBreaks.reduce((acc, b) => {
          if (typeof b.duration === 'number' && !isNaN(b.duration) && b.duration > 0) return acc + b.duration;
          return acc;
        }, 0);
        const breakHrsVal = record.total_break_hours ? parseFloat(record.total_break_hours) : (calcSecs / 3600);
        const breakHrsDisplay = breakHrsVal > 0 ? (breakHrsVal >= 1 ? `${breakHrsVal.toFixed(2)} hrs` : `${Math.round(breakHrsVal * 60)} mins`) : '0 mins';

        return {
          id: record.id,
          empName,
          empId,
          dept,
          date: record.date,
          checkIn: record.check_in || '--:--',
          checkOut: record.check_out || '--:--',
          late: record.is_late || false,
          early: record.is_early_logout || false,
          breakHrs: breakHrsDisplay,
          workHrs: record.total_hours ? `${record.total_hours} hrs` : '--',
          mode: record.work_mode === 'wfh' || record.work_mode === 'home' ? 'WFH' : 'Office',
          status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Present',
          location: formatLocation(record.gps_location),
          device: record.device_info || 'Chrome on Windows 11',
          ip: record.ip_address || '192.168.1.45',
          notes: record.wfh_reason || record.notes || 'Normal working day'
        };
      });
      setHistory(mapped);
    } else {
      setHistory([]);
    }
    setLoading(false);
  };

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
  const filteredHistory = history.filter(record => {
    const matchesSearch = `${record.empName} ${record.empId}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmp = empFilter ? record.empName === empFilter : true;
    const matchesDept = deptFilter ? record.dept === deptFilter : true;
    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    const matchesStartDate = startDateFilter ? record.date >= startDateFilter : true;
    const matchesEndDate = endDateFilter ? record.date <= endDateFilter : true;
    return matchesSearch && matchesEmp && matchesDept && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage) || 1;
  const currentRecords = filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedRow(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return alert('No records to export');
    const headers = ['Employee Name', 'Emp ID', 'Department', 'Date', 'Check In', 'Check Out', 'Break Hours', 'Work Hours', 'Mode', 'Status'];
    const rows = filteredHistory.map(r => [
      `"${r.empName || ''}"`,
      `"${r.empId || ''}"`,
      `"${r.dept || ''}"`,
      `"${r.date || ''}"`,
      `"${r.checkIn || ''}"`,
      `"${r.checkOut || ''}"`,
      `"${r.breakHrs || ''}"`,
      `"${r.workHrs || ''}"`,
      `"${r.mode || ''}"`,
      `"${r.status || ''}"`
    ]);

    const csvText = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build dropdown options dynamically from real data
  const empOptions = [
    { value: '', label: 'All Employees' },
    ...Array.from(new Set(history.map(r => r.empName).filter(Boolean)))
        .sort()
        .map(name => ({ value: name, label: name }))
  ];

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...Array.from(new Set(history.map(r => r.dept).filter(d => d && d !== '-')))
        .sort()
        .map(d => ({ value: d, label: d }))
  ];

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
          <button className="btn-export" onClick={loadData} title="Refresh Data"><RefreshCw size={16} /></button>
          <button className="btn-export" onClick={handleExportCSV}><Download size={16} /> Export CSV</button>
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
            options={empOptions}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}
            options={deptOptions}
          />
        </div>
        <input type="date" className="filter-date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} title="From Date" />
        <input type="date" className="filter-date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} title="To Date" />
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading attendance history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={<SearchX size={32} />}
            title="No attendance records found"
            message="Try adjusting your search filters or date range"
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Break</th>
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
                                <span className="detail-value"><MapPin size={16} color="#64748b" /> {formatLocation(record.location)}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Device & IP</span>
                                <span className="detail-value"><Monitor size={16} color="#64748b" /> {record.device} ({record.ip})</span>
                              </div>
                              <div className="detail-group" style={{ gridColumn: '1 / -1' }}>
                                <span className="detail-label">Notes / Reason</span>
                                <span className="detail-value">{record.notes}</span>
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

      {/* Pagination */}
      {!loading && filteredHistory.length > 0 && (
        <div className="pagination">
          <div className="page-info">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length}
            <div style={{ marginLeft: '12px', display: 'inline-block', width: '100px', verticalAlign: 'middle' }}>
              <CustomDropdown
                value={rowsPerPage}
                onChange={(val) => { setRowsPerPage(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: 5, label: '5 / page' },
                  { value: 10, label: '10 / page' },
                  { value: 20, label: '20 / page' },
                  { value: 50, label: '50 / page' }
                ]}
              />
            </div>
          </div>
          <div className="page-buttons">
            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceHistory;
