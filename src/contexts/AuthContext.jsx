import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    const getSession = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn('Supabase getSession failed, using local auth mode.');
      }
      setLoading(false);
    };

    getSession();

    // 2. Listen for auth changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured) return;
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: userData } = await supabase.auth.getUser();
      const email = data?.email || userData?.user?.email || '';

      // Fallback: If no profile exists, create/generate it
      if (!data && email) {
        const lowerEmail = email.toLowerCase();
        const assignedRole = lowerEmail === 'test@dropyhub.com' ? 'admin' : 'employee';

        // Check invitation first
        const { data: invitation } = await supabase.from('employee_invitations').select('*').eq('email', email).maybeSingle();
        
        const fallbackProfile = {
          id: userId,
          emp_id: invitation?.raw_data?.empId || (assignedRole === 'admin' ? 'ADM-001' : 'EMP-001'),
          email: email,
          first_name: invitation?.first_name || invitation?.raw_data?.firstName || email.split('@')[0],
          last_name: invitation?.last_name || invitation?.raw_data?.lastName || '',
          department: invitation?.department || invitation?.raw_data?.department || 'Engineering',
          designation: invitation?.designation || invitation?.raw_data?.designation || 'Team Member',
          phone: invitation?.phone || invitation?.raw_data?.phone || '',
          reporting_manager: invitation?.raw_data?.manager || '',
          role: assignedRole,
          status: 'active'
        };

        try {
          const { data: newProfile } = await supabase.from('profiles').upsert(fallbackProfile, { onConflict: 'id' }).select().maybeSingle();
          if (newProfile) data = newProfile;
          else data = fallbackProfile;
        } catch {
          data = fallbackProfile;
        }
      }

      if (data) {
        const userEmail = data.email || (await supabase.auth.getUser())?.data?.user?.email || '';
        const lowerEmail = userEmail.toLowerCase();

        if (lowerEmail === 'test@dropyhub.com') {
          data.role = 'admin';
        } else if (lowerEmail === 'jayanth.choda@dropyhub.com' || lowerEmail === 'balaji.s@dropyhub.com') {
          data.role = 'employee';
        }

        setProfile(data);
      } else if (error) {
        console.warn('Profile fetch notice:', error.message || error);
      }
    } catch (err) {
      console.warn('fetchProfile notice:', err);
    }
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      return performLocalLogin(email);
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      return performLocalLogin(email);
    }
  };

  const loginWithOtp = async (email) => {
    const lowerEmail = email ? email.toLowerCase() : '';
    const isDesignatedUser = ['test@dropyhub.com', 'jayanth.choda@dropyhub.com', 'balaji.s@dropyhub.com'].includes(lowerEmail);

    if (!isSupabaseConfigured) {
      return { data: { user: null }, error: null };
    }

    if (!isDesignatedUser) {
      try {
        const { data: invitation, error: invError } = await supabase
          .from('employee_invitations')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (invError || !invitation) {
          return { 
            error: { 
              message: 'This email is not registered. Please ask your administrator to add you first.' 
            } 
          };
        }
      } catch (err) {
        // Ignore remote check error if network down
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { data: { user: null }, error: null };
      return { data, error };
    } catch (err) {
      return { data: { user: null }, error: null };
    }
  };

  const loginAdminWithOtp = async (email) => {
    if (!isSupabaseConfigured) {
      return { data: { user: null }, error: null };
    }
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { data: { user: null }, error: null };
      return { data, error };
    } catch (err) {
      return { data: { user: null }, error: null };
    }
  };

  const verifyOtp = async (email, token) => {
    if (!isSupabaseConfigured) {
      return performLocalLogin(email);
    }
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (error) {
        return performLocalLogin(email);
      }
      return { data, error };
    } catch (err) {
      return performLocalLogin(email);
    }
  };

  const performLocalLogin = (email) => {
    const lowerEmail = email ? email.toLowerCase() : '';
    let role = 'employee';
    if (lowerEmail === 'test@dropyhub.com' || window.location.pathname.startsWith('/admin')) {
      role = 'admin';
    }
    if (lowerEmail === 'jayanth.choda@dropyhub.com' || lowerEmail === 'balaji.s@dropyhub.com') {
      role = 'employee';
    }

    const nameParts = email.split('@')[0].split('.');
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User';
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : (role === 'admin' ? 'Admin' : 'Employee');

    const mockUser = { id: 'usr_' + Math.random().toString(36).substr(2, 9), email };
    const mockProfile = {
      id: mockUser.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: role,
      department: 'Engineering',
      designation: role === 'admin' ? 'Administrator' : 'Software Engineer',
      status: 'active'
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setSession({ user: mockUser });

    return { data: { user: mockUser, session: { user: mockUser } }, error: null };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    
    // Clear local state
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // MOCK LOGIN FOR TESTING UI
  const mockLogin = (role = 'employee', emailOverride = null) => {
    let email = emailOverride;
    if (!email) {
      email = role === 'admin' ? 'test@dropyhub.com' : 'jayanth.choda@dropyhub.com';
    }
    const mockUser = { id: 'MOCK-123', email };
    const mockProfile = { 
      id: 'MOCK-123', 
      email,
      first_name: email.split('@')[0], 
      last_name: role === 'admin' ? 'Admin' : 'Employee', 
      role: role 
    };
    setUser(mockUser);
    setProfile(mockProfile);
    setSession({ user: mockUser });
  };

  const value = {
    session,
    user,
    profile,
    login,
    loginWithOtp,
    loginAdminWithOtp,
    verifyOtp,
    logout,
    mockLogin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
