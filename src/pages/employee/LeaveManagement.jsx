import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  User,
  Bell,
  Settings,
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  Plus,
  Plane,
  Heart,
  Home,
  Eye,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Ticket,
  PackageOpen,
  X,
  CalendarDays
} from 'lucide-react';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  DateInput,
  TextArea,
  TextInput,
  FileUpload,
  Checkbox,
  FormFooter
} from '../../components/employee/EnterpriseForm';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/leave-management.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyLeaves, applyLeave } from '../../services/employeeService';

const leaveData = [
  { id: 'LV-2025-032', type: 'Casual Leave', from: '12 May 2025', to: '13 May 2025', days: 2, reason: 'Family function', status: 'Approved', appliedOn: '08 May 2025' },
  { id: 'LV-2025-031', type: 'Sick Leave', from: '05 May 2025', to: '05 May 2025', days: 1, reason: 'Fever and cold', status: 'Approved', appliedOn: '04 May 2025' },
  { id: 'LV-2025-030', type: 'Work From Home', from: '01 May 2025', to: '01 May 2025', days: 1, reason: 'Internet issue', status: 'Approved', appliedOn: '30 Apr 2025' },
  { id: 'LV-2025-029', type: 'Casual Leave', from: '20 Apr 2025', to: '22 Apr 2025', days: 3, reason: 'Personal work', status: 'Rejected', appliedOn: '18 Apr 2025' },
  { id: 'LV-2025-028', type: 'Sick Leave', from: '10 Apr 2025', to: '11 Apr 2025', days: 2, reason: 'Medical checkup', status: 'Approved', appliedOn: '09 Apr 2025' },
  { id: 'LV-2025-027', type: 'Casual Leave', from: '02 Apr 2025', to: '02 Apr 2025', days: 1, reason: 'Travel', status: 'Approved', appliedOn: '31 Mar 2025' },
];

function LeaveManagement() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Leave History');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [attachment, setAttachment] = useState(null);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type.startsWith('image/') ? 'img' : 'doc',
        url: reader.result
      });
    };
    reader.readAsDataURL(file);
  };
  const [leaveStats, setLeaveStats] = useState({
    monthlyUsed: 0,
    currentlyAvailable: 2,
    yearlyUsed: 0,
    yearlyAvailable: 24,
    wfhDaysThisMonth: 0,
    wfhDaysThisYear: 0,
    pendingRequestsCount: 0
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await getMyLeaves(user.id);
      if (data) {
        setLeaves(data);

        // Calculate stats for current month and year
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let monthlyUsed = 0;
        let yearlyUsed = 0;
        let wfhDaysThisMonth = 0;
        let wfhDaysThisYear = 0;
        let pendingRequestsCount = 0;

        data.forEach(l => {
          const typeStr = (l.leave_type || '').toLowerCase();
          const isWfh = typeStr.includes('wfh') || typeStr.includes('work from home');
          const statusLower = (l.status || '').toLowerCase();
          const isPending = statusLower === 'pending';
          const days = calculateDays(l.start_date, l.end_date);
          const d = new Date(l.start_date);

          if (isPending) {
            pendingRequestsCount++;
          }

          if (statusLower !== 'rejected') {
            if (isWfh) {
              if (d.getFullYear() === currentYear) {
                wfhDaysThisYear += days;
                if (d.getMonth() === currentMonth) {
                  wfhDaysThisMonth += days;
                }
              }
            } else {
              if (d.getFullYear() === currentYear) {
                yearlyUsed += days;
                if (d.getMonth() === currentMonth) {
                  monthlyUsed += days;
                }
              }
            }
          }
        });

        // Rollover Logic: Employee earns 2 leaves every month.
        const earnedSoFar = (currentMonth + 1) * 2;
        const currentlyAvailable = Math.max(0, earnedSoFar - yearlyUsed);

        setLeaveStats({
          monthlyUsed,
          currentlyAvailable,
          yearlyUsed,
          yearlyAvailable: Math.max(0, 24 - yearlyUsed),
          wfhDaysThisMonth,
          wfhDaysThisYear,
          pendingRequestsCount
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (!newLeave.start_date || !newLeave.end_date || !newLeave.reason) {
      showToast('error', 'Please fill in all required fields: Start Date, End Date, and Reason.');
      return;
    }

    setSubmitting(true);

    const { data, error } = await applyLeave({
      employee_id: user.id,
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      reason: newLeave.reason,
      status: 'pending',
      attachments: attachment ? [attachment] : []
    });

    if (data) {
      if (newLeave.leave_type === 'Work From Home') {
        try {
          await supabase.from('wfh_requests').insert({
            employee_id: user.id,
            reason: newLeave.reason,
            from_date: newLeave.start_date,
            to_date: newLeave.end_date,
            status: 'pending',
            location: 'Remote Location'
          });
        } catch (e) {
          console.warn('wfh_requests sync optional notice:', e);
        }
      }

      setLeaves([data, ...leaves]);
      setShowModal(false);
      setNewLeave({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
      setAttachment(null);
      showToast('success', '🎉 Your request has been submitted successfully! It is now pending approval.');
    } else {
      showToast('error', 'Failed to submit request: ' + (error?.message || 'Unknown error. Please try again.'));
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout>

      {/* Page Content */}
      <div className="leave-content">
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            minWidth: '320px',
            maxWidth: '460px',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1.5px solid ${toast.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            animation: 'slideInToast 0.35s cubic-bezier(.22,.61,.36,1)',
          }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: toast.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '4px' }}>
                {toast.type === 'success' ? 'Leave Submitted!' : 'Submission Failed'}
              </div>
              <div style={{ fontSize: '13px', color: toast.type === 'success' ? '#047857' : '#b91c1c', lineHeight: '1.5' }}>
                {toast.message}
              </div>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af', lineHeight: 1, padding: 0, marginLeft: '4px' }}>×</button>
          </div>
        )}

        <style>{`
            @keyframes slideInToast {
              from { opacity: 0; transform: translateX(60px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>

        <div className="page-header-row">
          <div className="page-title-box">
            <h1>Leave Management</h1>
            <p>Apply for leave and track your leave history</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Apply Leave
          </button>
        </div>

        {/* Stats Grid */}
        <div className="leave-stats-grid">
          <div className="leave-stat-card">
            <div className="leave-icon-wrapper casual">
              <Plane size={20} />
            </div>
            <div className="leave-stat-info">
              <p className="leave-stat-label">Currently Available</p>
              <h3 className="leave-stat-value" style={{ color: leaveStats.currentlyAvailable === 0 ? '#ef4444' : '#16a34a' }}>
                {leaveStats.currentlyAvailable} Days
              </h3>
              <p className="leave-stat-meta">Rollover Balance</p>
            </div>
          </div>

          <div className="leave-stat-card">
            <div className="leave-icon-wrapper sick">
              <Heart size={20} />
            </div>
            <div className="leave-stat-info">
              <p className="leave-stat-label">Paid Leaves Used</p>
              <h3 className="leave-stat-value">{leaveStats.monthlyUsed} Days</h3>
              <p className="leave-stat-meta">This Month</p>
            </div>
          </div>

          <div className="leave-stat-card">
            <div className="leave-icon-wrapper wfh" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <Home size={20} />
            </div>
            <div className="leave-stat-info">
              <p className="leave-stat-label">Work From Home</p>
              <h3 className="leave-stat-value" style={{ color: '#7c3aed' }}>{leaveStats.wfhDaysThisMonth} Days</h3>
              <p className="leave-stat-meta">Remote Work ({leaveStats.wfhDaysThisYear} YTD)</p>
            </div>
          </div>

          <div className="leave-stat-card">
            <div className="leave-icon-wrapper total" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <CalendarDays size={20} />
            </div>
            <div className="leave-stat-info">
              <p className="leave-stat-label">Pending Approval</p>
              <h3 className="leave-stat-value" style={{ color: leaveStats.pendingRequestsCount > 0 ? '#ea580c' : 'inherit' }}>
                {leaveStats.pendingRequestsCount} Request{leaveStats.pendingRequestsCount === 1 ? '' : 's'}
              </h3>
              <p className="leave-stat-meta">Awaiting Admin</p>
            </div>
          </div>

          <div className="leave-stat-card">
            <div className="leave-icon-wrapper total">
              <Calendar size={20} />
            </div>
            <div className="leave-stat-info">
              <p className="leave-stat-label">Yearly Balance</p>
              <h3 className="leave-stat-value">{leaveStats.yearlyAvailable} Days</h3>
              <p className="leave-stat-meta">Out of 24 Annual Quota</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="leave-tabs">
          <button className={`leave-tab ${activeTab === 'Leave History' ? 'active' : ''}`} onClick={() => setActiveTab('Leave History')}>Leave History</button>
          <button className={`leave-tab ${activeTab === 'Upcoming Leaves' ? 'active' : ''}`} onClick={() => setActiveTab('Upcoming Leaves')}>Upcoming Leaves</button>
          <button className={`leave-tab ${activeTab === 'Leave Balance' ? 'active' : ''}`} onClick={() => setActiveTab('Leave Balance')}>Leave Balance</button>
        </div>

        {/* Filters */}
        <div className="leave-filters">
          <div className="filter-dropdown">
            <span>All Status</span>
            <ChevronDown size={16} />
          </div>
          <div className="filter-date">
            <span>01 May 2025 - 31 May 2025</span>
            <Calendar size={16} />
          </div>
          <div className="filter-search">
            <input type="text" placeholder="Search leave..." />
            <Search size={16} color="#9ca3af" />
          </div>
          <button className="filter-icon-btn">
            <Calendar size={18} />
          </button>
        </div>

        {/* Data Table */}
        <div className="leave-table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.filter(row => {
                if (activeTab === 'Upcoming Leaves') return row.status === 'pending' || new Date(row.start_date) > new Date();
                if (activeTab === 'Leave Balance') return row.status === 'approved';
                return true;
              }).map((row) => (
                <tr key={row.id}>
                  <td className="fw-medium">{row.id.substring(0, 8)}</td>
                  <td>
                    <span className={`type-badge ${row.leave_type.toLowerCase().replace(/ /g, '-')}`}>
                      {row.leave_type}
                    </span>
                  </td>
                  <td>{new Date(row.start_date).toLocaleDateString()}</td>
                  <td>{new Date(row.end_date).toLocaleDateString()}</td>
                  <td>{calculateDays(row.start_date, row.end_date)}</td>
                  <td className="text-gray">{row.reason}</td>
                  <td>
                    <span className={`status-badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="leave-pagination">
          <p>Showing 1 to 6 of 18 leaves</p>
          <div className="pagination-controls">
            <button className="page-btn nav-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn nav-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      {/* Apply Leave Enterprise Modal */}
      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FormHeader
          icon={CalendarDays}
          title="Apply for Leave"
          description="Submit a new time-off request for manager approval."
        />

        <form onSubmit={handleApplyLeave}>
          <FormBody>
            <FormSection title="Leave Details" description="Specify the dates and type of leave you are requesting.">
              <FormField label="Leave Type" required fullWidth>
                <SelectInput
                  options={['Casual Leave', 'Sick Leave', 'Work From Home', 'Earned Leave', 'Unpaid Leave']}
                  value={newLeave.leave_type}
                  onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Start Date" required>
                <DateInput
                  value={newLeave.start_date}
                  onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="End Date" required>
                <DateInput
                  value={newLeave.end_date}
                  onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                  required
                />
              </FormField>

              <FormField fullWidth>
                <Checkbox label="Half Day" />
              </FormField>
            </FormSection>

            <FormSection title="Additional Information" description="Provide context and necessary documentation.">
              <FormField label="Reason" required fullWidth>
                <TextArea
                  placeholder="Explain why you are requesting this leave..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Emergency Contact" fullWidth optional>
                <TextInput placeholder="Phone number or name..." />
              </FormField>

              <FormField label="Supporting Documents" fullWidth optional>
                <FileUpload 
                  hint="Upload medical certificates or relevant docs (PNG, JPG, PDF max 10MB)" 
                  onChange={handleFileChange}
                  fileName={attachment ? attachment.name : ''}
                />
                {attachment && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#1e40af', fontWeight: 600 }}>📁 {attachment.name} ({attachment.size})</span>
                    <button type="button" onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Remove</button>
                  </div>
                )}
              </FormField>
            </FormSection>
          </FormBody>

          <FormFooter
            onCancel={() => setShowModal(false)}
            onSubmit={handleApplyLeave}
            submitText="Submit Application"
            isSaving={submitting}
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default LeaveManagement;
