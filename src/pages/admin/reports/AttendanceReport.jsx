import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import '../../../styles/admin/reports/attendance-report.css';

const MOCK_TREND = Array.from({ length: 30 }, (_, i) => {
  const value = Math.floor(Math.random() * 40) + 60; // 60% to 100%
  let color = '#22c55e'; // green
  if (value < 70) color = '#ef4444'; // red
  else if (value < 90) color = '#eab308'; // yellow
  return { day: i + 1, value, color };
});

const MOCK_DEPTS = [
  { name: 'Engineering', value: 96 },
  { name: 'Marketing', value: 92 },
  { name: 'HR', value: 88 },
  { name: 'Sales', value: 85 },
  { name: 'Operations', value: 94 },
];

const MOCK_LATE = [
  { id: 1, name: 'Rohan Verma', time: '09:45 AM', count: 8, dept: 'Sales' },
  { id: 2, name: 'Neha Gupta', time: '09:30 AM', count: 5, dept: 'Marketing' },
  { id: 3, name: 'Amit Kumar', time: '09:25 AM', count: 4, dept: 'Design' },
];

const MOCK_EARLY = [
  { id: 1, name: 'Vikram Singh', time: '04:30 PM', count: 6, dept: 'Finance' },
  { id: 2, name: 'Pooja Iyer', time: '04:45 PM', count: 4, dept: 'QA' },
  { id: 3, name: 'Anita Desai', time: '05:00 PM', count: 3, dept: 'Legal' },
];

const AttendanceReport = () => {
  return (
    <motion.div 
      className="report-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Attendance Analytics</h1>
          <p>Detailed insights into employee attendance patterns</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary"><FileText size={16} /> Export PDF</button>
          <button className="btn-secondary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select">
          <option>August 2026</option>
          <option>July 2026</option>
        </select>
        <select className="filter-select">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Marketing</option>
        </select>
        <select className="filter-select">
          <option>All Employees</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">Total Working Days</div>
          <div className="stat-value">22</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Attendance</div>
          <div className="stat-value">92%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Late Arrivals</div>
          <div className="stat-value">124</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Early Departures</div>
          <div className="stat-value">45</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Overtime (hrs)</div>
          <div className="stat-value">312</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Daily Attendance Trend (Last 30 Days)</h3>
          <div className="css-bar-chart">
            {MOCK_TREND.map((data, i) => (
              <div key={i} className="bar-wrapper" title={`Day ${data.day}: ${data.value}%`}>
                <div 
                  className="bar" 
                  style={{ height: `${data.value}%`, backgroundColor: data.color }}
                ></div>
                {i % 5 === 0 && <div className="bar-label">{data.day}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Department Attendance</h3>
          <div className="dept-chart-list">
            {MOCK_DEPTS.map((dept, i) => (
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
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <div className="table-card-header">
            <h3>Top Late Comers</h3>
          </div>
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
              {MOCK_LATE.map(emp => (
                <tr key={emp.id}>
                  <td className="table-name">{emp.name}</td>
                  <td>{emp.time}</td>
                  <td className="table-count">{emp.count} times</td>
                  <td>{emp.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3>Top Early Leavers</h3>
          </div>
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
              {MOCK_EARLY.map(emp => (
                <tr key={emp.id}>
                  <td className="table-name">{emp.name}</td>
                  <td>{emp.time}</td>
                  <td className="table-count">{emp.count} times</td>
                  <td>{emp.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
};

export default AttendanceReport;
