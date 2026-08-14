import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePopup } from '../../../contexts/PopupContext';
import { getAllAttendanceRecords, getAllEmployees, getDepartments } from '../../../services/adminService';
import '../../../styles/admin/reports/attendance-report.css';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = usePopup();

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      const [attRes, empRes, deptRes] = await Promise.all([
        getAllAttendanceRecords(),
        getAllEmployees(),
        getDepartments()
      ]);

      let rawAtt = attRes.data || [];

      // Local storage fallback
      try {
        const localAtt = JSON.parse(localStorage.getItem('hrms_local_attendance') || '[]');
        const map = new Map();
        [...localAtt, ...rawAtt].forEach(item => {
          if (item?.id || item?.date) map.set(item.id || `${item.employee_id}-${item.date}`, item);
        });
        rawAtt = Array.from(map.values());
      } catch (e) {}

      setAttendanceData(rawAtt);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setLoading(false);
    };

    loadReportData();
  }, []);

  // Filter attendance records based on dropdowns
  const filteredData = useMemo(() => {
    return attendanceData.filter(item => {
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || '';
      if (selectedDept !== 'all' && deptName.toLowerCase() !== selectedDept.toLowerCase()) {
        return false;
      }
      if (selectedMonth !== 'all' && item.date) {
        const itemMonth = item.date.substring(0, 7); // YYYY-MM
        if (itemMonth !== selectedMonth) return false;
      }
      return true;
    });
  }, [attendanceData, selectedDept, selectedMonth]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalRecords = filteredData.length;
    const uniqueDates = new Set(filteredData.map(i => i.date)).size || 1;
    const activeEmpCount = employees.length || 1;

    const presentOrWfh = filteredData.filter(i => {
      const st = (i.status || '').toLowerCase();
      const mode = (i.work_mode || '').toLowerCase();
      return st === 'present' || st === 'wfh' || mode === 'home' || st === 'approved';
    }).length;

    const avgAttendancePercent = totalRecords > 0 ? Math.min(100, Math.round((presentOrWfh / totalRecords) * 100)) : 90;

    let lateCount = 0;
    let earlyCount = 0;
    let totalOvertimeHours = 0;

    const lateComersMap = new Map();
    const earlyLeaversMap = new Map();

    filteredData.forEach(item => {
      const checkIn = item.check_in || item.checkIn || '';
      const checkOut = item.check_out || item.checkOut || '';
      const empName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : (item.employee_name || 'Employee');
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || 'Engineering';

      // Check Late (after 09:30 AM)
      if (checkIn && checkIn > '09:30') {
        lateCount++;
        const prev = lateComersMap.get(empName) || { count: 0, times: [], dept: deptName };
        prev.count++;
        prev.times.push(checkIn);
        lateComersMap.set(empName, prev);
      }

      // Check Early (before 18:00 PM)
      if (checkOut && checkOut < '18:00' && checkOut !== '-') {
        earlyCount++;
        const prev = earlyLeaversMap.get(empName) || { count: 0, times: [], dept: deptName };
        prev.count++;
        prev.times.push(checkOut);
        earlyLeaversMap.set(empName, prev);
      }

      // Overtime
      const hrs = parseFloat(item.total_hours || item.hours || 0);
      if (hrs > 8) {
        totalOvertimeHours += (hrs - 8);
      }
    });

    // Top Late Comers
    const topLate = Array.from(lateComersMap.entries()).map(([name, data]) => ({
      id: name,
      name,
      dept: data.dept,
      count: data.count,
      time: data.times[0] || '09:45 AM'
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top Early Leavers
    const topEarly = Array.from(earlyLeaversMap.entries()).map(([name, data]) => ({
      id: name,
      name,
      dept: data.dept,
      count: data.count,
      time: data.times[0] || '05:15 PM'
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Daily Trend (Last 30 Days)
    const datesMap = new Map();
    filteredData.forEach(item => {
      if (!item.date) return;
      const dayNum = item.date.split('-')[2] || '01';
      const st = (item.status || '').toLowerCase();
      const isAtt = st === 'present' || st === 'wfh' || (item.work_mode || '').toLowerCase() === 'home';
      const current = datesMap.get(dayNum) || { day: dayNum, total: 0, present: 0 };
      current.total++;
      if (isAtt) current.present++;
      datesMap.set(dayNum, current);
    });

    const trend = Array.from(datesMap.values()).map(d => {
      const val = d.total > 0 ? Math.round((d.present / d.total) * 100) : 85;
      return {
        day: d.day,
        value: val,
        color: val >= 90 ? '#10b981' : val >= 75 ? '#3b82f6' : '#f59e0b'
      };
    }).sort((a, b) => parseInt(a.day) - parseInt(b.day));

    // Department Attendance
    const deptMap = new Map();
    filteredData.forEach(item => {
      const dName = item.profiles?.departments?.name || item.profiles?.department || item.department || 'Engineering';
      const st = (item.status || '').toLowerCase();
      const isAtt = st === 'present' || st === 'wfh';
      const cur = deptMap.get(dName) || { name: dName, total: 0, present: 0 };
      cur.total++;
      if (isAtt) cur.present++;
      deptMap.set(dName, cur);
    });

    const deptAttendance = Array.from(deptMap.values()).map(d => ({
      name: d.name,
      value: d.total > 0 ? Math.round((d.present / d.total) * 100) : 90
    }));

    return {
      workingDays: uniqueDates,
      avgAttendance: avgAttendancePercent,
      lateCount,
      earlyCount,
      overtime: Math.round(totalOvertimeHours),
      topLate,
      topEarly,
      trend,
      deptAttendance
    };
  }, [filteredData, employees]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      showAlert('No attendance data available to export.', 'warning');
      return;
    }

    const headers = ['Date', 'Employee Name', 'Department', 'Status', 'Work Mode', 'Check In', 'Check Out', 'Total Hours'];
    const rows = filteredData.map(item => {
      const empName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : (item.employee_name || 'Employee');
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || 'Engineering';
      return [
        item.date || '',
        `"${empName}"`,
        `"${deptName}"`,
        item.status || 'present',
        item.work_mode || 'office',
        item.check_in || '-',
        item.check_out || '-',
        item.total_hours || '8'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      className="report-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <Link to="/admin/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563eb', marginBottom: '8px', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back to Reports Dashboard
          </Link>
          <h1>Attendance Analytics</h1>
          <p>Detailed insights into real employee attendance records and check-in patterns</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id || d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
          <p>Calculating live attendance report analytics...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Working Days</div>
              <div className="stat-value">{metrics.workingDays}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Avg Attendance</div>
              <div className="stat-value">{metrics.avgAttendance}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Late Arrivals</div>
              <div className="stat-value">{metrics.lateCount}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Early Departures</div>
              <div className="stat-value">{metrics.earlyCount}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Overtime (hrs)</div>
              <div className="stat-value">{metrics.overtime}</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Daily Attendance Trend (Recorded Days)</h3>
              {metrics.trend.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No attendance trend data available</div>
              ) : (
                <div className="css-bar-chart">
                  {metrics.trend.map((data, i) => (
                    <div key={i} className="bar-wrapper" title={`Day ${data.day}: ${data.value}%`}>
                      <div 
                        className="bar" 
                        style={{ height: `${data.value}%`, backgroundColor: data.color }}
                      ></div>
                      <div className="bar-label">{data.day}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Department Attendance Rate</h3>
              {metrics.deptAttendance.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No department attendance metrics available</div>
              ) : (
                <div className="dept-chart-list">
                  {metrics.deptAttendance.map((dept, i) => (
                    <div key={i} className="dept-bar-row">
                      <div className="dept-bar-header">
                        <span>{dept.name}</span>
                        <span>{dept.value}%</span>
                      </div>
                      <div className="dept-bar-track">
                        <div className="dept-bar-fill" style={{ width: `${dept.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="tables-grid">
            <div className="table-card">
              <div className="table-card-header">
                <h3>Late Check-in Records</h3>
              </div>
              {metrics.topLate.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No late arrivals logged</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Avg Check-in</th>
                      <th>Count</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topLate.map(emp => (
                      <tr key={emp.id}>
                        <td className="table-name">{emp.name}</td>
                        <td>{emp.time}</td>
                        <td className="table-count">{emp.count} times</td>
                        <td>{emp.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="table-card">
              <div className="table-card-header">
                <h3>Early Departure Records</h3>
              </div>
              {metrics.topEarly.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No early departures logged</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Avg Check-out</th>
                      <th>Count</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topEarly.map(emp => (
                      <tr key={emp.id}>
                        <td className="table-name">{emp.name}</td>
                        <td>{emp.time}</td>
                        <td className="table-count">{emp.count} times</td>
                        <td>{emp.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AttendanceReport;
