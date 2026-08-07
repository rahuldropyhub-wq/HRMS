import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Coffee, SkipForward, Square, CheckCircle2, Clock,
  MapPin, Monitor, Wifi, AlertTriangle, X, Zap, Timer,
  Calendar, TrendingUp, LogIn, LogOut, Briefcase, Building, Home,
  CheckCircle, ShieldAlert, MoreHorizontal, ShieldCheck, ArrowRight
} from 'lucide-react';
import '../../styles/employee/attendance-control.css';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayAttendance, checkIn, startBreak, endBreak, checkOut } from '../../services/employeeService';

// ─── Helpers ────────────────────────────────────────────────────────────────
const OFFICE_START = { h: 9, m: 30 };   // 09:30
const OFFICE_END   = { h: 18, m: 30 };  // 18:30

function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(date) {
  if (!date) return '--:--';
  const h = date.getHours(), m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${pad(h > 12 ? h - 12 : h || 12)}:${pad(m)} ${ampm}`;
}

function formatDuration(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function formatHM(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${pad(h)}h ${pad(m)}m`;
}

function formatDateFull(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function getLateInfo(loginDate) {
  if (!loginDate) return null;
  const officeMinutes = OFFICE_START.h * 60 + OFFICE_START.m;
  const loginMinutes = loginDate.getHours() * 60 + loginDate.getMinutes();
  const diff = loginMinutes - officeMinutes;
  if (diff > 0) return diff;
  return null;
}

function getEarlyLogoutInfo(logoutDate) {
  if (!logoutDate) return null;
  const officeMinutes = OFFICE_END.h * 60 + OFFICE_END.m;
  const logoutMinutes = logoutDate.getHours() * 60 + logoutDate.getMinutes();
  const diff = officeMinutes - logoutMinutes;
  if (diff > 0) return diff;
  return null;
}

function getOvertimeInfo(logoutDate) {
  if (!logoutDate) return null;
  const officeMinutes = OFFICE_END.h * 60 + OFFICE_END.m;
  const logoutMinutes = logoutDate.getHours() * 60 + logoutDate.getMinutes();
  const diff = logoutMinutes - officeMinutes;
  if (diff > 0) return diff;
  return null;
}

const BREAK_REASONS = [
  { label: 'Tea Break', emoji: '☕' },
  { label: 'Lunch Break', emoji: '🍱' },
  { label: 'Personal', emoji: '🧍' },
  { label: 'Meeting', emoji: '📋' },
  { label: 'Other', emoji: '⋯' },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AttendanceControlCenter({ compact = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Live clock
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState('notStarted'); // notStarted | working | onBreak | completed
  const [workMode, setWorkMode] = useState(null); // office | home
  const [locationDetails, setLocationDetails] = useState(null);
  
  const [workStartTime, setWorkStartTime] = useState(null);
  const [workEndTime, setWorkEndTime] = useState(null);
  const [breaks, setBreaks] = useState([]);            // [{start, end, reason, duration}]
  const [currentBreakStart, setCurrentBreakStart] = useState(null);
  const [timeline, setTimeline] = useState([]);

  // Computed seconds
  const [totalWorkSecs, setTotalWorkSecs] = useState(0);
  const [totalBreakSecs, setTotalBreakSecs] = useState(0);

  // Modals
  const [showWorkModeModal, setShowWorkModeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('office'); // temporary selection before confirm
  
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('verifying'); // verifying | success | warning
  
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [wfhReason, setWfhReason] = useState('Client Meeting');

  const [attendanceId, setAttendanceId] = useState(null);

  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakReason, setBreakReason] = useState('Tea Break');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showWorksheetModal, setShowWorksheetModal] = useState(false);
  const [worksheetSubmitted, setWorksheetSubmitted] = useState(false);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Hydrate from DB
  useEffect(() => {
    const loadAttendance = async () => {
      if (!user?.id) return;
      const { data, error } = await getTodayAttendance(user.id);
      
      if (data) {
        setAttendanceId(data.id);
        
        if (data.check_in) {
          const todayStr = new Date().toISOString().split('T')[0];
          const st = new Date(`${todayStr}T${data.check_in}`);
          setWorkStartTime(st);
          
          if (data.check_out) {
            setStatus('completed');
            setWorkEndTime(new Date(`${todayStr}T${data.check_out}`));
          } else {
            setStatus('working');
          }
          
          if (data.breaks && Array.isArray(data.breaks)) {
            const parsedBreaks = data.breaks.map(b => ({
              ...b,
              start: new Date(`${todayStr}T${b.start}`),
              end: b.end ? new Date(`${todayStr}T${b.end}`) : null
            }));
            setBreaks(parsedBreaks);
            
            // Check if there is an ongoing break
            const ongoingBreak = parsedBreaks.find(b => !b.end);
            if (ongoingBreak && status !== 'completed') {
              setStatus('onBreak');
              setCurrentBreakStart(ongoingBreak.start);
            }
          }
        }
      }
    };
    loadAttendance();
  }, [user]);

  // Live timer calculation
  useEffect(() => {
    if (!workStartTime) return;

    // Total break seconds (completed breaks)
    const completedBreakSecs = breaks.reduce((acc, b) => acc + (b.duration || 0), 0);

    // Current break in progress
    const currentBreakSecs = currentBreakStart
      ? Math.floor((now - currentBreakStart) / 1000)
      : 0;

    const allBreakSecs = completedBreakSecs + currentBreakSecs;
    const elapsed = Math.floor((now - workStartTime) / 1000);
    const workSecs = elapsed - allBreakSecs;

    setTotalWorkSecs(Math.max(0, workSecs));
    setTotalBreakSecs(allBreakSecs);
  }, [now, workStartTime, breaks, currentBreakStart]);

  // ── Actions ──
  const handleInitiateWork = () => {
    setShowWorkModeModal(true);
  };

  const handleConfirmWorkMode = () => {
    setShowWorkModeModal(false);
    if (selectedMode === 'office') {
      setShowGpsModal(true);
      setGpsStatus('verifying');
      // Simulate GPS Check
      setTimeout(() => {
        // Randomly simulate success or warning for demonstration
        const isInside = Math.random() > 0.3; // 70% chance of success
        setGpsStatus(isInside ? 'success' : 'warning');
      }, 2000);
    } else {
      setShowWfhModal(true);
    }
  };

  const handleStartWork = useCallback(async (mode, details) => {
    if (!user?.id) return;
    
    // Call backend
    const { data, error } = await checkIn(user.id, mode, details.reason, { lat: details.lat, lng: details.lng, address: details.address });
    if (error) {
      console.error('Check-in failed:', error);
      // Fallback to local state if offline or error
    } else if (data) {
      setAttendanceId(data.id);
    }

    const t = new Date();
    setWorkStartTime(t);
    setStatus('working');
    setWorkMode(mode);
    setLocationDetails(details);
    
    setShowGpsModal(false);
    setShowWfhModal(false);

    setTimeline([{
      type: 'work-start',
      label: 'Started Work',
      sub: `Mode: ${mode === 'office' ? 'Work From Office' : 'Work From Home'} • Location: ${details.address}`,
      time: formatTime(t),
      ts: t,
    }]);
  }, [user]);

  const handleGpsSuccess = () => {
    handleStartWork('office', {
      address: 'Madhapur HQ, Hyderabad, IN',
      lat: '17.4486',
      lng: '78.3908'
    });
  };

  const handleWfhSubmit = () => {
    handleStartWork('home', {
      address: 'Remote Location (Verified)',
      lat: '17.3850',
      lng: '78.4867',
      reason: wfhReason
    });
  };

  const handleOpenBreakModal = () => {
    if (status !== 'working') return;
    setBreakReason('Tea Break');
    setShowBreakModal(true);
  };

  const handleStartBreak = useCallback(async () => {
    if (attendanceId) {
      await startBreak(attendanceId, breaks, breakReason);
    }

    const t = new Date();
    setCurrentBreakStart(t);
    setStatus('onBreak');
    setShowBreakModal(false);
    setTimeline(prev => [...prev, {
      type: 'break-start',
      label: 'Break Started',
      sub: breakReason,
      time: formatTime(t),
      ts: t,
    }]);
  }, [breakReason, attendanceId, breaks]);

  const handleResumeWork = useCallback(async () => {
    const t = new Date();
    const dur = Math.floor((t - currentBreakStart) / 1000);
    
    if (attendanceId) {
      await endBreak(attendanceId, breaks, breaks.length); // Next break index
    }

    setBreaks(prev => [...prev, { start: currentBreakStart, end: t, reason: breakReason, duration: dur }]);
    setCurrentBreakStart(null);
    setStatus('working');
    setTimeline(prev => [...prev, {
      type: 'break-end',
      label: 'Break Ended',
      sub: `Duration: ${formatHM(dur)} — ${breakReason}`,
      time: formatTime(t),
      ts: t,
    }]);
  }, [currentBreakStart, breakReason, attendanceId, breaks]);

  const handleClickEndWork = () => {
    if (status === 'onBreak') return; // must resume first
    if (!worksheetSubmitted) {
      setShowWorksheetModal(true);
      return;
    }
    confirmEndWork();
  };

  const confirmEndWork = async () => {
    if (user?.id) {
      await checkOut(user.id);
    }
    
    const t = new Date();
    setWorkEndTime(t);
    setStatus('completed');
    setShowEndModal(false);
    setShowWorksheetModal(false);
    setTimeline(prev => [...prev, {
      type: 'work-end',
      label: 'Work Completed',
      sub: `Total: ${formatHM(totalWorkSecs)} net working`,
      time: formatTime(t),
      ts: t,
    }]);
  };

  // ── Computed ──
  const lateMinutes = getLateInfo(workStartTime);
  const earlyMinutes = workEndTime ? getEarlyLogoutInfo(workEndTime) : null;
  const overtimeMinutes = workEndTime ? getOvertimeInfo(workEndTime) : null;
  const netWorkSecs = Math.max(0, totalWorkSecs);

  const expectedLogout = () => {
    if (!workStartTime) return `${pad(OFFICE_END.h > 12 ? OFFICE_END.h - 12 : OFFICE_END.h)}:${pad(OFFICE_END.m)} PM`;
    return `06:30 PM`;
  };

  // ── Status Label ──
  const statusMeta = {
    notStarted: { label: 'Not Started', cls: 'not-started' },
    working: { label: 'Working', cls: 'working' },
    onBreak: { label: 'On Break', cls: 'on-break' },
    completed: { label: 'Completed', cls: 'completed' },
  }[status];

  // ── Current time string ──
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="acc-wrapper">

      {/* ── STATUS BAR ── */}
      <div className="acc-status-bar">
        <div className="acc-status-left">
          <div className="acc-status-title">Attendance Control Center</div>
          <div className={`acc-status-badge ${statusMeta.cls}`}>
            <span className="acc-status-dot" />
            {statusMeta.label}
          </div>
          {lateMinutes && status !== 'notStarted' && (
            <div className="acc-alert warn" style={{ padding: '4px 10px', fontSize: 12 }}>
              <AlertTriangle size={13} /> Late by {lateMinutes} min
            </div>
          )}
          {status === 'completed' && (
            <div className="acc-alert success" style={{ padding: '4px 10px', fontSize: 12 }}>
              <CheckCircle2 size={13} /> Attendance Closed
            </div>
          )}
        </div>
        <div className="acc-status-right">
          <div className="acc-date-time">
            <div className="acc-live-time">{timeStr} <span style={{ fontSize: 13, fontWeight: 500 }}>{ampm}</span></div>
            <div className="acc-live-date">{formatDateFull(now)}</div>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="acc-dark-theme">

        {/* ── COLUMN 1: ACTION CARD ── */}
        <div className="acc-dark-card action-card">
          <div className="acc-landscape"></div>
          <div className="acc-dark-header">
            <div className="acc-dark-title">
              <div className="acc-icon-box lightning">
                <Zap size={14} fill="currentColor" />
              </div>
              ACTIONS
            </div>
            <MoreHorizontal size={20} color="#64748b" style={{cursor: 'pointer'}} />
          </div>

          <div className="acc-hero-section">
            <div className="glowing-ring" style={status === 'working' ? {background: 'linear-gradient(#0c1120, #0c1120) padding-box, linear-gradient(135deg, #4ade80, #10b981) border-box', boxShadow: '0 0 30px rgba(34,197,94,0.2), inset 0 0 20px rgba(34,197,94,0.1)'} : status === 'onBreak' ? {background: 'linear-gradient(#0c1120, #0c1120) padding-box, linear-gradient(135deg, #c084fc, #a855f7) border-box', boxShadow: '0 0 30px rgba(168,85,247,0.2), inset 0 0 20px rgba(168,85,247,0.1)'} : {}}>
              {status === 'notStarted' && <Briefcase size={40} strokeWidth={1.5} color="#00f2fe" />}
              {status === 'working' && <Clock size={40} strokeWidth={1.5} color="#4ade80" />}
              {status === 'onBreak' && <Coffee size={40} strokeWidth={1.5} color="#c084fc" />}
              {status === 'completed' && <CheckCircle2 size={40} strokeWidth={1.5} color="#00f2fe" />}
            </div>
            
            {status === 'notStarted' && (
              <>
                <h3>Ready to Start?</h3>
                <p>Click below to record your office check-in.</p>
                <button className="acc-neon-btn" onClick={handleInitiateWork}>
                  <Play size={18} fill="currentColor" /> START WORK
                </button>
              </>
            )}

            {status === 'working' && (
              <>
                <h3>Checked In</h3>
                <p>You are currently logged in and working.</p>
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button className="acc-neon-btn" style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)', color: '#000', padding: '12px 20px', fontSize: 13 }} onClick={handleOpenBreakModal}>
                    <Coffee size={16} /> Break
                  </button>
                  <button className="acc-neon-btn" style={{ background: 'linear-gradient(to right, #ef4444, #f87171)', color: '#fff', padding: '12px 20px', fontSize: 13 }} onClick={handleClickEndWork}>
                    <Square size={16} fill="currentColor" /> End Work
                  </button>
                </div>
              </>
            )}

            {status === 'onBreak' && (
              <>
                <h3>On Break</h3>
                <p>Your break timer is currently running.</p>
                <button className="acc-neon-btn" style={{ background: 'linear-gradient(to right, #a855f7, #c084fc)', color: '#fff' }} onClick={handleResumeWork}>
                  <SkipForward size={18} fill="currentColor" /> RESUME WORK
                </button>
              </>
            )}

            {status === 'completed' && (
              <>
                <h3>Session Closed</h3>
                <p>Great job! Your attendance is recorded for today.</p>
                <button className="acc-neon-btn" disabled>
                  <CheckCircle2 size={18} /> COMPLETED
                </button>
              </>
            )}
          </div>

          <div className="acc-mini-cards">
            <div className="acc-mini-card">
              <div className="acc-mini-icon purple">
                <MapPin size={18} />
              </div>
              <h4>Smart Location</h4>
              <p>Auto GPS Tracking</p>
            </div>
            <div className="acc-mini-card">
              <div className="acc-mini-icon green">
                <ShieldCheck size={18} />
              </div>
              <h4>Secure Check-In</h4>
              <p>100% Verified</p>
            </div>
            <div className="acc-mini-card">
              <div className="acc-mini-icon orange">
                <Clock size={18} />
              </div>
              <h4>Live Sync</h4>
              <p>Real-time Updates</p>
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: SESSION INFO ── */}
        <div className="acc-dark-card session-card">
          <div className="acc-dark-header">
            <div className="acc-dark-title">
              <div className="acc-icon-box timer">
                <Timer size={14} />
              </div>
              WORK SESSION
            </div>
            <MoreHorizontal size={20} color="#64748b" style={{cursor: 'pointer'}} />
          </div>

          <div className="acc-session-list">
            <div className="acc-timeline-track"></div>

            <div className="acc-session-row-dark">
              <div className="acc-row-icon green">
                <ArrowRight size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Check In</span>
                {workStartTime ? (
                  <span className="acc-row-value">{formatTime(workStartTime)}</span>
                ) : (
                  <span className="acc-pill red">Not Checked In</span>
                )}
              </div>
            </div>

            <div className="acc-session-row-dark">
              <div className="acc-row-icon blue">
                <Building size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Office Timing</span>
                <span className="acc-row-value">
                  09:30 AM – 06:30 PM
                  <span className="sub">( 9h 0m Total )</span>
                </span>
              </div>
            </div>

            <div className="acc-session-row-dark">
              <div className="acc-row-icon teal">
                <Clock size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Expected Logout</span>
                <span className="acc-row-value teal">06:30 PM</span>
              </div>
            </div>

            <div className="acc-session-row-dark">
              <div className="acc-row-icon orange">
                <Timer size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Current Working Time</span>
                {workStartTime ? (
                  <span className="acc-row-value">{formatDuration(totalWorkSecs)}</span>
                ) : (
                  <span className="acc-row-value muted">—<span className="sub">Not Started</span></span>
                )}
              </div>
            </div>

            <div className="acc-session-row-dark">
              <div className="acc-row-icon purple">
                <Coffee size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Break Time</span>
                {workStartTime ? (
                  <span className="acc-row-value">{formatDuration(totalBreakSecs)}</span>
                ) : (
                  <span className="acc-row-value muted">—<span className="sub">Not Started</span></span>
                )}
              </div>
            </div>

            <div className="acc-session-row-dark" style={{ borderBottom: 'none' }}>
              <div className="acc-row-icon pink">
                <TrendingUp size={16} />
              </div>
              <div className="acc-row-content">
                <span className="acc-row-label">Net Working Time</span>
                {workStartTime ? (
                  <span className="acc-row-value">{formatHM(netWorkSecs)}</span>
                ) : (
                  <span className="acc-row-value muted">—<span className="sub">Not Started</span></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ── COLUMN 3: TIMELINE ── */}
        <div className="acc-card">
          <div className="acc-card-title"><Calendar size={13} /> Today's Timeline</div>
          {timeline.length === 0 ? (
            <div className="acc-timeline-empty">No activity yet. Start work to begin.</div>
          ) : (
            <div className="acc-timeline">
              {timeline.map((item, i) => (
                <div key={i} className="acc-timeline-item">
                  <div className="acc-timeline-left">
                    <div className={`acc-timeline-dot ${item.type}`}>
                      {item.type === 'work-start' && <Play size={12} />}
                      {item.type === 'break-start' && <Coffee size={12} />}
                      {item.type === 'break-end' && <SkipForward size={12} />}
                      {item.type === 'work-end' && <CheckCircle2 size={12} />}
                    </div>
                    {i < timeline.length - 1 && <div className="acc-timeline-line" />}
                  </div>
                  <div className="acc-timeline-content">
                    <div className="acc-timeline-action">{item.label}</div>
                    {item.sub && <div className="acc-timeline-sub">{item.sub}</div>}
                    <div className="acc-timeline-time">{item.time}</div>
                  </div>
                </div>
              ))}

              {/* Live "currently working" indicator */}
              {status === 'working' && (
                <div className="acc-timeline-item">
                  <div className="acc-timeline-left">
                    <div className="acc-timeline-dot work-start" style={{ background: '#f0fdf4', animation: 'pulse-dot 1.5s infinite' }}>
                      <Clock size={12} />
                    </div>
                  </div>
                  <div className="acc-timeline-content">
                    <div className="acc-timeline-action" style={{ color: '#16a34a' }}>Currently Working...</div>
                    <div className="acc-timeline-time">{formatDuration(totalWorkSecs)}</div>
                  </div>
                </div>
              )}

              {status === 'onBreak' && (
                <div className="acc-timeline-item">
                  <div className="acc-timeline-left">
                    <div className="acc-timeline-dot break-start" style={{ animation: 'pulse-dot 1.5s infinite' }}>
                      <Coffee size={12} />
                    </div>
                  </div>
                  <div className="acc-timeline-content">
                    <div className="acc-timeline-action" style={{ color: '#ea580c' }}>On Break...</div>
                    <div className="acc-timeline-time">
                      {currentBreakStart ? formatDuration(Math.floor((now - currentBreakStart) / 1000)) : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        

      {/* ── SUMMARY STRIP ── */}
      {!compact && (
        <div className="acc-summary-grid">
          <div className="acc-summary-item">
            <div className="acc-summary-label">Status</div>
            <div className={`acc-summary-value ${status === 'notStarted' ? '' : status === 'completed' ? 'present' : 'present'}`}>
              {status === 'notStarted' ? 'Absent' : status === 'completed' ? 'Present' : 'Present'}
            </div>
          </div>
          <div className="acc-summary-item">
            <div className="acc-summary-label">Working Hours</div>
            <div className="acc-summary-value">{totalWorkSecs > 0 ? formatHM(totalWorkSecs) : '—'}</div>
          </div>
          <div className="acc-summary-item">
            <div className="acc-summary-label">Break Hours</div>
            <div className="acc-summary-value">{totalBreakSecs > 0 ? formatHM(totalBreakSecs) : '—'}</div>
          </div>
          <div className="acc-summary-item">
            <div className="acc-summary-label">Net Working</div>
            <div className="acc-summary-value net-color">{netWorkSecs > 0 ? formatHM(netWorkSecs) : '—'}</div>
          </div>
        </div>
      )}

      {/* ── BREAK REASON MODAL ── */}
      {showBreakModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="acc-modal-title">Start a Break</div>
              <button onClick={() => setShowBreakModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <p className="acc-modal-desc">Select a reason for your break (optional).</p>
            <div className="acc-break-reasons">
              {BREAK_REASONS.map(r => (
                <div
                  key={r.label}
                  className={`acc-break-reason-option ${breakReason === r.label ? 'selected' : ''}`}
                  onClick={() => setBreakReason(r.label)}
                >
                  <span className="acc-break-reason-icon">{r.emoji}</span>
                  {r.label}
                </div>
              ))}
            </div>
            <div className="acc-modal-actions">
              <button className="acc-modal-btn secondary" onClick={() => setShowBreakModal(false)}>Cancel</button>
              <button className="acc-modal-btn primary" style={{ background: '#ea580c' }} onClick={handleStartBreak}>
                Start Break
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSHEET VALIDATION MODAL ── */}
      {showWorksheetModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box">
            <div className="acc-modal-icon warn"><AlertTriangle size={26} /></div>
            <div className="acc-modal-title">Worksheet Not Submitted</div>
            <p className="acc-modal-desc">
              You have not submitted today's worksheet yet.<br /><br />
              <strong>Please complete and submit your daily worksheet</strong> before ending your work session. Your attendance will be incomplete without it.
            </p>
            <div className="acc-modal-actions">
              <button className="acc-modal-btn secondary" onClick={() => setShowWorksheetModal(false)}>Cancel</button>
              <button className="acc-modal-btn primary" onClick={() => {
                setWorksheetSubmitted(true);
                setShowWorksheetModal(false);
                navigate('/worksheet');
              }}>
                Go to Worksheet
              </button>
            </div>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', textDecoration: 'underline' }}
                onClick={() => { setWorksheetSubmitted(true); setShowWorksheetModal(false); setTimeout(confirmEndWork, 100); }}
              >
                I have already submitted — End Work anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORK MODE MODAL ── */}
      {showWorkModeModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="acc-modal-title">Start Today's Work</div>
              <button onClick={() => setShowWorkModeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <p className="acc-modal-desc">Select your work mode for today.</p>
            
            <div className="acc-work-modes">
              <div className={`acc-mode-card ${selectedMode === 'office' ? 'selected' : ''}`} onClick={() => setSelectedMode('office')}>
                <div className="acc-mode-icon"><Building size={24} /></div>
                <div className="acc-mode-title">Work From Office</div>
                <div className="acc-mode-desc">Verify via GPS location</div>
              </div>
              <div className={`acc-mode-card ${selectedMode === 'home' ? 'selected' : ''}`} onClick={() => setSelectedMode('home')}>
                <div className="acc-mode-icon"><Home size={24} /></div>
                <div className="acc-mode-title">Work From Home</div>
                <div className="acc-mode-desc">Remote login tracking</div>
              </div>
            </div>

            <div className="acc-modal-actions">
              <button className="acc-modal-btn secondary" onClick={() => setShowWorkModeModal(false)}>Cancel</button>
              <button className="acc-modal-btn primary" onClick={handleConfirmWorkMode}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GPS VALIDATION MODAL (WFO) ── */}
      {showGpsModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button onClick={() => setShowGpsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <div className="acc-gps-container">
              <div className="acc-gps-icon-wrapper">
                {gpsStatus === 'verifying' && (
                  <>
                    <div className="acc-gps-circle pulse"></div>
                    <div className="acc-gps-circle pulse" style={{ animationDelay: '0.5s' }}></div>
                  </>
                )}
                <div className={`acc-gps-pin ${gpsStatus === 'warning' ? 'warning' : ''}`} style={{ color: gpsStatus === 'warning' ? '#dc2626' : gpsStatus === 'success' ? '#16a34a' : '#3b82f6' }}>
                  {gpsStatus === 'verifying' && <MapPin size={32} />}
                  {gpsStatus === 'success' && <CheckCircle size={32} />}
                  {gpsStatus === 'warning' && <ShieldAlert size={32} />}
                </div>
              </div>

              {gpsStatus === 'verifying' && (
                <>
                  <div className="acc-gps-status">Verifying Office Location...</div>
                  <div className="acc-gps-detail">Fetching your GPS coordinates</div>
                </>
              )}

              {gpsStatus === 'success' && (
                <>
                  <div className="acc-gps-status" style={{ color: '#16a34a' }}>Location Verified!</div>
                  <div className="acc-gps-detail">You are within the office radius.</div>
                  <button className="acc-modal-btn primary" style={{ width: '100%', marginTop: 24 }} onClick={handleGpsSuccess}>
                    Start Work Now
                  </button>
                </>
              )}

              {gpsStatus === 'warning' && (
                <>
                  <div className="acc-gps-status" style={{ color: '#dc2626' }}>Outside Office Premises</div>
                  <div className="acc-gps-detail">Distance: 1.6 KM from HQ</div>
                  <div className="acc-modal-actions" style={{ width: '100%', marginTop: 24 }}>
                    <button className="acc-modal-btn secondary" onClick={() => {
                      setGpsStatus('verifying');
                      setTimeout(() => setGpsStatus('success'), 1500); // simulate retry success
                    }}>Retry</button>
                    <button className="acc-modal-btn primary" onClick={() => {
                      setShowGpsModal(false);
                      setShowWfhModal(true);
                    }}>Switch to WFH</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WFH REASON MODAL ── */}
      {showWfhModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="acc-modal-title">Work From Home</div>
              <button onClick={() => setShowWfhModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="acc-alert success" style={{ marginBottom: 16 }}>
              <CheckCircle size={14} /> Remote Location Verified
            </div>

            <div className="acc-wfh-form">
              <label>Reason for Remote Work (Optional)</label>
              <select value={wfhReason} onChange={(e) => setWfhReason(e.target.value)}>
                <option value="Internet Issue">Internet Issue at Office</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Personal Approval">Personal / Manager Approved</option>
                <option value="Medical Reason">Medical Reason</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="acc-modal-actions" style={{ marginTop: 8 }}>
              <button className="acc-modal-btn secondary" onClick={() => setShowWfhModal(false)}>Cancel</button>
              <button className="acc-modal-btn primary" onClick={handleWfhSubmit}>
                Start Remote Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
