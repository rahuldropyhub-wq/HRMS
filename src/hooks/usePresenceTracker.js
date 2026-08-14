import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Presence Status Enum
 */
export const PresenceStatus = {
  ONLINE: 'online',       // 🟢 Actively working (mouse/keyboard input within threshold)
  IDLE: 'idle',           // 🟡 Away / Inactive (> 3-5 mins without input)
  BREAK: 'break',         // ☕ On Break / Lunch
  BUSY: 'busy',           // 🔴 Busy / Focus mode
  OFFLINE: 'offline'      // ⚪ Disconnected / Logged out
};

const IDLE_TIMEOUT_MS = 3 * 60 * 1000;    // 3 minutes of inactivity -> Mark as Idle

/**
 * Custom hook to track user activity (mouse, keyboard, scroll, tab visibility)
 */
export function usePresenceTracker(onPresenceChange) {
  const { user, profile } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(PresenceStatus.ONLINE);
  const [lastActiveAt, setLastActiveAt] = useState(Date.now());
  const [isTabFocused, setIsTabFocused] = useState(!document.hidden);

  const idleTimerRef = useRef(null);
  const onPresenceChangeRef = useRef(onPresenceChange);

  useEffect(() => {
    onPresenceChangeRef.current = onPresenceChange;
  }, [onPresenceChange]);

  const empId = profile?.emp_id || user?.id || 'guest';
  const empName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : (user?.email || 'Employee');
  const department = profile?.department || 'General';
  const role = profile?.role || 'employee';

  /**
   * Notify status change
   */
  const notifyChange = useCallback((status, metadata = {}) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      emp_id: empId,
      name: empName,
      email: user.email,
      department: department,
      role: role,
      status: status,
      is_tab_focused: !document.hidden,
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...metadata
    };

    if (typeof onPresenceChangeRef.current === 'function') {
      onPresenceChangeRef.current(payload);
    }
  }, [user, empId, empName, department, role]);

  /**
   * Handle user activity (mouse move, keypress, click, scroll)
   */
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    setLastActiveAt(now);

    // If currently marked IDLE, automatically return to ONLINE
    if (currentStatus === PresenceStatus.IDLE || currentStatus === PresenceStatus.OFFLINE) {
      setCurrentStatus(PresenceStatus.ONLINE);
      notifyChange(PresenceStatus.ONLINE);
    }

    // Reset idle countdown timer
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      // Transition to Idle after inactivity threshold
      setCurrentStatus(PresenceStatus.IDLE);
      notifyChange(PresenceStatus.IDLE, { idle_since: new Date().toISOString() });
    }, IDLE_TIMEOUT_MS);
  }, [currentStatus, notifyChange]);

  /**
   * Listen to browser visibility changes (switching tabs / minimizing)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabFocused(isVisible);

      if (!isVisible) {
        notifyChange(currentStatus, { is_tab_focused: false });
      } else {
        handleUserActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [currentStatus, notifyChange, handleUserActivity]);

  /**
   * Listen to global DOM user inputs
   */
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    let throttleTimeout = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleUserActivity();
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(evt => window.addEventListener(evt, throttledHandler, { passive: true }));

    // Start initial idle timer
    idleTimerRef.current = setTimeout(() => {
      setCurrentStatus(PresenceStatus.IDLE);
      notifyChange(PresenceStatus.IDLE);
    }, IDLE_TIMEOUT_MS);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, throttledHandler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, handleUserActivity, notifyChange]);

  // Method to manually set status (e.g., On Break)
  const setManualStatus = useCallback((status) => {
    setCurrentStatus(status);
    notifyChange(status, { manual_override: true });
  }, [notifyChange]);

  return {
    currentStatus,
    lastActiveAt,
    isTabFocused,
    setManualStatus,
    PresenceStatus
  };
}
