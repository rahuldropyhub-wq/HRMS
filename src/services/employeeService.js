import { supabase } from '../lib/supabaseClient';

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data: authUser } = await supabase.auth.getUser();
  const currentEmail = authUser?.user?.email;

  // 1. Fetch profile record
  let { data } = await supabase
    .from('profiles')
    .select('*, departments(name), designations(title)')
    .eq('id', userId)
    .maybeSingle();

  const userEmails = Array.from(new Set([data?.email, currentEmail].filter(Boolean)));

  // 2. Query employee_invitations table by official email, personal email, or empId
  let inv = null;
  for (const em of userEmails) {
    const { data: invData } = await supabase
      .from('employee_invitations')
      .select('*')
      .or(`email.ilike.${em},raw_data->>personalEmail.ilike.${em},raw_data->>officialEmail.ilike.${em}`)
      .maybeSingle();

    if (invData) {
      inv = invData;
      break;
    }
  }

  if (!inv && data?.emp_id) {
    const { data: invData } = await supabase
      .from('employee_invitations')
      .select('*')
      .eq('raw_data->>empId', data.emp_id)
      .maybeSingle();
    inv = invData;
  }

  const raw = inv?.raw_data || {};

  const merged = {
    ...raw,
    ...data,
    id: data?.id || userId,
    emp_id: data?.emp_id || raw.empId || inv?.id,
    first_name: data?.first_name || inv?.first_name || raw.firstName,
    last_name: data?.last_name || inv?.last_name || raw.lastName,
    phone: data?.phone || inv?.phone || raw.phone,
    personal_email: data?.personal_email || raw.personalEmail,
    email: data?.email || inv?.email || currentEmail,
    official_email: data?.email || inv?.email || currentEmail,
    dob: data?.dob || raw.dob,
    gender: data?.gender || raw.gender,
    blood_group: data?.blood_group || raw.bloodGroup,
    marital_status: data?.marital_status || raw.maritalStatus,
    address: data?.address || [raw.address, raw.city, raw.state, raw.pincode].filter(Boolean).join(', ') || raw.currentAddress,
    department: (Array.isArray(data?.departments) ? data?.departments[0]?.name : data?.departments?.name) || (typeof data?.department === 'object' ? data.department?.name : data?.department) || inv?.department || raw.department,
    designation: (Array.isArray(data?.designations) ? data?.designations[0]?.title : data?.designations?.title) || (typeof data?.designation === 'object' ? data.designation?.title : data?.designation) || inv?.designation || raw.designation,
    employment_type: data?.employment_type || raw.employmentType,
    work_location: data?.work_location || raw.workLocation,
    shift: data?.shift || raw.shift,
    leave_balance: data?.leave_balance || raw.leaveBalance || 0,
    bank_name: data?.bank_name || raw.bankName,
    account_number: data?.account_number || raw.accountNumber,
    ifsc_code: data?.ifsc_code || raw.ifscCode,
    account_holder: data?.account_holder || raw.accountHolder,
    pan_number: data?.pan_number || raw.panNumber,
    aadhar_number: data?.aadhar_number || raw.aadharNumber,
    manager: typeof data?.reporting_manager === 'object' ? (data.reporting_manager?.full_name || `${data.reporting_manager?.first_name || ''} ${data.reporting_manager?.last_name || ''}`.trim()) : (data?.reporting_manager || raw.manager),
    documents: data?.documents || raw.documents || [],
    emergency: data?.emergency || raw.emergency || [],
  };

  return { data: merged, error: null };
};

export const updateProfile = async (userId, updates) => {
  // 1. Map fields for profiles table
  const profileDbUpdates = {};
  if (updates.first_name || updates.firstName) profileDbUpdates.first_name = updates.first_name || updates.firstName;
  if (updates.last_name || updates.lastName) profileDbUpdates.last_name = updates.last_name || updates.lastName;
  if (updates.phone) profileDbUpdates.phone = updates.phone;
  if (updates.avatar_url || updates.avatarUrl) profileDbUpdates.avatar_url = updates.avatar_url || updates.avatarUrl;
  if (updates.cover_url || updates.coverUrl) profileDbUpdates.cover_url = updates.cover_url || updates.coverUrl;

  let { data: prof, error: profErr } = await supabase
    .from('profiles')
    .update(profileDbUpdates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  // 2. Also update employee_invitations table raw_data so Admin panel sees all updated fields
  const userEmail = prof?.email || (await supabase.auth.getUser())?.data?.user?.email;

  if (userEmail) {
    const { data: inv } = await supabase
      .from('employee_invitations')
      .select('id, phone, raw_data')
      .or(`email.ilike.${userEmail},raw_data->>personalEmail.ilike.${userEmail},raw_data->>officialEmail.ilike.${userEmail}`)
      .maybeSingle();

    if (inv) {
      const updatedRaw = {
        ...inv.raw_data,
        avatar_url: updates.avatar_url ?? updates.avatarUrl ?? inv.raw_data?.avatar_url ?? inv.raw_data?.avatarUrl,
        cover_url: updates.cover_url ?? updates.coverUrl ?? inv.raw_data?.cover_url ?? inv.raw_data?.coverUrl,
        phone: updates.phone ?? inv.raw_data?.phone,
        personalEmail: updates.personal_email ?? updates.personalEmail ?? inv.raw_data?.personalEmail,
        address: updates.address ?? updates.currentAddress ?? inv.raw_data?.address,
        gender: updates.gender ?? inv.raw_data?.gender,
        dob: updates.dob ?? inv.raw_data?.dob,
        bloodGroup: updates.blood_group ?? updates.bloodGroup ?? inv.raw_data?.bloodGroup,
        bankName: updates.bank_name ?? updates.bankName ?? inv.raw_data?.bankName,
        accountNumber: updates.account_number ?? updates.accountNumber ?? inv.raw_data?.accountNumber,
        ifscCode: updates.ifsc_code ?? updates.ifscCode ?? inv.raw_data?.ifscCode,
        accountHolder: updates.account_holder ?? updates.accountHolder ?? inv.raw_data?.accountHolder,
        panNumber: updates.pan_number ?? updates.panNumber ?? inv.raw_data?.panNumber,
        aadharNumber: updates.aadhar_number ?? updates.aadharNumber ?? inv.raw_data?.aadharNumber,
        skills: updates.skills ?? inv.raw_data?.skills,
        experience: updates.experience ?? inv.raw_data?.experience,
        certifications: updates.certifications ?? inv.raw_data?.certifications,
        languages: updates.languages ?? inv.raw_data?.languages,
        emergency: updates.emergency ?? inv.raw_data?.emergency
      };

      const { data: invUpdated, error: invErr } = await supabase
        .from('employee_invitations')
        .update({
          phone: updates.phone || inv.phone,
          raw_data: updatedRaw
        })
        .eq('id', inv.id)
        .select()
        .maybeSingle();

      return { data: { ...prof, ...updatedRaw }, error: invErr };
    }
  }

  return { data: prof, error: profErr };
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const getMyAttendance = async (userId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endYear = endDate.getFullYear();
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
  const endDay = String(endDate.getDate()).padStart(2, '0');
  const endDateStr = `${endYear}-${endMonth}-${endDay}`;

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', userId)
    .gte('date', startDate)
    .lte('date', endDateStr)
    .order('date', { ascending: true });
  return { data, error };
};

export const getTodayAttendance = async (userId) => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', userId)
    .eq('date', today)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  // If local cached breaks exist and have closed all breaks, ensure returned object reflects closed breaks
  if (data && userId) {
    try {
      const cached = localStorage.getItem(`hrms_today_breaks_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(b => b.end)) {
          const hasOpenInDb = Array.isArray(data.breaks) && data.breaks.some(b => !b.end);
          if (hasOpenInDb) {
            data.breaks = parsed.map(b => ({
              start: b.start instanceof Date ? b.start.toTimeString().slice(0, 5) : String(b.start).slice(0, 5),
              end: b.end instanceof Date ? b.end.toTimeString().slice(0, 5) : String(b.end).slice(0, 5),
              reason: b.reason || 'Tea Break',
              duration: typeof b.duration === 'number' ? b.duration : 0
            }));
          }
        }
      }
    } catch (e) {}
  }

  return { data, error };
};

export const checkIn = async (userId, workMode, wfhReason, gpsLocation) => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date().toTimeString().slice(0, 5); // HH:MM

  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('employee_id', userId)
    .eq('date', today)
    .limit(1)
    .maybeSingle();

  if (existing) return { error: { message: 'Already checked in today.' } };

  const { data, error } = await supabase
    .from('attendance')
    .insert({ 
      employee_id: userId, 
      date: today, 
      check_in: now, 
      status: 'present',
      work_mode: workMode || 'office',
      wfh_reason: wfhReason || null,
      gps_location: gpsLocation || null,
      breaks: [],
      total_break_hours: 0
    })
    .select()
    .maybeSingle();
  return { data, error };
};

export const startBreak = async (attendanceId, reason, fallbackBreaksArray = []) => {
  const d = new Date();
  const nowStr = d.toTimeString().slice(0, 5);
  const newBreak = { start: nowStr, end: null, reason: reason || 'Tea Break', duration: 0 };

  let currentBreaks = Array.isArray(fallbackBreaksArray) ? [...fallbackBreaksArray] : [];

  if (attendanceId) {
    const { data: rec } = await supabase
      .from('attendance')
      .select('breaks')
      .eq('id', attendanceId)
      .maybeSingle();

    if (rec && Array.isArray(rec.breaks) && rec.breaks.length > 0) {
      const mergedMap = new Map();
      [...fallbackBreaksArray, ...rec.breaks].forEach(b => {
        const key = `${b.start}-${b.reason || ''}`;
        mergedMap.set(key, b);
      });
      currentBreaks = Array.from(mergedMap.values());
    }
  }

  // Ensure we don't open duplicate active breaks; if an unclosed break exists, reuse or update it
  const existingOpen = currentBreaks.find(b => !b.end);
  if (existingOpen) {
    existingOpen.reason = reason || existingOpen.reason || 'Tea Break';
  } else {
    currentBreaks.push(newBreak);
  }

  // Clean breaks array for database storage
  const cleanBreaksForDb = currentBreaks.map(b => {
    let startStr = '00:00';
    if (typeof b.start === 'string') {
      startStr = b.start.includes('T') ? b.start.split('T')[1].slice(0, 5) : b.start.slice(0, 5);
    } else if (b.start instanceof Date && !isNaN(b.start.getTime())) {
      startStr = b.start.toTimeString().slice(0, 5);
    }

    let endStr = null;
    if (b.end) {
      if (typeof b.end === 'string') {
        endStr = b.end.includes('T') ? b.end.split('T')[1].slice(0, 5) : b.end.slice(0, 5);
      } else if (b.end instanceof Date && !isNaN(b.end.getTime())) {
        endStr = b.end.toTimeString().slice(0, 5);
      }
    }

    const dur = typeof b.duration === 'number' && !isNaN(b.duration) ? Math.max(0, Math.floor(b.duration)) : 0;

    return {
      start: startStr,
      end: endStr,
      reason: b.reason || 'Tea Break',
      duration: dur
    };
  });

  if (attendanceId) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ breaks: cleanBreaksForDb })
      .eq('id', attendanceId)
      .select()
      .maybeSingle();

    if (data) return { data, error: null };
  }

  return { data: { breaks: cleanBreaksForDb }, error: null };
};

export const endBreak = async (attendanceId, fallbackBreaksArray = []) => {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nowStr = d.toTimeString().slice(0, 5);

  let currentBreaks = Array.isArray(fallbackBreaksArray) ? [...fallbackBreaksArray] : [];

  if (attendanceId) {
    const { data: rec } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', attendanceId)
      .maybeSingle();

    if (rec && Array.isArray(rec.breaks) && rec.breaks.length > 0) {
      const mergedMap = new Map();
      [...fallbackBreaksArray, ...rec.breaks].forEach(b => {
        const key = `${b.start}-${b.reason || ''}`;
        if (!mergedMap.has(key) || (!b.end && mergedMap.get(key).end)) {
          mergedMap.set(key, b);
        }
      });
      currentBreaks = Array.from(mergedMap.values());
    }
  }

  const getSecs = (val) => {
    if (!val) return Math.floor(Date.now() / 1000);
    if (val instanceof Date) return isNaN(val.getTime()) ? Math.floor(Date.now() / 1000) : Math.floor(val.getTime() / 1000);
    const str = String(val).trim();
    if (str.includes('T') || str.includes('-')) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) return Math.floor(parsed.getTime() / 1000);
    }
    const parsed = new Date(`${todayStr}T${str}`);
    return isNaN(parsed.getTime()) ? Math.floor(Date.now() / 1000) : Math.floor(parsed.getTime() / 1000);
  };

  // Close ALL open breaks (where end is null or empty)
  currentBreaks.forEach(b => {
    if (!b.end) {
      b.end = nowStr;
      const startSecs = getSecs(b.start);
      const endSecs = Math.floor(Date.now() / 1000);
      b.duration = Math.max(0, endSecs - startSecs);
    }
  });

  // Clean breaks array for database storage
  const cleanBreaksForDb = currentBreaks.map(b => {
    let startStr = '00:00';
    if (typeof b.start === 'string') {
      startStr = b.start.includes('T') ? b.start.split('T')[1].slice(0, 5) : b.start.slice(0, 5);
    } else if (b.start instanceof Date && !isNaN(b.start.getTime())) {
      startStr = b.start.toTimeString().slice(0, 5);
    }

    let endStr = null;
    if (b.end) {
      if (typeof b.end === 'string') {
        endStr = b.end.includes('T') ? b.end.split('T')[1].slice(0, 5) : b.end.slice(0, 5);
      } else if (b.end instanceof Date && !isNaN(b.end.getTime())) {
        endStr = b.end.toTimeString().slice(0, 5);
      }
    }

    const dur = typeof b.duration === 'number' && !isNaN(b.duration) ? Math.max(0, Math.floor(b.duration)) : 0;

    return {
      start: startStr,
      end: endStr,
      reason: b.reason || 'Tea Break',
      duration: dur
    };
  });

  const totalBreakSecs = cleanBreaksForDb.reduce((acc, b) => acc + (b.duration || 0), 0);
  const totalBreakHours = parseFloat((totalBreakSecs / 3600).toFixed(2)) || 0;

  if (attendanceId) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ breaks: cleanBreaksForDb, total_break_hours: totalBreakHours })
      .eq('id', attendanceId)
      .select()
      .maybeSingle();

    if (data) return { data, error: null };
  }

  return { data: { breaks: cleanBreaksForDb, total_break_hours: totalBreakHours }, error: null };
};

export const checkOut = async (userId) => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date().toTimeString().slice(0, 5);

  const { data: record } = await supabase
    .from('attendance')
    .select('id, check_in, total_break_hours, breaks')
    .eq('employee_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!record) return { error: { message: 'No check-in found for today.' } };

  // Calculate total break hours dynamically from breaks array + total_break_hours
  const recBreaks = Array.isArray(record.breaks) ? record.breaks : [];
  const breakSecs = recBreaks.reduce((acc, b) => {
    if (typeof b.duration === 'number' && !isNaN(b.duration) && b.duration > 0) return acc + b.duration;
    if (b.start && b.end) {
      const s = new Date(`${today}T${b.start}`).getTime();
      const e = new Date(`${today}T${b.end}`).getTime();
      if (!isNaN(s) && !isNaN(e) && e > s) return acc + Math.floor((e - s) / 1000);
    }
    return acc;
  }, 0);

  const breakHrs = record.total_break_hours ? parseFloat(record.total_break_hours) : (breakSecs / 3600);

  // Calculate total hours
  const checkInTime = new Date(`${today}T${record.check_in}`);
  const checkOutTime = new Date(`${today}T${now}`);
  const grossHours = (checkOutTime - checkInTime) / 3600000;
  const netHours = Math.max(0, grossHours - breakHrs).toFixed(2);

  const { data, error } = await supabase
    .from('attendance')
    .update({ 
      check_out: now, 
      total_hours: netHours,
      total_break_hours: parseFloat(breakHrs.toFixed(2))
    })
    .eq('id', record.id)
    .select()
    .maybeSingle();

  return { data, error };
};

// ─── LEAVE ────────────────────────────────────────────────────────────────────
const DEFAULT_LEAVES = [];

export const getMyLeaves = async (userId) => {
  try {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('hrms_local_leaves') || '[]');
    } catch (e) {}

    if (supabase.isLocalMode) {
      return { data: local.length ? local : DEFAULT_LEAVES, error: null };
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: local.length ? local : DEFAULT_LEAVES, error: null };
    }
    return { data: (data && data.length) ? data : (local.length ? local : DEFAULT_LEAVES), error: null };
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('hrms_local_leaves') || '[]');
    return { data: local.length ? local : DEFAULT_LEAVES, error: null };
  }
};

export const applyLeave = async (leaveData) => {
  try {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('hrms_local_leaves') || '[]');
    } catch (e) {}

    const newLeaveObj = {
      id: 'LV-' + Date.now().toString().slice(-6),
      created_at: new Date().toISOString(),
      status: 'pending',
      ...leaveData
    };

    localStorage.setItem('hrms_local_leaves', JSON.stringify([newLeaveObj, ...local]));

    if (!supabase.isLocalMode) {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(leaveData)
        .select()
        .single();

      if (!error && data) {
        return { data, error: null };
      }
    }

    return { data: newLeaveObj, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const getMyTasks = async (userId) => {
  try {
    const { data: prof } = await getProfile(userId);
    const fullName = `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim();
    const empCode = prof?.emp_id || prof?.empCode;
    const userEmail = prof?.email;

    let dbTasks = [];
    try {
      const { data: allTasks } = await supabase.from('tasks').select('*');
      if (allTasks && Array.isArray(allTasks)) dbTasks = allTasks;
    } catch (e) {}

    let localSaved = [];
    try {
      localSaved = JSON.parse(localStorage.getItem('hrms_local_tasks') || '[]');
    } catch (e) {}

    let myTasks = [];
    const allCombined = [...localSaved, ...dbTasks];

    allCombined.forEach(t => {
      if (!t) return;
      const assigned = String(t.assignedTo || t.assigned_to || t.employee_id || '').toLowerCase();
      
      const isMine =
        !assigned ||
        !userId ||
        assigned.includes(String(userId).toLowerCase()) ||
        (fullName && assigned.includes(fullName.toLowerCase())) ||
        (empCode && assigned.includes(String(empCode).toLowerCase())) ||
        (userEmail && assigned.includes(userEmail.toLowerCase()));

      if (isMine) {
        myTasks.push(t);
      }
    });

    const uniqueMap = new Map();
    myTasks.forEach(t => {
      const key = t.id || `${t.title || t.name}-${t.due_date || t.dueDate}`;
      if (key) uniqueMap.set(key, t);
    });

    const result = Array.from(uniqueMap.values());
    result.sort((a, b) => new Date(b.created_at || b.createdAt || b.dueDate || 0) - new Date(a.created_at || a.createdAt || a.dueDate || 0));

    return { data: result, error: null };
  } catch (err) {
    console.error('getMyTasks error:', err);
    return { data: [], error: err };
  }
};


export const updateTaskStatus = async (taskId, status) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: status.toLowerCase() })
    .eq('id', taskId)
    .select();

  try {
    const local = JSON.parse(localStorage.getItem('hrms_local_tasks') || '[]');
    const updated = local.map(t => t.id === taskId ? { ...t, status: status.toLowerCase() } : t);
    localStorage.setItem('hrms_local_tasks', JSON.stringify(updated));
  } catch (e) {}

  return { data: data ? data[0] : null, error };
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
    .maybeSingle();
  return { data, error };
};

export const updateWorksheet = async (id, updates) => {
  const { data, error } = await supabase
    .from('worksheets')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  return { data, error };
};

export const deleteWorksheet = async (id) => {
  const { error } = await supabase
    .from('worksheets')
    .delete()
    .eq('id', id);
  return { error };
};

// ─── TICKETS ──────────────────────────────────────────────────────────────────
const MOCK_TICKET_TITLES = new Set([
  'Laptop display flickering',
  'VPN connectivity issues',
  'Software License Request',
  'Salary Slip Discrepancy',
  'Shift Timing Change'
]);

export const getMyTickets = async (userId) => {
  let dbData = [];
  try {
    const { data } = await supabase
      .from('tickets')
      .select('*')
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
    const subj = t.subject || t.title || '';
    if (MOCK_TICKET_TITLES.has(subj)) return; // Purge mock tickets

    const isForUser = !userId || !t.employee_id || t.employee_id === userId || String(t.employee_id) === String(userId);
    if (isForUser) {
      const key = t.id || `${subj}-${t.created_at}`;
      if (key) mergedMap.set(key, t);
    }
  });

  const combined = Array.from(mergedMap.values());
  combined.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

  return { data: combined, error: null };
};

export const raiseTicket = async (ticketData) => {
  const newTicketId = ticketData.id || ('TKT-' + Math.floor(1000 + Math.random() * 9000));
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formattedTicket = {
    id: newTicketId,
    employee_id: ticketData.employee_id || '',
    subject: ticketData.subject,
    department: ticketData.category || ticketData.department || 'IT Support',
    category: ticketData.category || ticketData.department || 'IT Support',
    priority: (ticketData.priority || 'medium').toLowerCase(),
    description: ticketData.description || '',
    status: (ticketData.status || 'open').toLowerCase(),
    createdAt: ticketData.createdAt || nowStr,
    created_at: ticketData.created_at || new Date().toISOString(),
    assignedTo: ticketData.assignedTo || 'Unassigned',
    assigned_to: ticketData.assignedTo || 'Unassigned',
    conversation: ticketData.conversation || [
      {
        author: ticketData.authorName || 'Employee',
        role: 'employee',
        text: ticketData.description,
        time: 'Just now'
      }
    ],
    timeline: ticketData.timeline || [
      {
        type: 'created',
        action: 'Ticket Created',
        sub: `Submitted under ${ticketData.category || ticketData.department || 'IT Support'}`,
        time: 'Just now'
      }
    ],
    attachments: ticketData.attachments || []
  };

  const dbPayload = {
    id: formattedTicket.id,
    employee_id: ticketData.employee_id || formattedTicket.employee_id,
    subject: formattedTicket.subject,
    department: formattedTicket.department,
    category: formattedTicket.category,
    priority: formattedTicket.priority,
    description: formattedTicket.description,
    status: formattedTicket.status,
    assigned_to: formattedTicket.assignedTo,
    conversation: formattedTicket.conversation,
    timeline: formattedTicket.timeline,
    attachments: formattedTicket.attachments
  };

  try {
    const { data: dbData } = await supabase.from('tickets').insert(dbPayload).select().maybeSingle();
    if (dbData) {
      Object.assign(formattedTicket, dbData);
    }
  } catch (e) {}

  try {
    const existing = JSON.parse(localStorage.getItem('hrms_local_tickets') || '[]');
    const updated = [formattedTicket, ...existing.filter(t => t.id !== formattedTicket.id)];
    localStorage.setItem('hrms_local_tickets', JSON.stringify(updated));
  } catch (e) {}

  return { data: formattedTicket, error: null };
};

export const deleteTicket = async (ticketId) => {
  try {
    await supabase.from('tickets').delete().eq('id', ticketId);
  } catch (e) {}

  try {
    const existing = JSON.parse(localStorage.getItem('hrms_local_tickets') || '[]');
    const updated = existing.filter(t => t.id !== ticketId);
    localStorage.setItem('hrms_local_tickets', JSON.stringify(updated));
  } catch (e) {}

  return { error: null };
};



// ─── HOLIDAYS ─────────────────────────────────────────────────────────────────
const DEFAULT_SEED_HOLIDAYS = [
  { id: 'HOL-2026-01', name: 'New Year\'s Day', date: '2026-01-01', type: 'National', description: 'Official First Day of 2026', applicableTo: 'All Departments' },
  { id: 'HOL-2026-02', name: 'Republic Day', date: '2026-01-26', type: 'National', description: 'National Republic Day Celebration', applicableTo: 'All Departments' },
  { id: 'HOL-2026-03', name: 'Holi', date: '2026-03-04', type: 'Regional', description: 'Festival of Colors', applicableTo: 'All Departments' },
  { id: 'HOL-2026-04', name: 'Good Friday', date: '2026-04-03', type: 'National', description: 'Good Friday Observance', applicableTo: 'All Departments' },
  { id: 'HOL-2026-05', name: 'Independence Day', date: '2026-08-15', type: 'National', description: '79th Indian Independence Day', applicableTo: 'All Departments' },
  { id: 'HOL-2026-06', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National', description: 'Mahatma Gandhi Birth Anniversary', applicableTo: 'All Departments' },
  { id: 'HOL-2026-07', name: 'Diwali', date: '2026-11-08', type: 'National', description: 'Festival of Lights', applicableTo: 'All Departments' },
  { id: 'HOL-2026-08', name: 'Christmas Day', date: '2026-12-25', type: 'National', description: 'Christmas Day Celebration', applicableTo: 'All Departments' }
];

export const getHolidays = async () => {
  let { data } = await supabase
    .from('holidays')
    .select('*');

  let localSaved = [];
  try {
    localSaved = JSON.parse(localStorage.getItem('hrms_local_holidays') || '[]');
  } catch (e) {}

  const mergedMap = new Map();
  [...DEFAULT_SEED_HOLIDAYS, ...localSaved, ...(data || [])].forEach(h => {
    const key = h.id || `${h.name}-${h.date}`;
    if (key) mergedMap.set(key, h);
  });

  const combined = Array.from(mergedMap.values());
  combined.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  return { data: combined, error: null };
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
  try {
    // 1. Get logged-in user profile details (name, email, emp_id)
    const { data: prof } = await getProfile(userId);
    const fullName = `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim();
    const empCode = prof?.emp_id || prof?.empCode;
    const userEmail = prof?.email;

    // 2. Fetch directly from assets table
    const { data: allAssets } = await supabase.from('assets').select('*');

    // 3. Also fetch from asset_assignments table if it exists
    const { data: assignments } = await supabase
      .from('asset_assignments')
      .select('*, assets(*)')
      .eq('employee_id', userId);

    let myAssets = [];

    if (allAssets && allAssets.length > 0) {
      myAssets = allAssets.filter(a => {
        const assigned = String(a.assigned_to || a.assignedTo || '').toLowerCase();
        if (!assigned || assigned === 'unassigned') return false;
        
        return (
          assigned.includes(userId?.toLowerCase()) ||
          (fullName && assigned.includes(fullName.toLowerCase())) ||
          (empCode && assigned.includes(String(empCode).toLowerCase())) ||
          (userEmail && assigned.includes(userEmail.toLowerCase()))
        );
      });
    }

    // 4. Merge asset_assignments
    if (assignments && assignments.length > 0) {
      assignments.forEach(assign => {
        if (assign.assets) {
          myAssets.push(assign.assets);
        }
      });
    }

    // 5. Merge local assets saved by Admin
    try {
      const localSaved = JSON.parse(localStorage.getItem('hrms_local_assets') || '[]');
      localSaved.forEach(a => {
        const assigned = String(a.assignedTo || a.assigned_to || '').toLowerCase();
        if (assigned && assigned !== 'unassigned') {
          if (
            assigned.includes(userId?.toLowerCase()) ||
            (fullName && assigned.includes(fullName.toLowerCase())) ||
            (empCode && assigned.includes(String(empCode).toLowerCase())) ||
            (userEmail && assigned.includes(userEmail.toLowerCase()))
          ) {
            myAssets.push(a);
          }
        }
      });
    } catch (e) {}

    // Deduplicate by asset id/code
    const uniqueMap = new Map();
    myAssets.forEach(item => {
      const key = item.asset_id || item.asset_code || item.id;
      if (key) uniqueMap.set(key, item);
    });

    return { data: Array.from(uniqueMap.values()), error: null };
  } catch (err) {
    console.error('getMyAssets error:', err);
    return { data: [], error: err };
  }
};

// --- NOTIFICATIONS ------------------------------------------------------------
export const getUnreadNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('employee_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .maybeSingle();
  return { data, error };
};

export const markAllNotificationsAsRead = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('employee_id', userId)
    .eq('is_read', false)
    .select();
  return { data, error };
};

// --- EXTENSION IDLE HISTORY ---
export const getIdleHistory = async (attendanceId) => {
  try {
    if (!attendanceId) return { data: [], error: null };
    const { data, error } = await supabase
      .from('employee_idle_history')
      .select('*')
      .eq('attendance_id', attendanceId);
    if (error) return { data: [], error: null };
    return { data: data || [], error: null };
  } catch (e) {
    return { data: [], error: null };
  }
};

// --- CELEBRATIONS & APPRECIATIONS ---

export const getUpcomingCelebrations = async () => {
  try {
    // Fetch all profiles to find birthdays and anniversaries
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, raw_data');
      
    if (error || !data) return { data: [], error: null };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const celebrations = [];

    data.forEach(profile => {
      const raw = profile.raw_data || {};
      
      // Check Birthday
      if (raw.dob) {
        const dobDate = new Date(raw.dob);
        if (dobDate.getMonth() === currentMonth) {
          celebrations.push({
            id: `${profile.id}-bday`,
            type: 'birthday',
            employee: { id: profile.id, name: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar_url },
            date: new Date(currentYear, currentMonth, dobDate.getDate())
          });
        }
      }

      // Check Work Anniversary
      if (raw.joinDate) {
        const joinDate = new Date(raw.joinDate);
        if (joinDate.getMonth() === currentMonth) {
          const years = currentYear - joinDate.getFullYear();
          if (years > 0) {
            celebrations.push({
              id: `${profile.id}-anniv`,
              type: 'anniversary',
              employee: { id: profile.id, name: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar_url },
              date: new Date(currentYear, currentMonth, joinDate.getDate()),
              years
            });
          }
        }
      }
    });

    // Sort by upcoming date
    celebrations.sort((a, b) => a.date - b.date);

    return { data: celebrations, error: null };
  } catch (e) {
    return { data: [], error: null };
  }
};

const DEFAULT_SEED_APPRECIATIONS = [];

export const getAppreciations = async () => {
  let localSaved = [];
  try {
    localSaved = JSON.parse(localStorage.getItem('hrms_local_appreciations') || '[]');
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('appreciations')
      .select(`
        id, message, type, created_at,
        sender_name, receiver_name
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      const mergedMap = new Map();
      [...localSaved, ...data].forEach(a => {
        if (a && a.id) mergedMap.set(a.id, a);
      });
      return { data: Array.from(mergedMap.values()), error: null };
    }
  } catch (e) {
    // Ignore remote table missing errors
  }

  const mergedMap = new Map();
  [...DEFAULT_SEED_APPRECIATIONS, ...localSaved].forEach(a => {
    if (a && a.id) mergedMap.set(a.id, a);
  });
  return { data: Array.from(mergedMap.values()), error: null };
};

export const createAppreciation = async (appreciationData) => {
  const newObj = {
    id: appreciationData.id || ('app-' + Date.now().toString().slice(-6)),
    created_at: new Date().toISOString(),
    ...appreciationData
  };

  try {
    const existing = JSON.parse(localStorage.getItem('hrms_local_appreciations') || '[]');
    localStorage.setItem('hrms_local_appreciations', JSON.stringify([newObj, ...existing]));
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('appreciations')
      .insert([appreciationData])
      .select()
      .maybeSingle();

    if (data) return { data, error: null };
  } catch (e) {}

  return { data: newObj, error: null };
};


// ─── PROJECTS (Employee-facing) ────────────────────────────────────────────────

// Get all projects the logged-in employee is a member of
export const getMyProjects = async (userId) => {
  if (!userId) return { data: [], error: 'No user ID' };
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id, role,
        projects(
          id, name, description, status, priority, start_date, end_date, tags,
          project_departments(department),
          project_members(id)
        )
      `)
      .eq('employee_id', userId);

    if (error) throw error;

    const projects = (data || []).map(m => ({
      memberId: m.id,
      myRole: m.role,
      ...(m.projects || {}),
      departments: (m.projects?.project_departments || []).map(d => d.department),
      memberCount: (m.projects?.project_members || []).length,
    }));

    return { data: projects, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
};

// Get all active project names for dropdowns
export const getCompanyProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status')
      .neq('status', 'cancelled')
      .order('name');

    if (error) throw error;

    const names = (data || []).map(p => p.name);
    return { data: names.length > 0 ? names : ['General Project'], error: null };
  } catch (err) {
    // Fallback
    return { data: ['General Project'], error: null };
  }
};

