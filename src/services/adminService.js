import { supabase } from '../lib/supabaseClient';

// ─── EMPLOYEES (Profiles) ─────────────────────────────────────────────────────
export const getAllEmployees = async () => {
  const [profilesRes, invitationsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, departments(name), designations(title)')
      .neq('role', 'admin')          // ← Exclude admin users from employee directory
      .order('created_at', { ascending: false }),
    supabase
      .from('employee_invitations')
      .select('*')
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
    avatar_url: p.avatar_url || p.raw_data?.avatar_url || p.raw_data?.avatarUrl,
    cover_url: p.cover_url || p.raw_data?.cover_url || p.raw_data?.coverUrl,
    created_at: p.created_at,
    source: 'profile'
  }));

  // Build a set of emails already in profiles to avoid duplicates
  const profileEmails = new Set(profiles.map(p => p.email?.toLowerCase()));

  const invitations = (invitationsRes.data || [])
    .filter(inv => !profileEmails.has(inv.email?.toLowerCase())) // ← Skip if already has a profile
    .map(inv => ({
      id: inv.raw_data?.empId || inv.id,
      firstName: inv.first_name || inv.raw_data?.firstName,
      lastName: inv.last_name || inv.raw_data?.lastName,
      email: inv.email,
      phone: inv.phone || inv.raw_data?.phone,
      department: inv.department || inv.raw_data?.department || '-',
      designation: inv.designation || inv.raw_data?.designation || '-',
      employmentType: inv.raw_data?.employmentType || '-',
      status: inv.raw_data?.status || 'Active',
      avatar_url: inv.raw_data?.avatar_url || inv.raw_data?.avatarUrl,
      cover_url: inv.raw_data?.cover_url || inv.raw_data?.coverUrl,
      created_at: inv.created_at,
      source: 'invitation'
    }));

  const combined = [...profiles, ...invitations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { data: combined, error: profilesRes.error || invitationsRes.error };
};

const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const getEmployeeById = async (id) => {
  // 1. Try finding in profiles table first
  let profileQuery = supabase.from('profiles').select('*, departments(name), designations(title)');
  if (isUuid(id)) {
    profileQuery = profileQuery.or(`id.eq.${id},emp_id.eq.${id}`);
  } else {
    profileQuery = profileQuery.eq('emp_id', id);
  }

  let { data: profData } = await profileQuery.maybeSingle();

  // 2. Fetch invitation raw_data by email or empId or id
  const searchEmail = profData?.email;
  let invQuery = supabase.from('employee_invitations').select('*');
  if (searchEmail) {
    invQuery = invQuery.or(`email.ilike.${searchEmail},raw_data->>officialEmail.ilike.${searchEmail},raw_data->>personalEmail.ilike.${searchEmail}`);
  } else if (isUuid(id)) {
    invQuery = invQuery.or(`id.eq.${id},raw_data->>empId.eq.${id}`);
  } else {
    invQuery = invQuery.eq('raw_data->>empId', id);
  }

  let { data: invData } = await invQuery.maybeSingle();

  if (!profData && !invData) {
    return { data: null, error: new Error("Employee not found") };
  }

  const raw = invData?.raw_data || {};

  const merged = {
    ...raw,
    id: profData?.id || invData?.id,
    empId: profData?.emp_id || raw.empId || profData?.id || invData?.id,
    firstName: profData?.first_name || raw.firstName || invData?.first_name || '-',
    lastName: profData?.last_name || raw.lastName || invData?.last_name || '',
    email: profData?.email || invData?.email || raw.officialEmail || '-',
    officialEmail: profData?.email || invData?.email || raw.officialEmail || '-',
    personalEmail: profData?.personal_email || raw.personalEmail || raw.email || '-',
    phone: profData?.phone || raw.phone || invData?.phone || '-',
    dob: profData?.dob || raw.dob || '-',
    gender: profData?.gender || raw.gender || '-',
    bloodGroup: profData?.blood_group || profData?.bloodGroup || raw.bloodGroup || '-',
    maritalStatus: profData?.marital_status || raw.maritalStatus || '-',
    address: profData?.address || raw.address || raw.currentAddress || '-',
    city: raw.city || '',
    state: raw.state || '',
    pincode: raw.pincode || '',
    department: profData?.departments?.name || profData?.department || invData?.department || raw.department || '-',
    designation: profData?.designations?.title || profData?.designation || invData?.designation || raw.designation || '-',
    manager: profData?.reporting_manager || profData?.manager || raw.manager || raw.reporting_manager || invData?.manager || '-',
    employmentType: profData?.employment_type || raw.employmentType || '-',
    workLocation: profData?.work_location || raw.workLocation || '-',
    shift: profData?.shift || raw.shift || '-',
    bankName: profData?.bank_name || raw.bankName || raw.bank_name || '-',
    accountNumber: profData?.account_number || raw.accountNumber || raw.account_number || '-',
    ifscCode: profData?.ifsc_code || raw.ifscCode || raw.ifsc_code || '-',
    panNumber: profData?.pan_number || raw.panNumber || raw.pan_number || '-',
    aadharNumber: profData?.aadhar_number || raw.aadharNumber || raw.aadhar_number || '-',
    avatar_url: profData?.avatar_url || raw.avatar_url || raw.avatarUrl,
    cover_url: profData?.cover_url || raw.cover_url || raw.coverUrl,
    status: profData?.status || raw.status || 'Active',
    leaveBalance: profData?.leave_balance || raw.leaveBalance || 0,
    activeTasks: 0,
    attendanceScore: 'N/A',
    assetsAllocated: 0,
    skills: (profData?.skills && profData.skills.length > 0) ? profData.skills : (raw.skills || []),
    emergency: (profData?.emergency && profData.emergency.length > 0) ? profData.emergency : (raw.emergency || []),
    documents: (profData?.documents && profData.documents.length > 0) ? profData.documents : (raw.documents || []),
    activity: raw.activity || []
  };

  return { data: merged, error: null };
};

export const createEmployee = async (employeeData) => {
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
  if (updates.manager !== undefined) dbUpdates.reporting_manager = updates.manager;

  let profileUpdate = supabase.from('profiles').update(dbUpdates);
  if (isUuid(id)) {
    profileUpdate = profileUpdate.or(`id.eq.${id},emp_id.eq.${id}`);
  } else {
    profileUpdate = profileUpdate.eq('emp_id', id);
  }
  const { data: prof } = await profileUpdate.select().maybeSingle();

  // Always update employee_invitations too so raw_data remains in sync for employee portal
  let invQuery = supabase.from('employee_invitations').select('id, raw_data');
  if (isUuid(id)) {
    invQuery = invQuery.or(`id.eq.${id},raw_data->>empId.eq.${id}`);
  } else if (prof?.email) {
    invQuery = invQuery.or(`raw_data->>empId.eq.${id},email.eq.${prof.email}`);
  } else {
    invQuery = invQuery.eq('raw_data->>empId', id);
  }
  const { data: inv } = await invQuery.maybeSingle();

  if (inv) {
    const { reporting_manager, ...invDbUpdates } = dbUpdates;
    const mergedRaw = { ...inv.raw_data, ...(updates.raw_data || updates) };
    const { data: invUpdated, error: invUpdateErr } = await supabase
      .from('employee_invitations')
      .update({
        ...invDbUpdates,
        raw_data: mergedRaw
      })
      .eq('id', inv.id)
      .select()
      .single();
    return { data: prof || invUpdated, error: invUpdateErr };
  }

  return { data: prof, error: prof ? null : new Error('Employee not found') };
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

export const getAllAttendanceRecords = async () => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, emp_id, department, departments(name))')
    .order('date', { ascending: false });
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
  const [empRes, attendanceToday, pendingLeaves, openTickets, leavesToday] = await Promise.all([
    getAllEmployees(),
    supabase.from('attendance').select('id, status', { count: 'exact' }).eq('date', today),
    supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('tickets').select('id', { count: 'exact' }).eq('status', 'open'),
    supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'approved').lte('start_date', today).gte('end_date', today),
  ]);

  const allEmps = empRes.data || [];
  const totalEmps = allEmps.length;
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
