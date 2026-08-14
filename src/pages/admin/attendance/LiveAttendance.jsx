import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, LayoutGrid, List,
  Coffee, Building2, Wifi, TrendingUp,
  Video, LogOut, ChevronDown, ChevronUp, Clock, Activity, Zap
} from 'lucide-react';
import '../../../styles/admin/attendance/live-attendance.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import PresenceBadge from '../../../components/common/PresenceBadge';
import { usePresence, PresenceStatus } from '../../../contexts/PresenceContext';
import { getAllAttendanceToday } from '../../../services/adminService';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatHHMM(timeStr) {
  if (!timeStr) return '--:--';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function mapDbStatus(s) {
  switch ((s || '').toLowerCase()) {
    case 'present': return 'Working';
    case 'wfh': return 'Working';
    case 'late': return 'Working';
    case 'on_break': return 'On Break';
    case 'half_day': return 'Working';
    case 'absent': return 'Not In';
    default: return 'Working';
  }
}

function mapWorkMode(m) {
  switch ((m || '').toLowerCase()) {
    case 'home':
    case 'wfh': return 'WFH';
    default: return 'Office';
  }
}

function minsToHHMM(mins) {
  if (!mins || mins <= 0) return '00h 00m';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

/** Convert break.duration (seconds) → minutes */
function secsToMins(secs) { return Math.round((secs || 0) / 60); }

/** HH:MM difference in minutes */
function diffMins(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

/** Net working = total elapsed − total break */
function computeNetMins(checkIn, checkOut, totalBreakHrs) {
  const today = new Date().toTimeString().slice(0, 5);
  const end = checkOut || today;
  const gross = diffMins(checkIn, end);
  const breakMins = Math.round((parseFloat(totalBreakHrs) || 0) * 60);
  return Math.max(0, gross - breakMins);
}

function isLate(checkIn) {
  if (!checkIn) return false;
  const [h, m] = checkIn.split(':').map(Number);
  return (h * 60 + m) > (9 * 60 + 30);
}

function getStatusClass(status) {
  switch (status) {
    case 'Working': return 'working';
    case 'On Break': return 'onbreak';
    case 'In Meeting': return 'meeting';
    default: return 'notin';
  }
}

// ── Break Timeline Component ───────────────────────────────────────────────────
const BreakTimeline = ({ breaks }) => {
  if (!breaks || breaks.length === 0) {
    return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No breaks taken</span>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {breaks.map((b, i) => {
        const durMins = b.duration ? secsToMins(b.duration) : (b.end ? diffMins(b.start, b.end) : null);
        const ongoing = !b.end;
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px',
              background: ongoing ? '#fef9c3' : '#f8fafc',
              border: `1px solid ${ongoing ? '#fde68a' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            <Coffee size={12} color={ongoing ? '#d97706' : '#94a3b8'} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Break {i + 1}
            </span>
            <span style={{ color: '#059669', fontWeight: 600 }}>{formatHHMM(b.start)}</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span style={{ color: ongoing ? '#d97706' : '#ef4444', fontWeight: 600 }}>
              {b.end ? formatHHMM(b.end) : 'Ongoing'}
            </span>
            {durMins !== null && (
              <span style={{
                marginLeft: 'auto',
                background: ongoing ? '#fef3c7' : '#fee2e2',
                color: ongoing ? '#92400e' : '#991b1b',
                padding: '1px 7px',
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 11,
              }}>
                {ongoing ? '🟡 Active' : `${durMins}m`}
              </span>
            )}
            {b.reason && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ({b.reason})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Expanded Row ───────────────────────────────────────────────────────────────
const ExpandedRow = ({ emp }) => {
  const totalBreakMins = Math.round((parseFloat(emp.totalBreakHrs) || 0) * 60);
  const netMins = computeNetMins(emp.checkIn, emp.checkOut, emp.totalBreakHrs);
  const grossMins = diffMins(emp.checkIn, emp.checkOut || new Date().toTimeString().slice(0, 5));

  return (
    <tr>
      <td colSpan={8} style={{ padding: 0, background: 'var(--bg-tertiary)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--border-primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Left: Break Timeline */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                <Coffee size={11} style={{ marginRight: 5 }} /> Break History
              </div>
              <BreakTimeline breaks={emp.breaks} />
            </div>

            {/* Right: Time Summary */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                <Clock size={11} style={{ marginRight: 5 }} /> Time Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { lbl: 'Check In', val: formatHHMM(emp.checkIn), color: '#059669', bg: '#dcfce7' },
                  { lbl: 'Check Out', val: emp.checkOut ? formatHHMM(emp.checkOut) : 'Active', color: emp.checkOut ? '#dc2626' : '#d97706', bg: emp.checkOut ? '#fee2e2' : '#fef3c7' },
                  { lbl: 'Total Time', val: minsToHHMM(grossMins), color: '#6366f1', bg: '#ede9fe' },
                  { lbl: 'Break Time', val: minsToHHMM(totalBreakMins), color: '#d97706', bg: '#fef3c7' },
                  { lbl: 'Net Work Time', val: minsToHHMM(netMins), color: '#2563eb', bg: '#dbeafe', span: true },
                ].map(item => (
                  <div
                    key={item.lbl}
                    style={{
                      padding: '10px 14px',
                      background: item.bg,
                      borderRadius: 10,
                      gridColumn: item.span ? '1 / -1' : undefined,
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                      {item.lbl}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </td>
    </tr>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const LiveAttendance = () => {
  const navigate = useNavigate();
  const { onlineUsers, getEmployeePresence } = usePresence();

  const [view, setView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [presenceFilter, setPresenceFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [expandedRow, setExpandedRow] = useState(null); // employee id

  const fetchAttendance = async () => {
    setLoading(true);
    setDbError(null);
    const { data, error } = await getAllAttendanceToday();

    if (error) {
      console.error('LiveAttendance:', error);
      setDbError(error?.message || JSON.stringify(error));
      setEmployees([]);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const formatted = data.map(r => {
        const breaks = Array.isArray(r.breaks) ? r.breaks : [];
        const calculatedBreakSecs = breaks.reduce((sum, b) => {
          if (typeof b.duration === 'number' && !isNaN(b.duration) && b.duration > 0) {
            return sum + b.duration;
          }
          if (b.start && b.end) {
            const sMins = diffMins(b.start, b.end);
            return sum + (sMins * 60);
          }
          return sum;
        }, 0);

        const dbBreakSecs = Math.round((parseFloat(r.total_break_hours) || 0) * 3600);
        const finalBreakSecs = Math.max(calculatedBreakSecs, dbBreakSecs);
        const breakMins = Math.round(finalBreakSecs / 60);
        const totalBreakHrs = parseFloat((finalBreakSecs / 3600).toFixed(2));

        const netMins = r.total_hours ? Math.round(parseFloat(r.total_hours) * 60) : computeNetMins(r.check_in, r.check_out, totalBreakHrs);
        const grossMins = diffMins(r.check_in, r.check_out || new Date().toTimeString().slice(0, 5));

        // Count active (ongoing) breaks
        const onBreakNow = breaks.some(b => b.start && !b.end);

        // Override status if actively on break
        const dbStatus = onBreakNow ? 'On Break' : mapDbStatus(r.status);

        const progress = Math.min(100, Math.round((netMins / 540) * 100)); // 9h = 540 min

        return {
          id: r.employee_id,
          firstName: r.profiles?.first_name || 'Unknown',
          lastName: r.profiles?.last_name || '',
          empId: r.profiles?.emp_id || r.employee_id?.substring(0, 8),
          dept: r.profiles?.departments?.name || r.profiles?.department || 'General',
          status: dbStatus,
          mode: mapWorkMode(r.work_mode),
          checkIn: r.check_in || null,
          checkOut: r.check_out || null,
          timeIn: formatHHMM(r.check_in),
          timeOut: r.check_out ? formatHHMM(r.check_out) : null,
          late: isLate(r.check_in),
          breaks,
          breakCount: breaks.length,
          onBreakNow,
          totalBreakHrs,
          breakMinStr: minsToHHMM(breakMins),
          netMins,
          netWorkStr: minsToHHMM(netMins),
          grossMins,
          grossStr: minsToHHMM(grossMins),
          progress,
        };
      });
      setEmployees(formatted);
    } else {
      setEmployees([]);
    }
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...Array.from(new Set(employees.map(e => e.dept).filter(Boolean)))
      .sort().map(d => ({ value: d, label: d }))
  ];

  const filtered = employees.filter(emp => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const presence = getEmployeePresence(emp.id);
    return (
      name.includes(searchTerm.toLowerCase()) &&
      (deptFilter ? emp.dept === deptFilter : true) &&
      (statusFilter ? emp.status === statusFilter : true) &&
      (modeFilter ? emp.mode === modeFilter : true) &&
      (presenceFilter ? presence?.status === presenceFilter : true)
    );
  });

  const ADMIN_EMAILS = ['test@dropyhub.com', 'manjula.k@dropyhub.com'];
  const isUserAdmin = (u) => u.role === 'admin' || (u.email && ADMIN_EMAILS.includes(u.email.toLowerCase()));

  // Calculate live presence counts strictly for non-admin employees
  const liveActiveCount = Object.values(onlineUsers).filter(u => u.status === PresenceStatus.ONLINE && !isUserAdmin(u)).length;
  const liveIdleCount = Object.values(onlineUsers).filter(u => u.status === PresenceStatus.IDLE && !isUserAdmin(u)).length;

  const stats = {
    working: employees.filter(e => e.status === 'Working').length,
    activeNow: liveActiveCount,
    idleAway: liveIdleCount,
    onBreak: employees.filter(e => e.status === 'On Break').length,
    meeting: employees.filter(e => e.status === 'In Meeting').length,
    notIn: employees.filter(e => e.status === 'Not In').length,
    office: employees.filter(e => e.mode === 'Office').length,
    wfh: employees.filter(e => e.mode === 'WFH').length,
  };

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="la-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ─ Header ─────────────────────────────────────────────────────── */}
      <div className="la-header">
        <div className="la-header-left">
          <h1>Live Attendance & Activity Radar</h1>
          <p>
            Real-time Microsoft Teams-style presence tracking · Last synced {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {' · '}{employees.length} checked in today
          </p>
        </div>
        <div className="la-header-right">
          <button className="la-refresh-btn" onClick={fetchAttendance}>
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="la-live-pill">
            <div className="la-live-dot" /> Realtime Sync Active
          </div>
        </div>
      </div>

      {/* ─ Error ──────────────────────────────────────────────────────── */}
      {dbError && (
        <div className="la-error-banner">
          <strong>⚠️ Database Error: {dbError}</strong>
          <div className="la-error-sub">Likely a Supabase RLS policy issue. Run the SQL fix in your Supabase dashboard.</div>
        </div>
      )}

      {/* ─ Stat Cards ─────────────────────────────────────────────────── */}
      <div className="la-stats-grid">
        {[
          { cls: 'working', icon: <Zap size={18} color="#10b981" />, val: stats.activeNow, lbl: '🟢 Active Working', trend: 'up' },
          { cls: 'meeting', icon: <Activity size={18} color="#f59e0b" />, val: stats.idleAway, lbl: '🟡 Away / Idle', trend: 'neu' },
          { cls: 'break', icon: <Coffee size={18} color="#f97316" />, val: stats.onBreak, lbl: '☕ On Break', trend: 'neu' },
          { cls: 'office', icon: <Building2 size={18} color="#6366f1" />, val: stats.office, lbl: '🏢 In Office', trend: 'neu' },
          { cls: 'wfh', icon: <Wifi size={18} color="#ec4899" />, val: stats.wfh, lbl: '🏠 Remote WFH', trend: 'neu' },
          { cls: 'notin', icon: <LogOut size={18} color="#94a3b8" />, val: stats.notIn, lbl: '⚪ Not In', trend: 'down' },
        ].map(s => (
          <div key={s.cls} className={`la-stat-card ${s.cls}`}>
            <div className="la-stat-icon-row">
              <div className="la-stat-icon" style={{ background: 'var(--bg-tertiary)' }}>{s.icon}</div>
              <span className={`la-stat-trend ${s.trend}`}>
                {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '—'}
              </span>
            </div>
            <div className="la-stat-val">{s.val}</div>
            <div className="la-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ─ Toolbar ────────────────────────────────────────────────────── */}
      <div className="la-toolbar">
        <div className="la-search">
          <Search size={16} />
          <input
            placeholder="Search employee name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="la-filter-item" style={{ width: 180, flexShrink: 0 }}>
          <CustomDropdown fullWidth value={deptFilter} onChange={setDeptFilter} options={deptOptions} />
        </div>
        <div className="la-filter-item" style={{ width: 170, flexShrink: 0 }}>
          <CustomDropdown fullWidth value={presenceFilter} onChange={setPresenceFilter} options={[
            { value: '', label: 'All Live Presence' },
            { value: 'online', label: '🟢 Active Now' },
            { value: 'idle', label: '🟡 Away / Idle' },
            { value: 'break', label: '☕ On Break' },
            { value: 'offline', label: '⚪ Offline' },
          ]} />
        </div>
        <div className="la-filter-item" style={{ width: 150, flexShrink: 0 }}>
          <CustomDropdown fullWidth value={modeFilter} onChange={setModeFilter} options={[
            { value: '', label: 'All Modes' },
            { value: 'Office', label: '🏢 Office' },
            { value: 'WFH', label: '🏠 WFH' },
          ]} />
        </div>

        <div className="la-toolbar-right">
          <div className="la-divider" />
          <div className="la-view-toggle">
            <button className={`la-view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Table view"><List size={16} /></button>
            <button className={`la-view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Card view"><LayoutGrid size={16} /></button>
          </div>
        </div>
      </div>

      {/* ─ States ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="la-state-box">
          <div className="la-spinner" />
          <h3>Loading live attendance...</h3>
          <p>Fetching today's check-in records from the server</p>
        </div>
      ) : employees.length === 0 && !dbError ? (
        <div className="la-state-box">
          <div className="la-state-icon">📭</div>
          <h3>No check-ins yet today</h3>
          <p>Employees who have checked in will appear here. Auto-refreshes every minute.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="la-state-box">
          <div className="la-state-icon">🔍</div>
          <h3>No employees match your filters</h3>
          <p>Try clearing the search or filters.</p>
        </div>
      ) : view === 'table' ? (

        /* ─── TABLE VIEW ──────────────────────────────────────────────── */
        <AnimatePresence mode="wait">
          <motion.div key="table" className="la-table-card"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="la-table-header">
              <h3>Today's Attendance <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>— click any row to see break details</span></h3>
              <span className="la-count-pill">{filtered.length} employees</span>
            </div>

            <table className="la-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Live Presence</th>
                  <th>Status</th>
                  <th>Mode</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Break Time</th>
                  <th>Net Work Hrs</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => {
                  const presence = getEmployeePresence(emp.id);
                  return (
                    <React.Fragment key={emp.id}>
                      <motion.tr
                        className={expandedRow === emp.id ? 'selected-row' : ''}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => toggleRow(emp.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Employee */}
                        <td>
                          <div className="la-emp-cell">
                            <div className="la-avatar" style={{ position: 'relative' }}>
                              {emp.firstName[0]}{emp.lastName ? emp.lastName[0] : ''}
                              <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                                <PresenceBadge status={presence?.status || (emp.onBreakNow ? 'break' : emp.status === 'Working' ? 'online' : 'offline')} size="sm" />
                              </div>
                            </div>
                            <div>
                              <div className="la-emp-name">{emp.firstName} {emp.lastName}</div>
                              <div className="la-emp-dept">
                                {emp.empId && <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)', marginRight: 5 }}>{emp.empId}</span>}
                                {emp.dept}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Live Presence Pill */}
                        <td>
                          <PresenceBadge 
                            status={presence?.status || (emp.onBreakNow ? 'break' : emp.status === 'Working' ? 'online' : 'offline')} 
                            showLabel={true}
                            idleSince={presence?.idle_since} 
                          />
                        </td>

                        {/* Attendance Status */}
                        <td>
                          <span className={`la-status ${getStatusClass(emp.status)}`}>
                            <span className="la-status-dot" />
                            {emp.status}
                          </span>
                        </td>

                      {/* Mode */}
                      <td>
                        <span className={`la-mode ${emp.mode === 'Office' ? 'office' : 'wfh'}`}>
                          {emp.mode === 'Office' ? '🏢' : '🏠'} {emp.mode}
                        </span>
                      </td>

                      {/* Check In */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>{emp.timeIn}</span>
                          {emp.late && <span className="la-late-badge">⚠ Late</span>}
                        </div>
                      </td>

                      {/* Check Out */}
                      <td>
                        <span style={{
                          fontSize: 13, fontWeight: emp.checkOut ? 700 : 400,
                          color: emp.checkOut ? '#dc2626' : 'var(--text-muted)'
                        }}>
                          {emp.timeOut || '—'}
                        </span>
                      </td>

                      {/* Break Time */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{
                            fontWeight: 700, fontSize: 13,
                            color: emp.onBreakNow ? '#d97706' : emp.breakCount > 0 ? '#f59e0b' : 'var(--text-muted)'
                          }}>
                            {emp.onBreakNow ? '🟡 On Break' : (emp.breakCount > 0 ? emp.breakMinStr : '—')}
                          </span>
                          {emp.breakCount > 0 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {emp.breakCount} break{emp.breakCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Net Work Hrs */}
                      <td>
                        <div className="la-hours-cell">
                          <span className="la-hours-text">{emp.netWorkStr}</span>
                          <div className="la-hours-bar-bg">
                            <div className="la-hours-bar-fill" style={{ width: `${emp.progress}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Progress + expand toggle */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: emp.progress >= 100 ? '#059669' : emp.progress >= 50 ? '#6366f1' : '#f59e0b'
                          }}>
                            {emp.progress}%
                            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>of 9h</span>
                          </span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                            {expandedRow === emp.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded break details row */}
                    {expandedRow === emp.id && <ExpandedRow emp={emp} />}
                  </React.Fragment>
                );
              })}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>

      ) : (

        /* ─── CARD GRID VIEW ──────────────────────────────────────────── */
        <AnimatePresence mode="wait">
          <motion.div key="grid" className="la-card-grid"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {filtered.map((emp, i) => {
              const presence = getEmployeePresence(emp.id);
              return (
                <motion.div
                  key={emp.id}
                  className="la-emp-card"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/admin/employees/${emp.id}`)}
                >
                  {/* Card Top */}
                  <div className="la-card-top">
                    <div className="la-card-avatar-row">
                      <div className="la-card-avatar" style={{ position: 'relative' }}>
                        {emp.firstName[0]}{emp.lastName ? emp.lastName[0] : ''}
                        <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                          <PresenceBadge status={presence?.status || (emp.onBreakNow ? 'break' : emp.status === 'Working' ? 'online' : 'offline')} size="sm" />
                        </div>
                      </div>
                      <div>
                        <div className="la-card-name">{emp.firstName} {emp.lastName}</div>
                        <div className="la-card-dept">{emp.dept}</div>
                      </div>
                    </div>
                    <div className="la-card-badges">
                      <PresenceBadge 
                        status={presence?.status || (emp.onBreakNow ? 'break' : emp.status === 'Working' ? 'online' : 'offline')} 
                        showLabel={true}
                        idleSince={presence?.idle_since} 
                      />
                      <span className={`la-mode ${emp.mode === 'Office' ? 'office' : 'wfh'}`}>
                        {emp.mode === 'Office' ? '🏢' : '🏠'} {emp.mode}
                      </span>
                      {emp.late && <span className="la-late-badge">⚠ Late</span>}
                    </div>
                  </div>

                {/* Card Bottom — Time + Break Metrics */}
                <div className="la-card-bottom">
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Check In</span>
                    <span className="la-card-metric-val" style={{ color: '#059669' }}>{emp.timeIn}</span>
                  </div>
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Check Out</span>
                    <span className="la-card-metric-val" style={{ color: emp.checkOut ? '#dc2626' : 'var(--text-muted)' }}>
                      {emp.timeOut || '—'}
                    </span>
                  </div>
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Break Time</span>
                    <span className="la-card-metric-val" style={{ color: '#d97706' }}>
                      {emp.breakCount > 0 ? emp.breakMinStr : '—'}
                    </span>
                  </div>
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Breaks Taken</span>
                    <span className="la-card-metric-val">{emp.breakCount || 0}</span>
                  </div>
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Total Time</span>
                    <span className="la-card-metric-val" style={{ color: '#6366f1' }}>{emp.grossStr}</span>
                  </div>
                  <div className="la-card-metric">
                    <span className="la-card-metric-lbl">Net Worked</span>
                    <span className="la-card-metric-val" style={{ color: '#2563eb' }}>{emp.netWorkStr}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="la-card-progress">
                    <div className="la-card-progress-label">
                      <span>Daily Goal (9h)</span>
                      <span style={{ fontWeight: 700, color: emp.progress >= 100 ? '#059669' : emp.progress >= 50 ? '#6366f1' : '#f59e0b' }}>
                        {emp.progress}%
                      </span>
                    </div>
                    <div className="la-card-progress-bar-bg">
                      <div className="la-card-progress-bar" style={{ width: `${emp.progress}%` }} />
                    </div>
                  </div>

                  {/* Break mini-list */}
                  {emp.breakCount > 0 && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        Break History
                      </div>
                      <BreakTimeline breaks={emp.breaks} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default LiveAttendance;
