import { supabase } from '../lib/supabaseClient';

// ─── EMPLOYEES (Profiles) ─────────────────────────────────────────────────────
export const getAllEmployees = async () => {
  const [profilesRes, invitationsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, departments(name), designations(title)')
      .order('created_at', { ascending: false }),
    supabase
      .from('employee_invitations')
      .select('id, email, first_name, last_name, phone, department, designation, created_at, raw_data->empId, raw_data->status, raw_data->employmentType')
      .order('created_at', { ascending: false })
  ]);

  const profiles = (profilesRes.data || []).map(p => ({
    id: p.emp_id || p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    email: p.email,
    phone: p.phone,
    department: p.departments?.name || p.department || '-',
    designation: p.designations?.title || p.designation || '-',
    employmentType: p.employment_type || '-',
    status: p.status || 'Active',
    created_at: p.created_at
  }));

  const invitations = (invitationsRes.data || []).map(inv => ({
    id: inv.empId || inv.id,
    firstName: inv.first_name,
    lastName: inv.last_name,
    email: inv.email,
    phone: inv.phone,
    department: inv.department || '-',
    designation: inv.designation || '-',
    employmentType: inv.employmentType || '-',
    status: inv.status || 'Active',
    created_at: inv.created_at
  }));

  const combined = [...profiles, ...invitations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { data: combined, error: profilesRes.error || invitationsRes.error };
};

export const getEmployeeById = async (id) => {
  // Try profiles first
  let { data, error } = await supabase
    .from('profiles')
    .select('*, departments(name), designations(title)')
    .or(`id.eq.${id},emp_id.eq.${id}`)
    .maybeSingle();

  if (data) {
    return { 
      data: {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
        department: data.departments?.name || data.department,
        designation: data.designations?.title || data.designation,
        officialEmail: data.email,
        empId: data.emp_id || data.id,
        leaveBalance: data.leave_balance || 0,
        activeTasks: 0,
        attendanceScore: 'N/A',
        assetsAllocated: 0,
        documents: [],
        activity: [],
      }, 
      error: null 
    };
  }

  // Try finding in invitations
  let invData = null;
  let invError = null;
  if (id.includes('-')) {
    const { data, error } = await supabase.from('employee_invitations').select('*').eq('id', id).maybeSingle();
    invData = data;
    invError = error;
  } else {
    const { data, error } = await supabase.from('employee_invitations').select('*').eq('raw_data->>empId', id).maybeSingle();
    invData = data;
    invError = error;
  }
  
  if (invData) {
      const mapped = {
        ...invData.raw_data, // Pull in all the raw_data fields so the form fully pre-fills!
        id: invData.id,
        empId: invData.raw_data?.empId || invData.id,
        firstName: invData.first_name || invData.raw_data?.firstName,
        lastName: invData.last_name || invData.raw_data?.lastName,
        email: invData.email,
        officialEmail: invData.email, // mapped for the form
        phone: invData.phone || invData.raw_data?.phone,
        department: invData.department || invData.raw_data?.department || '-',
        designation: invData.designation || invData.raw_data?.designation || '-',
        status: invData.raw_data?.status || 'Active',
        leaveBalance: invData.raw_data?.leaveBalance || 0,
        activeTasks: 0,
        attendanceScore: 'N/A',
        assetsAllocated: 0,
        skills: invData.raw_data?.skills || [],
        emergency: invData.raw_data?.emergency || [],
        documents: invData.raw_data?.documents || [],
        activity: []
      };
      return { data: mapped, error: null };
  }

  return { data: null, error: invError || new Error("Employee not found") };
};

export const createEmployee = async (employeeData) => {
  // Instead of creating the auth user directly (which is blocked in browsers),
  // we add them to the invitations table. The database trigger will automatically
  // create their real profile when they log in for the first time via OTP.
  const { data, error } = await supabase
    .from('employee_invitations')
    .insert({
      email: employeeData.email,
      first_name: employeeData.firstName || employeeData.first_name,
      last_name: employeeData.lastName || employeeData.last_name,
      department: employeeData.department,
      designation: employeeData.designation,
      phone: employeeData.phone,
      raw_data: employeeData.raw_data
    })
    .select()
    .single();

  return { data, error };
};

export const updateEmployee = async (id, updates) => {
  const dbUpdates = {};
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.department !== undefined) dbUpdates.department = updates.department;
  if (updates.designation !== undefined) dbUpdates.designation = updates.designation;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

  const { data: prof } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .or(`id.eq.${id},emp_id.eq.${id}`)
    .select()
    .maybeSingle();

  if (prof) return { data: prof, error: null };

  let inv = null;
  if (id.includes('-')) {
    const { data } = await supabase.from('employee_invitations').select('id, raw_data').eq('id', id).maybeSingle();
    inv = data;
  } else {
    const { data } = await supabase.from('employee_invitations').select('id, raw_data').eq('raw_data->>empId', id).maybeSingle();
    inv = data;
  }

  if (inv) {
    const { data: invUpdated, error: invUpdateErr } = await supabase
      .from('employee_invitations')
      .update({
        ...dbUpdates,
        raw_data: { ...inv.raw_data, ...(updates.raw_data || updates) }
      })
      .eq('id', inv.id)
      .select()
      .single();
    return { data: invUpdated, error: invUpdateErr };
  }

  return { data: null, error: new Error('Employee not found') };
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
  const [employees, invitations, attendanceToday, pendingLeaves, openTickets, leavesToday] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('employee_invitations').select('id', { count: 'exact' }),
    supabase.from('attendance').select('id, status', { count: 'exact' }).eq('date', today),
    supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'open'),
    supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'approved').lte('start_date', today).gte('end_date', today),
  ]);

  const totalEmps = (employees.count || 0) + (invitations.count || 0);
  const present = attendanceToday.count || 0;
  const onLeave = leavesToday.count || 0;
  const absent = Math.max(0, totalEmps - present - onLeave);

  return {
    totalEmployees: totalEmps,
    presentToday: present,
    pendingLeaves: pendingLeaves.count || 0,
    openTickets: openTickets.count || 0,
    absentToday: absent,
    onLeaveToday: onLeave,
    workingNow: present,
    onBreakNow: 0,
    lateToday: 0
  };
};
