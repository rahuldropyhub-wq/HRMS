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
    empCode: p.emp_id || p.raw_data?.empId || p.raw_data?.emp_id || p.raw_data?.empCode || p.id,
    firstName: p.first_name || p.raw_data?.firstName,
    lastName: p.last_name || p.raw_data?.lastName,
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
      empCode: inv.raw_data?.empId || inv.raw_data?.emp_id || inv.raw_data?.empCode || inv.id,
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
    .select('*, profiles(first_name, last_name, emp_id, department, departments(name))')
    .eq('date', today)
    .order('check_in', { ascending: true });
  return { data, error };
};

export const getAllAttendanceRecords = async () => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(first_name, last_name, emp_id, department, departments(name))')
    .order('date', { ascending: false })
    .order('employee_id', { ascending: true });
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
  try {
    // 1. Fetch from wfh_requests
    const { data: wfhData } = await supabase
      .from('wfh_requests')
      .select('*, profiles(first_name, last_name, department, departments(name))')
      .order('created_at', { ascending: false });

    // 2. Fetch from leave_requests where leave_type contains 'Work From Home' or 'WFH'
    const { data: leaveData } = await supabase
      .from('leave_requests')
      .select('*, profiles(first_name, last_name, department, departments(name))')
      .or('leave_type.ilike.%Work From Home%,leave_type.ilike.%WFH%')
      .order('created_at', { ascending: false });

    // 3. Fetch today's WFH attendance records
    const today = new Date().toISOString().split('T')[0];
    const { data: attData } = await supabase
      .from('attendance')
      .select('*, profiles(first_name, last_name, department, departments(name))')
      .or('work_mode.ilike.%wfh%,work_mode.ilike.%home%')
      .eq('date', today);

    const combined = [];
    const seenIds = new Set();

    // Process wfh_requests
    if (wfhData && Array.isArray(wfhData)) {
      wfhData.forEach(item => {
        seenIds.add(item.id);
        combined.push({
          ...item,
          status: (item.status || 'pending').toLowerCase(),
          sourceTable: 'wfh_requests'
        });
      });
    }

    // Process leave_requests
    if (leaveData && Array.isArray(leaveData)) {
      leaveData.forEach(item => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          combined.push({
            id: item.id,
            employee_id: item.employee_id,
            profiles: item.profiles,
            status: (item.status || 'pending').toLowerCase(),
            reason: item.reason,
            location: 'Remote Location',
            from_date: item.start_date,
            to_date: item.end_date,
            created_at: item.created_at,
            sourceTable: 'leave_requests'
          });
        }
      });
    }

    // Process WFH attendance
    if (attData && Array.isArray(attData)) {
      attData.forEach(item => {
        const altId = `att-${item.id}`;
        if (!seenIds.has(item.id) && !seenIds.has(altId)) {
          seenIds.add(altId);

          let attWfhStatus = 'pending';
          const rawStatus = (item.status || '').toLowerCase();
          const rawMode = (item.work_mode || '').toLowerCase();

          if (rawMode === 'home' || rawMode === 'wfh' || rawStatus === 'wfh' || rawStatus === 'approved') {
            attWfhStatus = 'approved';
          } else if (rawStatus === 'rejected') {
            attWfhStatus = 'rejected';
          }

          combined.push({
            id: item.id,
            employee_id: item.employee_id,
            profiles: item.profiles,
            status: attWfhStatus,
            reason: item.wfh_reason || 'Live Check-in: Work From Home',
            location: item.address || 'Remote Location',
            gps_location: item.gps_location,
            check_in_time: item.check_in,
            from_date: item.date,
            to_date: item.date,
            total_hours: item.total_hours,
            created_at: item.created_at || `${item.date}T00:00:00Z`,
            sourceTable: 'attendance'
          });
        }
      });
    }

    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: combined, error: null };
  } catch (err) {
    console.error('Error fetching WFH requests:', err);
    return { data: [], error: err };
  }
};

export const updateWFHStatus = async (id, status, sourceTable) => {
  try {
    const normStatus = String(status).toLowerCase();
    const cleanId = String(id).replace('att-', '').replace('leave-', '');

    console.log('[updateWFHStatus] Updating ID:', cleanId, 'Target Status:', normStatus, 'Source:', sourceTable);

    // 1. Update leave_requests table
    const leaveRes = await supabase
      .from('leave_requests')
      .update({ status: normStatus })
      .eq('id', cleanId)
      .select();

    if (leaveRes.error) {
      console.warn('leave_requests update error:', leaveRes.error);
    } else {
      console.log('leave_requests updated successfully:', leaveRes.data);
    }

    // 2. Update wfh_requests table
    const wfhRes = await supabase
      .from('wfh_requests')
      .update({ status: normStatus })
      .eq('id', cleanId)
      .select();

    if (wfhRes.error) {
      console.warn('wfh_requests update error:', wfhRes.error);
    } else {
      console.log('wfh_requests updated successfully:', wfhRes.data);
    }

    // 3. Update attendance table
    const attStatus = normStatus === 'approved' ? 'wfh' : normStatus === 'rejected' ? 'absent' : 'present';
    const attRes = await supabase
      .from('attendance')
      .update({ status: attStatus, work_mode: normStatus === 'approved' ? 'home' : 'office' })
      .eq('id', cleanId)
      .select();

    if (attRes.error) {
      console.warn('attendance update error:', attRes.error);
    } else {
      console.log('attendance updated successfully:', attRes.data);
    }

    const updatedRow = (leaveRes.data && leaveRes.data[0]) 
                    || (wfhRes.data && wfhRes.data[0]) 
                    || (attRes.data && attRes.data[0]);

    return { data: updatedRow || { id, status: normStatus }, error: null };
  } catch (err) {
    console.error('Error updating WFH status:', err);
    return { data: { id, status }, error: null };
  }
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
  let { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.warn('getAllTasks query notice:', error?.message);
  }

  if (data && Array.isArray(data)) {
    data.sort((a, b) => new Date(b.created_at || b.due_date || 0) - new Date(a.created_at || a.due_date || 0));
  }
  return { data: data || [], error };
};

export const createTask = async (taskData) => {
  const payload = {
    title: taskData.title || taskData.name,
    description: taskData.description || '',
    assigned_to: taskData.assigned_to || taskData.assignedTo || '',
    project_name: taskData.project_name || taskData.project || 'General Project',
    department: taskData.department || 'Engineering',
    priority: (taskData.priority || 'medium').toLowerCase(),
    status: (taskData.status || 'todo').toLowerCase(),
    due_date: taskData.due_date || taskData.dueDate || new Date().toISOString().split('T')[0],
    estimated_hours: taskData.estimated_hours || taskData.estimatedHours || 0
  };

  let res = await supabase
    .from('tasks')
    .insert(payload)
    .select();

  if (res.error) {
    console.warn('createTask primary payload notice:', res.error?.message);

    res = await supabase
      .from('tasks')
      .insert({
        title: taskData.title || taskData.name,
        assigned_to: taskData.assigned_to || taskData.assignedTo || '',
        priority: (taskData.priority || 'medium').toLowerCase(),
        status: (taskData.status || 'todo').toLowerCase()
      })
      .select();
  }

  return { data: res.data ? res.data[0] : null, error: res.error };
};

export const updateTask = async (id, updates) => {
  let res = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select();

  return { data: res.data ? res.data[0] : null, error: res.error };
};

export const deleteTask = async (id) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  return { error };
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
  let dbData = [];
  try {
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles(first_name, last_name, departments(name))')
      .order('created_at', { ascending: false });
    if (data && Array.isArray(data)) dbData = data;
  } catch (e) {}

  let localSaved = [];
  try {
    localSaved = JSON.parse(localStorage.getItem('hrms_local_tickets') || '[]');
  } catch (e) {}

  const mergedMap = new Map();
  [...localSaved, ...dbData].forEach(t => {
    if (!t) return;
    const key = t.id || `${t.subject}-${t.created_at}`;
    if (key) mergedMap.set(key, t);
  });

  const combined = Array.from(mergedMap.values());
  combined.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

  return { data: combined, error: null };
};

export const updateTicketStatus = async (id, status) => {
  const normStatus = String(status).toLowerCase();
  try {
    await supabase
      .from('tickets')
      .update({ status: normStatus })
      .eq('id', id);
  } catch (e) {}

  try {
    const existing = JSON.parse(localStorage.getItem('hrms_local_tickets') || '[]');
    const updated = existing.map(t => t.id === id ? { ...t, status: normStatus } : t);
    localStorage.setItem('hrms_local_tickets', JSON.stringify(updated));
  } catch (e) {}

  return { data: { id, status: normStatus }, error: null };
};


// ─── ASSETS ───────────────────────────────────────────────────────────────────
export const getAllAssets = async () => {
  let { data, error } = await supabase.from('assets').select('*');
  if (data && Array.isArray(data)) {
    data.sort((a, b) => new Date(b.created_at || b.assignment_date || 0) - new Date(a.created_at || a.assignment_date || 0));
  }
  return { data: data || [], error };
};

export const createAsset = async (assetData) => {
  const code = assetData.asset_code || assetData.asset_id || assetData.assetId || ('AST-' + Math.floor(1000 + Math.random() * 9000));

  // 1. Primary insert sending asset_code (matching your Supabase table's NOT NULL constraint)
  const fullPayload = {
    asset_code: code,
    asset_id: code,
    name: assetData.name,
    category: assetData.category || 'Laptop',
    assigned_to: assetData.assigned_to || 'Unassigned',
    status: assetData.status || 'available',
    serial_number: assetData.serial_number || '',
    brand_model: assetData.brand_model || '',
    assignment_date: assetData.assignment_date || new Date().toISOString().split('T')[0],
    condition: assetData.condition || 'Good',
    location: assetData.location || 'Headquarters',
    remarks: assetData.remarks || ''
  };

  let res = await supabase.from('assets').insert(fullPayload).select();

  if (res.error) {
    console.warn('createAsset full payload notice:', res.error?.message);

    // 2. Clean payload with asset_code for existing DB schema
    const cleanPayload = {
      asset_code: code,
      name: assetData.name,
      category: assetData.category || 'Laptop',
      assigned_to: assetData.assigned_to || 'Unassigned',
      status: assetData.status || 'available'
    };

    res = await supabase.from('assets').insert(cleanPayload).select();

    if (res.error) {
      console.warn('createAsset clean payload notice:', res.error?.message);

      // 3. Fallback without asset_code in case table schema varies
      res = await supabase.from('assets').insert({
        name: assetData.name,
        category: assetData.category || 'Laptop',
        assigned_to: assetData.assigned_to || 'Unassigned',
        status: assetData.status || 'available'
      }).select();
    }
  }

  return { data: res.data ? res.data[0] : null, error: res.error };
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
  let { data, error } = await supabase
    .from('holidays')
    .select('*');

  if (error) {
    console.warn('getHolidays query notice:', error?.message);
  }

  if (data && Array.isArray(data)) {
    data.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }
  return { data: data || [], error };
};

export const createHoliday = async (holiday) => {
  const payload = {
    name: holiday.name,
    date: holiday.date,
    type: holiday.type || 'Company',
    description: holiday.description || '',
    applicable_to: holiday.applicableTo || holiday.applicable_to || 'All Departments'
  };

  let res = await supabase
    .from('holidays')
    .insert(payload)
    .select();

  if (res.error) {
    console.warn('createHoliday primary payload error:', res.error?.message);
    res = await supabase
      .from('holidays')
      .insert({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type || 'Company'
      })
      .select();
  }

  return { data: res.data ? res.data[0] : null, error: res.error };
};

export const updateHoliday = async (id, holiday) => {
  const payload = {
    name: holiday.name,
    date: holiday.date,
    type: holiday.type || 'Company',
    description: holiday.description || '',
    applicable_to: holiday.applicableTo || holiday.applicable_to || 'All Departments'
  };

  let res = await supabase
    .from('holidays')
    .update(payload)
    .eq('id', id)
    .select();

  if (res.error) {
    console.warn('updateHoliday primary payload error:', res.error?.message);
    res = await supabase
      .from('holidays')
      .update({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type || 'Company'
      })
      .eq('id', id)
      .select();
  }

  return { data: res.data ? res.data[0] : null, error: res.error };
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

  const [empRes, attTodayRes, ticketsRes, leavesRes] = await Promise.all([
    getAllEmployees(),
    getAllAttendanceToday(),
    getAllTickets(),
    getAllLeaveRequests()
  ]);

  const allEmps = empRes.data || [];
  const totalEmps = allEmps.length > 0 ? allEmps.length : 3;

  const attList = attTodayRes.data || [];
  const present = attList.filter(a => a.status === 'present' || a.status === 'working' || a.check_in).length;

  const ticketsList = ticketsRes.data || [];
  const openTktCount = ticketsList.filter(t => (t.status || '').toLowerCase() === 'open').length;

  const leavesList = leavesRes.data || [];
  const pendingLvsCount = leavesList.filter(l => (l.status || '').toLowerCase() === 'pending').length;
  const onLeaveCount = leavesList.filter(l => (l.status || '').toLowerCase() === 'approved' && (l.start_date <= today && l.end_date >= today)).length;

  const absent = Math.max(0, totalEmps - present - onLeaveCount);

  return {
    totalEmployees: totalEmps,
    presentToday: present,
    pendingLeaves: pendingLvsCount,
    openTickets: openTktCount,
    absentToday: absent,
    onLeaveToday: onLeaveCount,
    workingNow: present,
    onBreakNow: 0,
    lateToday: 0
  };
};



// ─── PROJECTS ─────────────────────────────────────────────────────────────────
// Supabase = single source of truth. localStorage is read-cache only.

const CACHE_KEY = 'hrms_projects_cache';

const setCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
};

const getCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { return null; }
};

const invalidateCache = () => {
  try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
};

// Get all projects (with departments and member count)
export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_departments(department),
        project_members(id, role, profiles(id, first_name, last_name, emp_id, email, department))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalized = (data || []).map(p => ({
      ...p,
      departments: (p.project_departments || []).map(d => d.department),
      members: (p.project_members || []).map(m => ({
        memberId: m.id,
        role: m.role,
        id: m.profiles?.id,
        firstName: m.profiles?.first_name,
        lastName: m.profiles?.last_name,
        empCode: m.profiles?.emp_id,
        email: m.profiles?.email,
        department: m.profiles?.department,
      })),
      memberCount: (p.project_members || []).length,
    }));

    setCache(normalized);
    return { data: normalized, error: null };
  } catch (err) {
    // Fallback to cache
    const cached = getCache();
    if (cached) return { data: cached, error: null };
    return { data: [], error: err.message };
  }
};

// Get a single project by ID
export const getProjectById = async (projectId) => {
  const { data: all, error } = await getProjects();
  if (error) return { data: null, error };
  const project = all.find(p => p.id === projectId) || null;
  return { data: project, error: null };
};

// Create a new project
export const createProject = async ({ name, description, status, priority, start_date, end_date, tags, departments, created_by }) => {
  try {
    // 1. Insert project
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({ name, description, status: status || 'planning', priority: priority || 'medium', start_date, end_date, tags: tags || [], created_by })
      .select()
      .single();

    if (projErr) throw projErr;

    // 2. Insert departments
    if (departments && departments.length > 0) {
      const deptRows = departments.map(dept => ({ project_id: project.id, department: dept }));
      await supabase.from('project_departments').insert(deptRows);
    }

    invalidateCache();
    return { data: project, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Update an existing project
export const updateProject = async (projectId, { name, description, status, priority, start_date, end_date, tags, departments }) => {
  try {
    const { error: projErr } = await supabase
      .from('projects')
      .update({ name, description, status, priority, start_date, end_date, tags, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (projErr) throw projErr;

    // Replace departments
    if (departments) {
      await supabase.from('project_departments').delete().eq('project_id', projectId);
      if (departments.length > 0) {
        const deptRows = departments.map(dept => ({ project_id: projectId, department: dept }));
        await supabase.from('project_departments').insert(deptRows);
      }
    }

    invalidateCache();
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
};

// Delete (soft-delete via status) a project
export const deleteProject = async (projectId) => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (error) throw error;
    invalidateCache();
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
};

// ─── PROJECT MEMBERS ──────────────────────────────────────────────────────────

const VALID_MEMBER_ROLES = ['project_manager', 'developer', 'ui_ux_designer', 'tester', 'devops', 'member'];

// Get members for a specific project
export const getProjectMembers = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('id, role, profiles(id, first_name, last_name, emp_id, email, department)')
      .eq('project_id', projectId);

    if (error) throw error;

    const members = (data || []).map(m => ({
      memberId: m.id,
      role: m.role,
      id: m.profiles?.id,
      firstName: m.profiles?.first_name,
      lastName: m.profiles?.last_name,
      empCode: m.profiles?.emp_id,
      email: m.profiles?.email,
      department: m.profiles?.department,
      displayLabel: `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim()
        + ` (${m.profiles?.emp_id || 'EMP'})`,
    }));

    return { data: members, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
};

// Add a member to a project
export const addProjectMember = async (projectId, employeeProfileId, role = 'member') => {
  const safeRole = VALID_MEMBER_ROLES.includes(role) ? role : 'member';
  try {
    const { error } = await supabase
      .from('project_members')
      .upsert({ project_id: projectId, employee_id: employeeProfileId, role: safeRole }, { onConflict: 'project_id,employee_id' });
    if (error) throw error;
    invalidateCache();
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
};

// Remove a member from a project
export const removeProjectMember = async (projectId, employeeProfileId) => {
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('employee_id', employeeProfileId);
    if (error) throw error;
    invalidateCache();
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
};

// ─── MEMBERSHIP VALIDATION ────────────────────────────────────────────────────
// Returns true if the employee is a member of the project.
// Called before task creation to enforce backend constraint.
export const validateProjectMembership = async (projectId, employeeProfileId) => {
  if (!projectId || !employeeProfileId) return false;
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('employee_id', employeeProfileId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

// ─── COMPANY PROJECT NAMES LIST (legacy helper for dropdowns) ─────────────────
export const getCompanyProjects = async () => {
  try {
    const { data } = await getProjects();
    const names = (data || [])
      .filter(p => p.status !== 'cancelled')
      .map(p => p.name);
    return { data: names.length > 0 ? names : ['General Project'], error: null };
  } catch (e) {
    return { data: ['General Project'], error: null };
  }
};

// Keep backward compat — createCompanyProject is superseded by createProject
export const createCompanyProject = async (projectName) => {
  if (!projectName) return { success: false };
  await supabase.from('projects').insert({ name: projectName, status: 'active' }).catch(() => {});
  invalidateCache();
  return { success: true };
};

