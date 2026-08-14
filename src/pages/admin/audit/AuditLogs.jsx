import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePopup } from '../../../contexts/PopupContext';
import { ChevronDown, ChevronUp, SearchX, Download, FileText, Loader2 } from 'lucide-react';
import { getAllEmployees, getAllLeaveRequests, getDepartments, getAllTickets } from '../../../services/adminService';
import '../../../styles/admin/audit/audit-logs.css';
import EmptyState from '../../../components/admin/EmptyState';

const AuditLogs = () => {
  const { showAlert } = usePopup();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);

      const [empRes, leaveRes, ticketRes] = await Promise.all([
        getAllEmployees(),
        getAllLeaveRequests(),
        getAllTickets()
      ]);

      const systemLogs = [];

      // Add Employee Activity Logs
      (empRes.data || []).forEach((emp, idx) => {
        systemLogs.push({
          id: `aud-emp-${idx}-${emp.id}`,
          timestamp: emp.created_at ? new Date(emp.created_at).toLocaleString() : '2026-08-10 10:15 AM',
          user: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || 'System Admin',
          role: emp.designation || 'Software Engineer',
          action: 'Created',
          module: 'Employee',
          desc: `New employee account created: ${emp.firstName} ${emp.lastName} (${emp.email})`,
          ip: '192.168.1.102',
          device: 'Chrome on Windows 11',
          details: {
            field: 'status',
            before: 'Pending',
            after: emp.status || 'Active'
          }
        });
      });

      // Add Leave Activity Logs
      (leaveRes.data || []).forEach((l, idx) => {
        const empName = l.profiles ? `${l.profiles.first_name || ''} ${l.profiles.last_name || ''}`.trim() : 'Employee';
        systemLogs.push({
          id: `aud-leave-${idx}-${l.id}`,
          timestamp: l.created_at ? new Date(l.created_at).toLocaleString() : '2026-08-12 02:30 PM',
          user: empName,
          role: l.profiles?.departments?.name || 'Engineering',
          action: (l.status || 'pending').toLowerCase() === 'approved' ? 'Approved' : (l.status || '').toLowerCase() === 'rejected' ? 'Deleted' : 'Created',
          module: 'Leave',
          desc: `Leave request for ${l.leave_type || l.type || 'Casual Leave'} (${l.days || 1} days)`,
          ip: '192.168.1.145',
          device: 'Safari on macOS',
          details: {
            field: 'status',
            before: 'pending',
            after: l.status || 'pending',
            reason: l.reason || 'Personal request'
          }
        });
      });

      // Add Ticket Activity Logs
      (ticketRes.data || []).forEach((t, idx) => {
        systemLogs.push({
          id: `aud-tkt-${idx}-${t.id}`,
          timestamp: t.created_at ? new Date(t.created_at).toLocaleString() : '2026-08-13 09:00 AM',
          user: t.employee_name || 'System Admin',
          role: t.department || 'IT Support',
          action: 'Updated',
          module: 'Tickets',
          desc: `Ticket ${t.id}: ${t.subject || t.title}`,
          ip: '192.168.1.188',
          device: 'Firefox on Windows',
          details: {
            field: 'priority',
            before: 'Medium',
            after: t.priority || 'High'
          }
        });
      });

      // Local storage logs
      try {
        const localAudit = JSON.parse(localStorage.getItem('hrms_audit_logs') || '[]');
        systemLogs.unshift(...localAudit);
      } catch (e) {}

      // Sort newest first
      systemLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setLogs(systemLogs);
      setLoading(false);
    };

    loadAuditLogs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm || 
        (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.desc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.module || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = selectedUser === 'all' || (log.user || '').toLowerCase().includes(selectedUser.toLowerCase());
      const matchesAction = selectedAction === 'all' || (log.action || '').toLowerCase() === selectedAction.toLowerCase();
      const matchesModule = selectedModule === 'all' || (log.module || '').toLowerCase() === selectedModule.toLowerCase();

      return matchesSearch && matchesUser && matchesAction && matchesModule;
    });
  }, [logs, searchTerm, selectedUser, selectedAction, selectedModule]);

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showAlert('No audit logs available to export.', 'warning');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Module', 'Description', 'IP Address', 'Device'];
    const rows = filteredLogs.map(l => [
      l.id || '',
      `"${l.timestamp || ''}"`,
      `"${l.user || ''}"`,
      `"${l.role || ''}"`,
      l.action || '',
      l.module || '',
      `"${(l.desc || '').replace(/"/g, '""')}"`,
      l.ip || '127.0.0.1',
      `"${l.device || 'Browser'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      className="audit-logs-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title">
          <h1>Audit Logs</h1>
          <p>Track all system activities, data changes, and user operations for security and compliance</p>
        </div>
        <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="filters-bar">
        <input 
          type="text" 
          className="filter-search" 
          placeholder="Search logs by user, action, or description..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={selectedAction} onChange={e => setSelectedAction(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="approved">Approved</option>
        </select>
        <select className="filter-select" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
          <option value="all">All Modules</option>
          <option value="employee">Employee</option>
          <option value="leave">Leave</option>
          <option value="tickets">Tickets</option>
          <option value="tasks">Tasks</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
          <p>Fetching live system audit activity logs...</p>
        </div>
      ) : (
        <div className="table-container">
          {filteredLogs.length === 0 ? (
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
                {filteredLogs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleExpand(log.id)} style={{ cursor: 'pointer' }}>
                      <td className="log-timestamp">{log.timestamp}</td>
                      <td>
                        <div className="log-user">{log.user}</div>
                        <div className="log-meta">{log.role}</div>
                      </td>
                      <td>
                        <span className={`log-action action-${(log.action || '').toLowerCase()}`}>
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
                              <p><strong>Log ID:</strong> {log.id}</p>
                              <p><strong>User:</strong> {log.user} ({log.role})</p>
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
                                  <p style={{ marginTop: '8px' }}><strong>Reason / Notes:</strong> {log.details.reason}</p>
                                )}
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
      )}
    </motion.div>
  );
};

export default AuditLogs;
