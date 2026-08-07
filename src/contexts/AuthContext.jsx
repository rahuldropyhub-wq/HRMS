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
            email: email,
            first_name: invitation.first_name,
            last_name: invitation.last_name,
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
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // You can set the redirect URL here if needed when deploying
        // emailRedirectTo: 'http://localhost:5173/dashboard'
      }
    });
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
