import { supabase } from '../lib/supabaseClient';

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, departments(name), designations(title)')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const getMyAttendance = async (userId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  return { data, error };
};

export const checkIn = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5); // HH:MM

  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('employee_id', userId)
    .eq('date', today)
    .single();

  if (existing) return { error: { message: 'Already checked in today.' } };

  const { data, error } = await supabase
    .from('attendance')
    .insert({ employee_id: userId, date: today, check_in: now, status: 'present' })
    .select()
    .single();
  return { data, error };
};

export const checkOut = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  const { data: record } = await supabase
    .from('attendance')
    .select('id, check_in')
    .eq('employee_id', userId)
    .eq('date', today)
    .single();

  if (!record) return { error: { message: 'No check-in found for today.' } };

  // Calculate total hours
  const checkInTime = new Date(`${today}T${record.check_in}`);
  const checkOutTime = new Date(`${today}T${now}`);
  const totalHours = ((checkOutTime - checkInTime) / 3600000).toFixed(2);

  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out: now, total_hours: totalHours })
    .eq('id', record.id)
    .select()
    .single();
  return { data, error };
};

// ─── LEAVE ────────────────────────────────────────────────────────────────────
export const getMyLeaves = async (userId) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const applyLeave = async (leaveData) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(leaveData)
    .select()
    .single();
  return { data, error };
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const getMyTasks = async (userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, profiles!tasks_assigned_by_fkey(first_name, last_name)')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateTaskStatus = async (taskId, status) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();
  return { data, error };
};

// ─── WORKSHEETS ───────────────────────────────────────────────────────────────
export const getMyWorksheets = async (userId) => {
  const { data, error } = await supabase
    .from('worksheets')
    .select('*')
    .eq('employee_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};

export const submitWorksheet = async (worksheetData) => {
  const { data, error } = await supabase
    .from('worksheets')
    .insert(worksheetData)
    .select()
    .single();
  return { data, error };
};

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const getMyTickets = async (userId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('employee_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const raiseTicket = async (ticketData) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select()
    .single();
  return { data, error };
};

// ─── HOLIDAYS ─────────────────────────────────────────────────────────────────
export const getHolidays = async () => {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .order('date', { ascending: true });
  return { data, error };
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(10);
  return { data, error };
};

// ─── ASSETS (Employee view) ───────────────────────────────────────────────────
export const getMyAssets = async (userId) => {
  const { data, error } = await supabase
    .from('asset_assignments')
    .select('*, assets(*)')
    .eq('employee_id', userId)
    .eq('status', 'active');
  return { data, error };
};
