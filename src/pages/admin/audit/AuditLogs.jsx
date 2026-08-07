import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import '../../../styles/admin/audit/audit-logs.css';
import EmptyState from '../../../components/admin/EmptyState';

const MOCK_LOGS = [];

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
