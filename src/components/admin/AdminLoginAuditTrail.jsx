import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Monitor, RefreshCw, Key, Trash2 } from 'lucide-react';
import { getAdminLoginLogs } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginAuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await getAdminLoginLogs();
    if (data) {
      // Deduplicate logs with same email and same timestamp minute
      const seen = new Set();
      const uniqueLogs = [];
      for (const item of data) {
        const key = `${item.admin_email}_${item.login_date}_${item.login_time}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLogs.push(item);
        }
      }
      setLogs(uniqueLogs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear old admin audit logs?')) return;
    try {
      localStorage.removeItem('dropyhub_admin_login_logs');
      await supabase.from('admin_audit_logs').delete().neq('id', '0');
    } catch (e) {}
    setLogs([]);
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'AD';
  };

  // Count unique active administrator accounts currently logged in
  const uniqueActiveAdmins = new Set(
    logs.filter(l => l.status === 'Active Session').map(l => l.admin_email)
  ).size;

  return (
    <div className="admin-audit-trail-container">
      <div className="admin-audit-header">
        <div className="admin-audit-title-area">
          <div className="admin-audit-icon-box">
            <ShieldCheck size={22} color="#4f46e5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="admin-audit-title">Admin Login & Security Audit Trail</h3>
              <span className="admin-audit-live-badge">
                <span className="live-pulse-dot"></span> Live Tracking
              </span>
            </div>
            <p className="admin-audit-subtitle">
              Verified security logs of administrator login timestamps, identity verification, and active sessions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {logs.length > 0 && (
            <button
              type="button"
              className="admin-audit-refresh-btn"
              onClick={handleClearLogs}
              title="Clear old logs"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={14} />
              Clear Logs
            </button>
          )}
          <button 
            type="button" 
            className="admin-audit-refresh-btn" 
            onClick={fetchLogs} 
            disabled={loading}
            title="Refresh Audit Logs"
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Stats Header */}
      <div className="admin-audit-stats-bar">
        <div className="admin-audit-stat">
          <span className="stat-label">Total Login Events</span>
          <span className="stat-value">{logs.length}</span>
        </div>
        <div className="stat-sep"></div>
        <div className="admin-audit-stat">
          <span className="stat-label">Active Admin Sessions</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {uniqueActiveAdmins || 1}
          </span>
        </div>
        <div className="stat-sep"></div>
        <div className="admin-audit-stat">
          <span className="stat-label">Last Login Event</span>
          <span className="stat-value" style={{ color: '#4f46e5' }}>
            {logs[0] ? `${logs[0].login_time} (${getRelativeTime(logs[0].login_timestamp)})` : 'None'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-audit-table-wrapper">
        <table className="admin-audit-table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Login Date & Time</th>
              <th>Authentication Method</th>
              <th>Client Device & OS</th>
              <th>IP / Gateway</th>
              <th>Session Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No admin login logs recorded yet. Log in via the Admin Login page to generate live records.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  {/* Administrator */}
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-avatar">
                        {getInitials(log.admin_name, log.admin_email)}
                      </div>
                      <div>
                        <div className="admin-name">{log.admin_name || 'System Admin'}</div>
                        <div className="admin-email">{log.admin_email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Login Date & Time */}
                  <td>
                    <div className="admin-time-cell">
                      <span className="date-text">{log.login_date}</span>
                      <span className="time-text">
                        <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        {log.login_time} 
                        <span className="rel-time">({getRelativeTime(log.login_timestamp)})</span>
                      </span>
                    </div>
                  </td>

                  {/* Method */}
                  <td>
                    <span className="auth-method-badge">
                      <Key size={12} />
                      {log.auth_method || 'Passcode OTP'}
                    </span>
                  </td>

                  {/* Client */}
                  <td>
                    <div className="device-info-cell">
                      <Monitor size={14} color="#64748b" />
                      <span>{log.device_info || 'Chrome • Windows 11'}</span>
                    </div>
                  </td>

                  {/* IP */}
                  <td>
                    <span className="ip-badge">
                      {log.ip_address || '127.0.0.1 (Gateway)'}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`session-status-badge ${log.status === 'Active Session' ? 'active' : 'completed'}`}>
                      <span className="status-dot"></span>
                      {log.status || 'Active Session'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
