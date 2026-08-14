import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { usePresenceTracker, PresenceStatus } from '../hooks/usePresenceTracker';

export { PresenceStatus };

const PresenceContext = createContext();

export const usePresence = () => {
  return useContext(PresenceContext);
};

export const PresenceProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState({});
  const channelRef = useRef(null);

  // Broadcast function to update presence
  const trackPresence = useCallback((payload) => {
    if (!user) return;
    try {
      localStorage.setItem('dropyhub_my_presence', JSON.stringify(payload));
    } catch (e) {}

    if (isSupabaseConfigured && channelRef.current) {
      channelRef.current.track(payload).catch((err) => {
        console.debug('Presence track notice:', err);
      });
    }
  }, [user]);

  const tracker = usePresenceTracker(trackPresence);

  /**
   * Initialize single Supabase Realtime Channel
   */
  useEffect(() => {
    if (!user) {
      setOnlineUsers({});
      return;
    }

    if (isSupabaseConfigured) {
      const channel = supabase.channel('online_presence_room', {
        config: {
          presence: { key: user.id }
        }
      });

      // Register all presence event listeners BEFORE subscribing
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const userMap = {};

          Object.keys(state).forEach((key) => {
            const presences = state[key];
            if (presences && presences.length > 0) {
              userMap[key] = presences[presences.length - 1];
            }
          });

          setOnlineUsers(userMap);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (newPresences && newPresences.length > 0) {
            setOnlineUsers((prev) => ({
              ...prev,
              [key]: newPresences[newPresences.length - 1]
            }));
          }
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          setOnlineUsers((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
        });

      // Subscribe only after attaching listeners
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          const lowerEmail = user?.email ? user.email.toLowerCase() : '';
          const isAdmin = profile?.role === 'admin' || ['test@dropyhub.com', 'manjula.k@dropyhub.com'].includes(lowerEmail) || window.location.pathname.startsWith('/admin');
          const userRole = isAdmin ? 'admin' : (profile?.role || 'employee');

          channel.track({
            user_id: user.id,
            emp_id: profile?.emp_id || user.id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email,
            email: user.email,
            department: profile?.department || 'General',
            role: userRole,
            status: PresenceStatus.ONLINE,
            last_active_at: new Date().toISOString()
          }).catch(() => {});
        }
      });

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          channelRef.current.untrack().catch(() => {});
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } else {
      // Local standalone simulation fallback
      setOnlineUsers({
        [user.id]: {
          user_id: user.id,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email,
          email: user.email,
          department: profile?.department || 'Engineering',
          status: tracker.currentStatus,
          last_active_at: new Date().toISOString()
        }
      });
    }
  }, [user, profile]);

  const value = {
    ...tracker,
    onlineUsers,
    getEmployeePresence: (empIdOrUserId) => {
      if (!empIdOrUserId) return { status: PresenceStatus.OFFLINE };
      const found = Object.values(onlineUsers).find(
        (u) => u.user_id === empIdOrUserId || u.emp_id === empIdOrUserId || u.email === empIdOrUserId
      );
      return found || { status: PresenceStatus.OFFLINE };
    }
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};
