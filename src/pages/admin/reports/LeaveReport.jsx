import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePopup } from '../../../contexts/PopupContext';
import { getAllLeaveRequests, getAllEmployees, getDepartments } from '../../../services/adminService';
import '../../../styles/admin/reports/leave-report.css';

const LeaveReport = () => {
  const { showAlert } = usePopup();
  const [leaveData, setLeaveData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      const [leaveRes, empRes, deptRes] = await Promise.all([
        getAllLeaveRequests(),
        getAllEmployees(),
        getDepartments()
      ]);

      let rawLeaves = leaveRes.data || [];

      // Local storage fallback
      try {
        const localLeaves = JSON.parse(localStorage.getItem('hrms_local_leaves') || '[]');
        const map = new Map();
        [...localLeaves, ...rawLeaves].forEach(item => {
          if (item?.id) map.set(item.id, item);
        });
        rawLeaves = Array.from(map.values());
      } catch (e) {}

      setLeaveData(rawLeaves);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setLoading(false);
    };

    loadReportData();
  }, []);

  // Filter leave records
  const filteredData = useMemo(() => {
    return leaveData.filter(item => {
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || '';
      if (selectedDept !== 'all' && deptName.toLowerCase() !== selectedDept.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [leaveData, selectedDept]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDaysMap = new Map(monthNames.map(m => [m, 0]));

    const typeCountMap = new Map();
    const employeeLeavesMap = new Map();
    const deptLeavesMap = new Map();

    filteredData.forEach(item => {
      const fromDate = item.from_date || item.start_date || item.created_at || '';
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d.getTime())) {
          const mName = monthNames[d.getMonth()];
          const days = parseFloat(item.days || item.total_days || 1);
          monthlyDaysMap.set(mName, (monthlyDaysMap.get(mName) || 0) + days);
        }
      }

      // Leave Type Distribution
      const lType = item.leave_type || item.type || 'Casual Leave';
      typeCountMap.set(lType, (typeCountMap.get(lType) || 0) + 1);

      // Top Leave Takers
      const empName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : (item.employee_name || 'Employee');
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || 'Engineering';
      const days = parseFloat(item.days || item.total_days || 1);

      const prevEmp = employeeLeavesMap.get(empName) || { name: empName, type: lType, days: 0, dept: deptName };
      prevEmp.days += days;
      employeeLeavesMap.set(empName, prevEmp);

      // Department Balance Summary
      const prevDept = deptLeavesMap.get(deptName) || { dept: deptName, totalDays: 0, totalRequests: 0 };
      prevDept.totalDays += days;
      prevDept.totalRequests++;
      deptLeavesMap.set(deptName, prevDept);
    });

    // Monthly Trend Data
    const maxMonthly = Math.max(...Array.from(monthlyDaysMap.values()), 1);
    const trend = Array.from(monthlyDaysMap.entries()).map(([month, val]) => ({
      month,
      value: val,
      heightPercent: Math.min(100, Math.round((val / maxMonthly) * 100))
    }));

    // Leave Type Distribution
    const totalRequests = filteredData.length || 1;
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const distribution = Array.from(typeCountMap.entries()).map(([name, count], i) => ({
      name,
      value: Math.round((count / totalRequests) * 100),
      color: colors[i % colors.length]
    }));

    // Top Leave Takers
    const topTakers = Array.from(employeeLeavesMap.values())
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);

    // Department Balance Summary
    const deptSummary = Array.from(deptLeavesMap.values()).map(d => ({
      id: d.dept,
      dept: d.dept,
      avgBalance: Math.max(0, 24 - Math.round(d.totalDays / (d.totalRequests || 1))),
      totalEmployees: employees.filter(e => (e.department || '').toLowerCase() === d.dept.toLowerCase()).length || d.totalRequests
    }));

    return {
      trend,
      distribution,
      topTakers,
      deptSummary
    };
  }, [filteredData, employees]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      showAlert('No leave request data available to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Employee Name', 'Department', 'Leave Type', 'From Date', 'To Date', 'Days', 'Status', 'Reason'];
    const rows = filteredData.map(item => {
      const empName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : (item.employee_name || 'Employee');
      const deptName = item.profiles?.departments?.name || item.profiles?.department || item.department || 'Engineering';
      return [
        item.id || '',
        `"${empName}"`,
        `"${deptName}"`,
        item.leave_type || item.type || 'Casual Leave',
        item.from_date || item.start_date || '',
        item.to_date || item.end_date || '',
        item.days || item.total_days || '1',
        item.status || 'pending',
        `"${(item.reason || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leave_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      className="leave-report-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <Link to="/admin/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563eb', marginBottom: '8px', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back to Reports Dashboard
          </Link>
          <h1>Leave Analytics</h1>
          <p>Insights into real employee leave utilization, balances, and trends</p>
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
          <p>Calculating live leave report analytics...</p>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Monthly Leave Trend (Days Taken)</h3>
              <div className="css-bar-chart">
                {metrics.trend.map((data, i) => (
                  <div key={i} className="bar-wrapper" title={`${data.month}: ${data.value} days`}>
                    <div 
                      className="bar" 
                      style={{ height: `${data.heightPercent || 10}%`, backgroundColor: '#3b82f6' }}
                    ></div>
                    <div className="bar-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Leave Type Distribution</h3>
              {metrics.distribution.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No leave requests recorded</div>
              ) : (
                <div className="dist-chart-list">
                  {metrics.distribution.map((type, i) => (
                    <div key={i} className="dist-bar-row">
                      <div className="dist-bar-header">
                        <span>{type.name}</span>
                        <span>{type.value}%</span>
                      </div>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${type.value}%`, backgroundColor: type.color }}></div>
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
                <h3>Top Leave Takers</h3>
              </div>
              {metrics.topTakers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No leave requests logged</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Days Taken</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topTakers.map((emp, idx) => (
                      <tr key={idx}>
                        <td className="table-name">{emp.name}</td>
                        <td>{emp.type}</td>
                        <td className="table-count">{emp.days} days</td>
                        <td>{emp.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="table-card">
              <div className="table-card-header">
                <h3>Department Balance Summary</h3>
              </div>
              {metrics.deptSummary.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No department data available</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Avg Balance</th>
                      <th>Total Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.deptSummary.map((dept, idx) => (
                      <tr key={idx}>
                        <td className="table-name">{dept.dept}</td>
                        <td className="table-count">{dept.avgBalance} days</td>
                        <td>{dept.totalEmployees}</td>
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

export default LeaveReport;
