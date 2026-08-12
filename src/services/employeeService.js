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
        .single();

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
    .single();
  return { data, error };
};

export const startBreak = async (attendanceId, breaksArray, reason) => {
  const now = new Date().toTimeString().slice(0, 5);
  const newBreak = { start: now, end: null, reason, duration: 0 };
  const updatedBreaks = [...(breaksArray || []), newBreak];

  const { data, error } = await supabase
    .from('attendance')
    .update({ breaks: updatedBreaks })
    .eq('id', attendanceId)
    .select()
    .single();
  return { data, error };
};

export const endBreak = async (attendanceId, breaksArray, breakIndex) => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date().toTimeString().slice(0, 5);
  
  const updatedBreaks = [...breaksArray];
  const currentBreak = updatedBreaks[breakIndex];
  
  if (!currentBreak || currentBreak.end) {
    return { error: { message: 'Invalid break state.' } };
  }

  currentBreak.end = now;
  
  const startTime = new Date(`${today}T${currentBreak.start}`);
  const endTime = new Date(`${today}T${now}`);
  const durationSecs = Math.floor((endTime - startTime) / 1000);
  currentBreak.duration = durationSecs;

  const totalBreakSecs = updatedBreaks.reduce((acc, b) => acc + (b.duration || 0), 0);
  const totalBreakHours = (totalBreakSecs / 3600).toFixed(2);

  const { data, error } = await supabase
    .from('attendance')
    .update({ breaks: updatedBreaks, total_break_hours: totalBreakHours })
    .eq('id', attendanceId)
    .select()
    .single();
  return { data, error };
};

export const checkOut = async (userId) => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date().toTimeString().slice(0, 5);

  const { data: record } = await supabase
    .from('attendance')
    .select('id, check_in, total_break_hours')
    .eq('employee_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!record) return { error: { message: 'No check-in found for today.' } };

  // Calculate total hours
  const checkInTime = new Date(`${today}T${record.check_in}`);
  const checkOutTime = new Date(`${today}T${now}`);
  const grossHours = (checkOutTime - checkInTime) / 3600000;
  const netHours = Math.max(0, grossHours - (record.total_break_hours || 0)).toFixed(2);

  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out: now, total_hours: netHours })
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

export const updateWorksheet = async (id, updates) => {
  const { data, error } = await supabase
    .from('worksheets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
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
    .single();
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

export const getAppreciations = async () => {
  try {
    const { data, error } = await supabase
      .from('appreciations')
      .select(`
        id, message, type, created_at,
        sender_name, receiver_name
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return { data: [], error: null };
    return { data: data || [], error: null };
  } catch (e) {
    return { data: [], error: null };
  }
};

export const createAppreciation = async (appreciationData) => {
  try {
    const { data, error } = await supabase
      .from('appreciations')
      .insert([appreciationData])
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
};
