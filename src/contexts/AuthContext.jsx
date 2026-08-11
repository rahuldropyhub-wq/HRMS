import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // 2. Listen for auth changes
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
  }, []);

  const fetchProfile = async (userId) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Fallback: If the database trigger failed and no profile exists, create it manually on first login
    if (!data) {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      
      if (email) {
        // Find their invitation
        const { data: invitation } = await supabase.from('employee_invitations').select('*').eq('email', email).single();
        
        if (invitation) {
          // Create the profile now
          const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
            id: userId,
            emp_id: invitation.raw_data?.empId,
            email: email,
            first_name: invitation.first_name || invitation.raw_data?.firstName,
            last_name: invitation.last_name || invitation.raw_data?.lastName,
            department: invitation.department || invitation.raw_data?.department,
            designation: invitation.designation || invitation.raw_data?.designation,
            phone: invitation.phone || invitation.raw_data?.phone,
            reporting_manager: invitation.raw_data?.manager,
            role: 'employee',
            status: 'active'
          }).select().single();
          
          if (!insertError && newProfile) {
            setProfile(newProfile);
            return;
          } else {
            console.error('Error creating profile manually:', insertError);
          }
        }
      }
    }

    if (data) {
      const email = data.email || (await supabase.auth.getUser())?.data?.user?.email;
      if (email) {
        const { data: inv } = await supabase
          .from('employee_invitations')
          .select('*')
          .or(`email.ilike.${email},raw_data->>personalEmail.ilike.${email},raw_data->>officialEmail.ilike.${email}`)
          .maybeSingle();

        if (inv) {
          const fn = data.first_name || inv.first_name || inv.raw_data?.firstName;
          const ln = data.last_name || inv.last_name || inv.raw_data?.lastName;
          const dept = data.department || inv.department || inv.raw_data?.department;
          const desg = data.designation || inv.designation || inv.raw_data?.designation;
          const ph = data.phone || inv.phone || inv.raw_data?.phone;
          const mgr = data.reporting_manager || inv.raw_data?.manager;

          const updates = {};
          if (fn && fn !== data.first_name) { data.first_name = fn; updates.first_name = fn; }
          if (ln && ln !== data.last_name) { data.last_name = ln; updates.last_name = ln; }
          if (dept && dept !== data.department) { data.department = dept; updates.department = dept; }
          if (desg && desg !== data.designation) { data.designation = desg; updates.designation = desg; }
          if (ph && ph !== data.phone) { data.phone = ph; updates.phone = ph; }
          if (mgr && mgr !== data.reporting_manager) { data.reporting_manager = mgr; updates.reporting_manager = mgr; }

          if (Object.keys(updates).length > 0) {
            await supabase.from('profiles').update(updates).eq('id', userId);
          }
        }
      }
      setProfile(data);
    } else {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const loginWithOtp = async (email) => {
    // SECURITY CHECK: Ensure email exists in employee_invitations before sending OTP
    const { data: invitation, error: invError } = await supabase
      .from('employee_invitations')
      .select('id')
      .eq('email', email)
      .single();

    if (invError || !invitation) {
      return { 
        error: { 
          message: 'This email is not registered. Please ask your administrator to add you first.' 
        } 
      };
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // You can set the redirect URL here if needed when deploying
        // emailRedirectTo: 'http://localhost:5173/dashboard'
      }
    });
    return { data, error };
  };

  const loginAdminWithOtp = async (email) => {
    // Send OTP directly — role check happens after login via ProtectedRoute (profile.role === 'admin')
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    return { data, error };
  };

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    return { data, error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
    
    // Clear mock state if any
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // MOCK LOGIN FOR TESTING UI
  const mockLogin = (role = 'employee') => {
    const mockUser = { id: 'MOCK-123', email: 'test@dropyhub.com' };
    const mockProfile = { 
      id: 'MOCK-123', 
      first_name: 'Test', 
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
