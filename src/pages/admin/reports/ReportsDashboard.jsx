import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, Users, CheckSquare, Package, Ticket, ArrowRight } from 'lucide-react';
import '../../../styles/admin/reports/reports-dashboard.css';

const REPORTS = [
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'Daily, monthly attendance stats, late check-ins, and overtime hours.',
    icon: <BarChart2 size={24} />,
    active: true,
    link: '/admin/reports/attendance'
  },
  {
    id: 'leave',
    title: 'Leave Report',
    description: 'Leave usage analytics, trends, and departmental balances.',
    icon: <Calendar size={24} />,
    active: true,
    link: '/admin/reports/leave'
  },
  {
    id: 'employee',
    title: 'Employee Report',
    description: 'Headcount metrics, demographics, and attrition rates.',
    icon: <Users size={24} />,
    active: false,
    link: '#'
  },
  {
    id: 'task',
    title: 'Task Report',
    description: 'Task completion rates, worksheet analytics, and productivity.',
    icon: <CheckSquare size={24} />,
    active: false,
    link: '#'
  },
  {
    id: 'asset',
    title: 'Asset Report',
    description: 'Hardware inventory, assignment history, and repair costs.',
    icon: <Package size={24} />,
    active: false,
    link: '#'
  },
  {
    id: 'ticket',
    title: 'Ticket Report',
    description: 'IT support resolution times, volume trends, and SLA breaches.',
    icon: <Ticket size={24} />,
    active: false,
    link: '#'
  }
];

const ReportsDashboard = () => {
  return (
    <motion.div 
      className="reports-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Generate insights and track metrics across your organization</p>
        </div>
      </div>

      <div className="reports-grid">
        {REPORTS.map((report, idx) => (
          <motion.div 
            key={report.id} 
            className={`report-card ${report.active ? 'active' : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="card-icon">{report.icon}</div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            
            {report.active ? (
              <Link to={report.link} className="btn-view-report">
                View Report <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="badge-coming-soon">Coming Soon</div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReportsDashboard;
