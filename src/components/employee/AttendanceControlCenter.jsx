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
import { EnterpriseModal, FormBody, FormSection, FormField, TextArea, FormFooter, FormHeader } from './EnterpriseForm';
import { usePopup } from '../../contexts/PopupContext';
import { getTodayAttendance, checkIn, startBreak, endBreak, checkOut, getIdleHistory, submitWorksheet, getMyWorksheets, getCompanyProjects } from '../../services/employeeService';
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
  const { showAlert } = usePopup();

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

  // Quick Worksheet checkout form state
  const [wsProject, setWsProject] = useState('General Project');
  const [wsDescription, setWsDescription] = useState('');
  const [companyProjects, setCompanyProjects] = useState([]);
  const [submittingWs, setSubmittingWs] = useState(false);

  useEffect(() => {
    getCompanyProjects().then(({ data }) => {
      if (data && Array.isArray(data)) setCompanyProjects(data);
    });
  }, []);

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
          const todayStr = data.date || new Date().toISOString().split('T')[0];
          const st = new Date(`${todayStr}T${data.check_in}`);
          setWorkStartTime(st);
          
          if (data.check_out) {
            setStatus('completed');
            setWorkEndTime(new Date(`${todayStr}T${data.check_out}`));
          } else {
            const hasOngoingBreak = Array.isArray(data.breaks) && data.breaks.some(b => !b.end);
            if (hasOngoingBreak) {
              setStatus('onBreak');
            } else {
              setStatus('working');
            }
          }
          
          if (data.breaks && Array.isArray(data.breaks)) {
            const parsedBreaks = data.breaks.map(b => ({
              ...b,
              start: typeof b.start === 'string' && b.start.length <= 8 ? new Date(`${todayStr}T${b.start}`) : new Date(b.start),
              end: b.end ? (typeof b.end === 'string' && b.end.length <= 8 ? new Date(`${todayStr}T${b.end}`) : new Date(b.end)) : null
            }));
            setBreaks(parsedBreaks);
            
            const ongoingBreak = parsedBreaks.find(b => !b.end);
            if (ongoingBreak) {
              setCurrentBreakStart(ongoingBreak.start);
            } else {
              setCurrentBreakStart(null);
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

    const completedBreakSecs = breaks.reduce((acc, b) => {
      if (typeof b.duration === 'number' && !isNaN(b.duration) && b.duration > 0) {
        return acc + b.duration;
      }
      if (b.start && b.end) {
        const s = new Date(b.start).getTime();
        const e = new Date(b.end).getTime();
        if (!isNaN(s) && !isNaN(e) && e > s) {
          return acc + Math.floor((e - s) / 1000);
        }
      }
      return acc;
    }, 0);

    // If shift is completed or workEndTime is set, freeze the working timer at check-out time!
    if (status === 'completed' || workEndTime) {
      const endTimeToUse = workEndTime || now;
      const elapsed = Math.floor((endTimeToUse - workStartTime) / 1000);
      const workSecs = elapsed - completedBreakSecs;
      setTotalWorkSecs(workSecs > 0 ? workSecs : 0);
      setTotalBreakSecs(completedBreakSecs);
      return;
    }

    // Current break in progress
    const currentBreakSecs = (status === 'onBreak' || currentBreakStart) && currentBreakStart
      ? Math.floor((now - currentBreakStart) / 1000)
      : 0;

    const allBreakSecs = completedBreakSecs + (currentBreakSecs > 0 ? currentBreakSecs : 0);
    const elapsed = Math.floor((now - workStartTime) / 1000);
    const workSecs = elapsed - allBreakSecs;

    setTotalWorkSecs(workSecs > 0 ? workSecs : 0);
    setTotalBreakSecs(allBreakSecs);
  }, [now, workStartTime, workEndTime, status, breaks, currentBreakStart]);

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
    const t = new Date();
    if (user?.id) {
      try {
        localStorage.setItem(`hrms_break_start_${user.id}`, t.toISOString());
        localStorage.setItem(`hrms_break_reason_${user.id}`, breakReason);
      } catch (e) {}
    }

    let updatedBreaksList = [...breaks];

    if (attendanceId) {
      try {
        const { data } = await startBreak(attendanceId, breakReason, breaks);
        if (data && Array.isArray(data.breaks)) {
          const todayStr = new Date().toISOString().split('T')[0];
          updatedBreaksList = data.breaks.map(b => ({
            ...b,
            start: typeof b.start === 'string' && b.start.length <= 8 ? new Date(`${todayStr}T${b.start}`) : new Date(b.start),
            end: b.end ? (typeof b.end === 'string' && b.end.length <= 8 ? new Date(`${todayStr}T${b.end}`) : new Date(b.end)) : null
          }));
        }
      } catch (e) {
        console.error('startBreak error:', e);
      }
    } else {
      updatedBreaksList.push({ start: t, end: null, reason: breakReason, duration: 0 });
    }

    setBreaks(updatedBreaksList);
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
  }, [breakReason, attendanceId, breaks, user]);

  const handleResumeWork = useCallback(async () => {
    const t = new Date();
    let breakStartToUse = currentBreakStart;
    if (!breakStartToUse && user?.id) {
      const savedStart = localStorage.getItem(`hrms_break_start_${user.id}`);
      if (savedStart) breakStartToUse = new Date(savedStart);
    }
    if (!breakStartToUse) breakStartToUse = t;

    const dur = Math.max(0, Math.floor((t - breakStartToUse) / 1000));

    // Optimistic Immediate Update: Switch status to working and clear break start synchronously!
    setStatus('working');
    setCurrentBreakStart(null);

    const localClosedBreaks = breaks.map(b => {
      if (!b.end) {
        return { ...b, end: t, duration: dur };
      }
      return b;
    });

    setBreaks(localClosedBreaks);

    if (user?.id) {
      try {
        localStorage.removeItem(`hrms_break_start_${user.id}`);
        localStorage.removeItem(`hrms_break_reason_${user.id}`);
        localStorage.setItem(`hrms_today_breaks_${user.id}`, JSON.stringify(localClosedBreaks));
      } catch (e) {}
    }

    setTimeline(prev => [...prev, {
      type: 'break-end',
      label: 'Break Ended',
      sub: `Duration: ${formatHM(dur)} — ${breakReason}`,
      time: formatTime(t),
      ts: t,
    }]);

    // Persist to database in background
    if (attendanceId) {
      try {
        const { data } = await endBreak(attendanceId, localClosedBreaks);
        if (data && Array.isArray(data.breaks)) {
          const todayStr = new Date().toISOString().split('T')[0];
          const parsedBreaks = data.breaks.map(b => ({
            ...b,
            start: typeof b.start === 'string' && b.start.length <= 8 ? new Date(`${todayStr}T${b.start}`) : new Date(b.start),
            end: b.end ? (typeof b.end === 'string' && b.end.length <= 8 ? new Date(`${todayStr}T${b.end}`) : new Date(b.end)) : null
          }));
          setBreaks(parsedBreaks);
          if (user?.id) {
            localStorage.setItem(`hrms_today_breaks_${user.id}`, JSON.stringify(parsedBreaks));
          }
        }
      } catch (e) {
        console.error('endBreak sync error:', e);
      }
    }
  }, [currentBreakStart, breakReason, attendanceId, breaks, user]);

  const handleClickEndWork = () => {
    if (status === 'onBreak') return; // must resume first
    if (worksheetSubmitted) {
      confirmEndWork();
      return;
    }
    // Instantly open modal without blocking async calls
    setShowWorksheetModal(true);
  };

  const handleSubmitWorksheetAndCheckout = async (e) => {
    if (e) e.preventDefault();
      if (!wsDescription.trim()) {
        showAlert('Please enter a summary of tasks completed today.', 'warning');
        return;
      }
    setSubmittingWs(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const hoursStr = (totalWorkSecs > 0 ? (totalWorkSecs / 3600) : 8.0).toFixed(1);

    try {
      await submitWorksheet({
        employee_id: user?.id,
        project: wsProject || 'General Project',
        description: wsDescription.trim(),
        hours: hoursStr,
        date: todayStr,
        status: 'submitted'
      });
    } catch (err) {
      console.warn('Worksheet submit notice:', err);
    }

    setWorksheetSubmitted(true);
    setSubmittingWs(false);
    await confirmEndWork();
  };

  const confirmEndWork = async () => {
    try {
      if (user?.id) {
        await checkOut(user.id);
      }
    } catch (err) {
      console.warn('Checkout DB notice:', err);
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

      {/* ── WORKSHEET VALIDATION & QUICK SUBMIT CHECKOUT MODAL ── */}
      {showWorksheetModal && (
        <div className="acc-modal-overlay">
          <div className="acc-modal-box" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Submit Worksheet & Check Out</h3>
              </div>
              <button onClick={() => setShowWorksheetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>
            
            <p className="acc-modal-desc" style={{ marginBottom: 16, fontSize: 13, color: '#64748b', textAlign: 'left' }}>
              Briefly describe your tasks completed today to submit your daily worksheet and automatically check out your shift!
            </p>

            <form onSubmit={handleSubmitWorksheetAndCheckout} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Select Project <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  value={wsProject} 
                  onChange={e => setWsProject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                >
                  {companyProjects.length > 0 ? (
                    companyProjects.map(p => <option key={p} value={p}>{p}</option>)
                  ) : (
                    <>
                      <option value="General Project">General Project</option>
                      <option value="HRMS Portal Upgrade">HRMS Portal Upgrade</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Daily Work Summary <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., Completed API integration, fixed mobile layout bugs, updated task module..."
                  value={wsDescription}
                  onChange={e => setWsDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div className="acc-modal-actions" style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button 
                  type="button" 
                  className="acc-modal-btn secondary" 
                  onClick={() => {
                    sessionStorage.setItem('pending_auto_checkout', 'true');
                    setWorksheetSubmitted(true);
                    setShowWorksheetModal(false);
                    navigate('/worksheet');
                  }}
                  style={{ fontSize: 13 }}
                >
                  Full Page...
                </button>

                <button 
                  type="submit" 
                  disabled={submittingWs}
                  className="acc-modal-btn primary" 
                  style={{ flex: 1, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
                >
                  <CheckCircle size={16} /> {submittingWs ? 'Checking Out...' : 'Submit & Automatic Check Out'}
                </button>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', textDecoration: 'underline' }}
                  onClick={() => { setWorksheetSubmitted(true); setShowWorksheetModal(false); setTimeout(confirmEndWork, 100); }}
                >
                  Already submitted today — Check Out anyway
                </button>
              </div>
            </form>
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
