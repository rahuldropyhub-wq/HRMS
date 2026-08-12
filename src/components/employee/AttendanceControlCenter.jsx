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
import { getTodayAttendance, checkIn, startBreak, endBreak, checkOut, getIdleHistory } from '../../services/employeeService';
import { supabase } from '../../lib/supabaseClient';

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

function formatDurationDigital(seconds) {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
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

// ─── Circular Timer Helper ──────────────────────────────────────────────────
function CircularTimer({ seconds, color, backgroundRingColor }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // assuming 9 hours (32400 seconds) is 100%
  const progress = Math.min(seconds / 32400, 1);
  const offset = circumference - progress * circumference;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;

  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx="80" cy="80" r="70" stroke={backgroundRingColor} strokeWidth="14" fill="none" />
        <circle 
          cx="80" cy="80" r="70" 
          stroke={color} 
          strokeWidth="14" 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, transform: 'translateY(2px)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{timeStr}</div>
        <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginTop: 2 }}>Hrs</div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: -2 }}>Today</div>
      </div>
    </div>
  );
}

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
  const [totalIdleSecs, setTotalIdleSecs] = useState(0);

  // Modals
  const [showWorkModeModal, setShowWorkModeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('office'); // temporary selection before confirm
  
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('verifying'); // verifying | success | warning
  
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [wfhReason, setWfhReason] = useState('Client Meeting');

  const [attendanceId, setAttendanceId] = useState(null);
  const [dbError, setDbError] = useState(null);

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
          const todayStr = data.date;
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

    setTotalWorkSecs(workSecs > 0 ? workSecs : 0);
    setTotalBreakSecs(allBreakSecs);
  }, [now, workStartTime, breaks, currentBreakStart]);

  // Extension Module 7: Poll Idle History
  useEffect(() => {
    if (!attendanceId) return;

    const fetchIdle = async () => {
      const { data, error } = await getIdleHistory(attendanceId);
      if (error) {
        console.error('Error fetching idle history:', error);
      } else if (data) {
        const totalIdle = data.reduce((sum, record) => sum + (record.duration_seconds || 0), 0);
        setTotalIdleSecs(totalIdle);
      }
    };

    fetchIdle(); // Fetch immediately
    
    // Then poll every 30 seconds
    const interval = setInterval(fetchIdle, 30000);
    return () => clearInterval(interval);
  }, [attendanceId]);

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
    setDbError(null);
    const { data, error } = await checkIn(user.id, mode, details.reason, { lat: details.lat, lng: details.lng, address: details.address });
    if (error) {
      console.error('Check-in failed:', error);
      setDbError(error.message || JSON.stringify(error));
      return; // Stop here if it fails
    } else if (data) {
      setAttendanceId(data.id);
      
      // 🔥 MODULE 4: Trigger Chrome Extension Sync
      supabase.auth.getSession().then(({ data: sessionData }) => {
        window.postMessage({
          type: 'HRMS_SESSION_START',
          payload: {
            employeeId: user.id,
            attendanceId: data.id,
            token: sessionData?.session?.access_token
          }
        }, '*');
      });
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
  const overtimeSecs = Math.max(0, totalWorkSecs - (9 * 3600));
  
  // Extension Mock Data (Will be connected to backend in Module 7)

  const extensionStatus = 'Working'; // 'Working', 'Idle', or 'Offline'

  const expectedLogout = () => {
    if (!workStartTime) return `${pad(OFFICE_END.h > 12 ? OFFICE_END.h - 12 : OFFICE_END.h)}:${pad(OFFICE_END.m)} PM`;
    return `06:30 PM`;
  };

  return (
    <div className="acc-wrapper">

      <div className="acc-light-overview">
        {/* Header */}
        <div className="acc-lo-header">
          <div className="acc-lo-title">
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <span>Attendance Overview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`acc-status-badge ${status === 'working' ? 'working' : status === 'onBreak' ? 'on-break' : status === 'completed' ? 'completed' : 'not-started'}`}>
              <span className="acc-status-dot"></span>
              {status === 'working' ? 'Active Session' : status === 'onBreak' ? 'On Break' : status === 'completed' ? 'Shift Completed' : 'Shift Not Started'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="acc-lo-body">
          {/* Timer Ring */}
          <div className="acc-lo-timer-wrapper">
            <CircularTimer 
              seconds={status === 'onBreak' ? Math.floor((now - currentBreakStart) / 1000) : totalWorkSecs} 
              color={status === 'onBreak' ? '#f59e0b' : '#10b981'} 
              backgroundRingColor={status === 'onBreak' ? '#fef3c7' : '#d1fae5'} 
            />
          </div>

          {/* Structured Modern Metric Grid */}
          <div className="acc-lo-stats-grid">
            
            <div className="acc-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="acc-metric-icon" style={{ background: '#dcfce7', color: '#059669' }}><LogIn size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Check In</span>
                <span className="acc-metric-val" style={{ color: '#059669' }}>{workStartTime ? formatTime(workStartTime) : '--:--'}</span>
              </div>
            </div>

            <div className="acc-metric-card" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="acc-metric-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><LogOut size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Check Out</span>
                <span className="acc-metric-val" style={{ color: '#4338ca' }}>{workEndTime ? formatTime(workEndTime) : '--:-- --'}</span>
              </div>
            </div>

            <div className="acc-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="acc-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Coffee size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Break Time</span>
                <span className="acc-metric-val">{totalBreakSecs > 0 ? formatDurationDigital(totalBreakSecs) : '00:00'}</span>
              </div>
            </div>

            <div className="acc-metric-card" style={{ borderLeft: '4px solid #f97316' }}>
              <div className="acc-metric-icon" style={{ background: '#ffedd5', color: '#ea580c' }}><Clock size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Idle Time</span>
                <span className="acc-metric-val" style={{ color: totalIdleSecs > 0 ? '#ea580c' : 'inherit' }}>
                  {totalIdleSecs > 0 ? formatDurationDigital(totalIdleSecs) : '00:00'}
                </span>
              </div>
            </div>

            <div className="acc-metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="acc-metric-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><Briefcase size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Working Time</span>
                <span className="acc-metric-val" style={{ color: '#1e40af' }}>{totalWorkSecs > 0 ? formatDurationDigital(totalWorkSecs) : '00:00'}</span>
              </div>
            </div>

            <div className="acc-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="acc-metric-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}><TrendingUp size={16} /></div>
              <div className="acc-metric-info">
                <span className="acc-metric-label">Overtime</span>
                <span className="acc-metric-val" style={{ color: '#7c3aed' }}>{overtimeSecs > 0 ? formatDurationDigital(overtimeSecs) : '00:00'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Ribbon */}
        <div className="acc-lo-footer">
          <div className="acc-lo-location">
            <MapPin size={16} strokeWidth={2.5} /> Mode: <strong style={{ marginLeft: 4 }}>Office</strong>
          </div>
          <div className="acc-lo-status">
            <span className="acc-status-item">
              Punctuality: <strong style={{ color: '#16a34a', whiteSpace: 'nowrap' }}>On Time</strong>
              <div className="acc-lo-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
            </span>
            <span className="acc-status-item">
              Extension: <strong style={{ color: extensionStatus === 'Working' ? '#16a34a' : '#f59e0b', whiteSpace: 'nowrap' }}>{extensionStatus}</strong>
              <div className="acc-lo-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: extensionStatus === 'Working' ? '#10b981' : (extensionStatus === 'Idle' ? '#f59e0b' : '#ef4444'), flexShrink: 0 }} />
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="acc-lo-btn-container">
          {status === 'notStarted' && (
            <button className="acc-lo-btn primary hero-action-pulse" onClick={handleInitiateWork}>
              <Play size={18} fill="currentColor" /> Start Shift Work
            </button>
          )}
          {status === 'working' && (
            <>
              <button className="acc-lo-btn break" onClick={handleOpenBreakModal}>
                <Coffee size={18} /> Take Break
              </button>
              <button className="acc-lo-btn end" onClick={handleClickEndWork}>
                <Square size={18} fill="currentColor" /> End Work Shift
              </button>
            </>
          )}
          {status === 'onBreak' && (
            <button className="acc-lo-btn primary hero-action-pulse" onClick={handleResumeWork}>
              <Play size={18} fill="currentColor" /> Resume Work Shift
            </button>
          )}
          {dbError && (
            <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
              Database Error: {dbError}
            </div>
          )}

          {status === 'idle' && (
            <div className="ar-action-box">
              {/* Other idle states */}
            </div>
          )}
        </div>
      </div>


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
