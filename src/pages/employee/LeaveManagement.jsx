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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Leave History');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await getMyLeaves(user.id);
      setLeaves(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await applyLeave({
      employee_id: user.id,
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      reason: newLeave.reason,
      status: 'pending'
    });

    if (data) {
      setLeaves([data, ...leaves]);
      setShowModal(false);
      setNewLeave({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
    } else {
      alert('Error: ' + error?.message);
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout>

        {/* Page Content */}
        <div className="leave-content">
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
              <div className="leave-icon-wrapper total">
                <Calendar size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Total Leave Balance</p>
                <h3 className="leave-stat-value">22 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper casual">
                <Plane size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Casual Leave</p>
                <h3 className="leave-stat-value">12 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper sick">
                <Heart size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Sick Leave</p>
                <h3 className="leave-stat-value">6 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper wfh">
                <Home size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Work From Home</p>
                <h3 className="leave-stat-value">4 Days</h3>
                <p className="leave-stat-meta">Available</p>
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
                  if (activeTab === 'Upcoming Leaves') return row.status === 'Pending' || new Date(row.from) > new Date();
                  if (activeTab === 'Leave Balance') return row.status === 'Approved';
                  return true;
                }).map((row) => (
                  <tr key={row.id}>
                    <td className="fw-medium">{row.id}</td>
                    <td>
                      <span className={`type-badge ${row.type.toLowerCase().replace(/ /g, '-')}`}>
                        {row.type}
                      </span>
                    </td>
                    <td>{row.from}</td>
                    <td>{row.to}</td>
                    <td>{row.days}</td>
                    <td className="text-gray">{row.reason}</td>
                    <td>
                      <span className={`status-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.appliedOn}</td>
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
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Start Date" required>
                <DateInput 
                  value={newLeave.from}
                  onChange={(e) => setNewLeave({...newLeave, from: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="End Date" required>
                <DateInput 
                  value={newLeave.to}
                  onChange={(e) => setNewLeave({...newLeave, to: e.target.value})}
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
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Emergency Contact" fullWidth>
                <TextInput placeholder="Phone number or name..." />
              </FormField>
              
              <FormField label="Supporting Documents" fullWidth>
                <FileUpload hint="Upload medical certificates or relevant docs (Max 5MB)" />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowModal(false)} 
            submitText="Submit Application" 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default LeaveManagement;
