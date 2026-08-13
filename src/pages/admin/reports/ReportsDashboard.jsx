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
    title: 'Employee Directory & Stats',
    description: 'Headcount metrics, department breakdown, and employee directory.',
    icon: <Users size={24} />,
    active: true,
    link: '/admin/employees'
  },
  {
    id: 'task',
    title: 'Task & Worksheet Report',
    description: 'Task completion rates, worksheet analytics, and team productivity.',
    icon: <CheckSquare size={24} />,
    active: true,
    link: '/admin/tasks'
  },
  {
    id: 'asset',
    title: 'Asset Inventory Report',
    description: 'Hardware inventory, assignment history, and device statuses.',
    icon: <Package size={24} />,
    active: true,
    link: '/admin/assets'
  },
  {
    id: 'ticket',
    title: 'Ticket Queue Report',
    description: 'IT support resolution times, volume trends, and SLA status.',
    icon: <Ticket size={24} />,
    active: true,
    link: '/admin/tickets'
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
