import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import '../../../styles/admin/audit/audit-logs.css';
import EmptyState from '../../../components/admin/EmptyState';

const MOCK_LOGS = [
  { id: 1, timestamp: 'Aug 5, 11:02 AM', user: 'System Admin', role: 'Admin', action: 'Approved', module: 'Leave', desc: 'Approved sick leave for Priya Patel', ip: '103.21.x.x', device: 'Chrome/Win', details: null },
  { id: 2, timestamp: 'Aug 5, 10:45 AM', user: 'Meera Nair', role: 'HR Manager', action: 'Created', module: 'Employee', desc: 'Added new employee Vikram Singh', ip: '103.21.x.x', device: 'Firefox/Mac', details: null },
  { id: 3, timestamp: 'Aug 5, 09:15 AM', user: 'System Admin', role: 'Admin', action: 'Updated', module: 'Settings', desc: 'Changed office start time', ip: '103.21.x.x', device: 'Chrome/Win', details: { field: 'office_start_time', before: '09:30', after: '09:00' } },
  { id: 4, timestamp: 'Aug 4, 05:30 PM', user: 'System Admin', role: 'Admin', action: 'Exported', module: 'Reports', desc: 'Exported Attendance Report to CSV', ip: '103.21.x.x', device: 'Chrome/Win', details: null },
  { id: 5, timestamp: 'Aug 4, 02:10 PM', user: 'Rajesh Kumar', role: 'Manager', action: 'Rejected', module: 'Leave', desc: 'Rejected casual leave for Amit Kumar', ip: '103.22.x.x', device: 'Safari/Mac', details: { reason: 'Project Deadline' } },
  { id: 6, timestamp: 'Aug 4, 11:00 AM', user: 'System Admin', role: 'Admin', action: 'Deleted', module: 'Asset', desc: 'Removed damaged Chair AC-004 from inventory', ip: '103.21.x.x', device: 'Chrome/Win', details: null },
  { id: 7, timestamp: 'Aug 4, 09:00 AM', user: 'Meera Nair', role: 'HR Manager', action: 'Login', module: 'Auth', desc: 'Successful login', ip: '103.21.x.x', device: 'Firefox/Mac', details: null },
];

const AuditLogs = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div 
      className="audit-logs-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Audit Logs</h1>
          <p>Track all system activities for security and compliance</p>
        </div>
      </div>

      <div className="filters-bar">
        <input type="text" className="filter-search" placeholder="Search logs..." />
        <select className="filter-select">
          <option>All Users</option>
          <option>System Admin</option>
          <option>HR Manager</option>
        </select>
        <select className="filter-select">
          <option>All Actions</option>
          <option>Created</option>
          <option>Updated</option>
          <option>Deleted</option>
          <option>Approved</option>
        </select>
        <select className="filter-select">
          <option>All Modules</option>
          <option>Employee</option>
          <option>Leave</option>
          <option>Settings</option>
        </select>
        <input type="date" className="filter-date" />
      </div>

      <div className="table-container">
        {MOCK_LOGS.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No audit logs found"
            message="No system activity matches your filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>IP / Device</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGS.map(log => (
              <React.Fragment key={log.id}>
                <tr onClick={() => toggleExpand(log.id)}>
                  <td className="log-timestamp">{log.timestamp}</td>
                  <td>
                    <div className="log-user">{log.user}</div>
                    <div className="log-meta">{log.role}</div>
                  </td>
                  <td>
                    <span className={`log-action action-${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td><span className="log-module">{log.module}</span></td>
                  <td><div className="log-desc" title={log.desc}>{log.desc}</div></td>
                  <td>
                    <div style={{ color: 'var(--text-secondary)' }}>{log.ip}</div>
                    <div className="log-meta">{log.device}</div>
                  </td>
                  <td>
                    <button className="action-btn ghost icon-only" title="Toggle Details">
                      {expandedId === log.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr>
                    <td colSpan="7" style={{ padding: 0 }}>
                      <motion.div 
                        className="expanded-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="detail-group">
                          <h4>Event Details</h4>
                          <p><strong>Log ID:</strong> AUD-{log.id.toString().padStart(6, '0')}</p>
                          <p><strong>Session ID:</strong> SES-88X9Y2</p>
                        </div>
                        {log.details && (
                          <div className="detail-group" style={{ flex: 1 }}>
                            <h4>Data Changes</h4>
                            {log.details.field && (
                              <div className="diff-box">
                                Field `{log.details.field}` changed:
                                <br />
                                <span className="diff-before">- {log.details.before}</span>
                                <br />
                                <span className="diff-after">+ {log.details.after}</span>
                              </div>
                            )}
                            {log.details.reason && (
                              <p><strong>Reason:</strong> {log.details.reason}</p>
                            )}
                          </div>
                        )}
                        {!log.details && (
                          <div className="detail-group" style={{ flex: 1 }}>
                            <h4>Data Changes</h4>
                            <p style={{ color: 'var(--text-tertiary)' }}>No specific data diff available for this action type.</p>
                          </div>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </motion.div>
  );
};

export default AuditLogs;
