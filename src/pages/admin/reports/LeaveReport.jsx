import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import '../../../styles/admin/reports/leave-report.css';

const MOCK_TREND = [];

const MOCK_DIST = [];

const MOCK_TOP_TAKERS = [];

const MOCK_BALANCE = [];

const LeaveReport = () => {
  return (
    <motion.div 
      className="leave-report-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Leave Analytics</h1>
          <p>Insights into leave utilization and balances</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary"><FileText size={16} /> Export PDF</button>
          <button className="btn-secondary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select">
          <option>Year 2026</option>
          <option>Year 2025</option>
        </select>
        <select className="filter-select">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Marketing</option>
        </select>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Monthly Leave Trend (Days Taken)</h3>
          <div className="css-bar-chart">
            {MOCK_TREND.map((data, i) => (
              <div key={i} className="bar-wrapper" title={`${data.month}: ${data.value} days`}>
                <div 
                  className="bar" 
                  style={{ height: `${data.value * 2}%`, backgroundColor: '#3b82f6' }}
                ></div>
                <div className="bar-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Leave Type Distribution</h3>
          <div className="dist-chart-list">
            {MOCK_DIST.map((type, i) => (
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
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <div className="table-card-header">
            <h3>Top Leave Takers</h3>
          </div>
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
              {MOCK_TOP_TAKERS.map(emp => (
                <tr key={emp.id}>
                  <td className="table-name">{emp.name}</td>
                  <td>{emp.type}</td>
                  <td className="table-count">{emp.days} days</td>
                  <td>{emp.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3>Department Balance Summary</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Avg Balance</th>
                <th>Total Employees</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BALANCE.map(dept => (
                <tr key={dept.id}>
                  <td className="table-name">{dept.dept}</td>
                  <td className="table-count">{dept.avgBalance} days</td>
                  <td>{dept.totalEmployees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveReport;
