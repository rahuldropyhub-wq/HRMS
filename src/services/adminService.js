import { supabase } from '../lib/supabaseClient';

// ─── EMPLOYEES (Profiles) ─────────────────────────────────────────────────────
export const getAllEmployees = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, departments(name), designations(title)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getEmployeeById = async (id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, departments(name), designations(title)')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createEmployee = async (employeeData) => {
  // Create auth user first
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: employeeData.email,
    password: employeeData.password || Math.random().toString(36).slice(-8),
    email_confirm: true,
  });
  if (authError) return { data: null, error: authError };

  // Create profile
  const { data, error } = await supabase
    .from('profiles')
    .insert({ ...employeeData, id: authData.user.id })
    .select()
    .single();
  return { data, error };
};

export const updateEmployee = async (id, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────
export const getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });
  return { data, error };
};

export const createDepartment = async (dept) => {
  const { data, error } = await supabase
    .from('departments')
    .insert(dept)
    .select()
    .single();
  return { data, error };
};

export const updateDepartment = async (id, updates) => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteDepartment = async (id) => {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  return { error };
};

// ─── DESIGNATIONS ─────────────────────────────────────────────────────────────
export const getDesignations = async () => {
  const { data, error } = await supabase
    .from('designations')
    .select('*, departments(name)')
    .order('title', { ascending: true });
  return { data, error };
};

export const createDesignation = async (desig) => {
  const { data, error } = await supabase
    .from('designations')
    .insert(desig)
    .select()
    .single();
  return { data, error };
};

export const updateDesignation = async (id, updates) => {
  const { data, error } = await supabase
    .from('designations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteDesignation = async (id) => {
  const { error } = await supabase.from('designations').delete().eq('id', id);
  return { error };
};

// ─── ATTENDANCE (Admin View) ──────────────────────────────────────────────────
export const getAllAttendanceToday = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, email, departments(name))')
    .eq('date', today)
    .order('check_in', { ascending: true });
  return { data, error };
};

export const getAttendanceByDateRange = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, email, departments(name))')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  return { data, error };
};

export const getWFHRequests = async () => {
  const { data, error } = await supabase
    .from('wfh_requests')
    .select('*, profiles(first_name, last_name, departments(name))')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateWFHStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('wfh_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── LEAVE REQUESTS (Admin) ───────────────────────────────────────────────────
export const getAllLeaveRequests = async () => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, profiles!leave_requests_employee_id_fkey(first_name, last_name, departments(name))')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateLeaveStatus = async (id, status, approvedBy) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status, approved_by: approvedBy })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── TASKS (Admin) ────────────────────────────────────────────────────────────
export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, profiles!tasks_assigned_to_fkey(first_name, last_name), profiles!tasks_assigned_by_fkey(first_name, last_name)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createTask = async (taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
  return { data, error };
};

export const updateTask = async (id, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── WORKSHEETS (Admin Review) ────────────────────────────────────────────────
export const getAllWorksheets = async () => {
  const { data, error } = await supabase
    .from('worksheets')
    .select('*, profiles(first_name, last_name, departments(name))')
    .order('date', { ascending: false });
  return { data, error };
};

export const updateWorksheetStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('worksheets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── TICKETS (Admin Queue) ────────────────────────────────────────────────────
export const getAllTickets = async () => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, profiles(first_name, last_name, departments(name))')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateTicketStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// ─── ASSETS ───────────────────────────────────────────────────────────────────
export const getAllAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createAsset = async (assetData) => {
  const { data, error } = await supabase
    .from('assets')
    .insert(assetData)
    .select()
    .single();
  return { data, error };
};

export const assignAsset = async (assetId, employeeId) => {
  // Update asset status
  await supabase.from('assets').update({ status: 'assigned' }).eq('id', assetId);
  // Create assignment record
  const { data, error } = await supabase
    .from('asset_assignments')
    .insert({ asset_id: assetId, employee_id: employeeId, assigned_date: new Date().toISOString().split('T')[0], status: 'active' })
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

export const createHoliday = async (holiday) => {
  const { data, error } = await supabase
    .from('holidays')
    .insert(holiday)
    .select()
    .single();
  return { data, error };
};

export const deleteHoliday = async (id) => {
  const { error } = await supabase.from('holidays').delete().eq('id', id);
  return { error };
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const getAllAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createAnnouncement = async (announcement) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single();
  return { data, error };
};

// ─── ADMIN DASHBOARD STATS ────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const [employees, attendanceToday, pendingLeaves, openTickets] = await Promise.all([
    supabase.from('profiles').select('id, status', { count: 'exact' }),
    supabase.from('attendance').select('id', { count: 'exact' }).eq('date', today),
    supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'open'),
  ]);
  return {
    totalEmployees: employees.count || 0,
    presentToday: attendanceToday.count || 0,
    pendingLeaves: pendingLeaves.count || 0,
    openTickets: openTickets.count || 0,
  };
};
