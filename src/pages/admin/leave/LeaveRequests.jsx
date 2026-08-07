import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, CheckCircle, XCircle, Eye, RefreshCw, X, Paperclip, SearchX, Check, Undo2 } from 'lucide-react';
import '../../../styles/admin/leave/leave-requests.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllLeaveRequests, updateLeaveStatus } from '../../../services/adminService';
import { useAuth } from '../../../contexts/AuthContext';

// Mock Data
const MOCK_REQUESTS = [];

const LeaveRequests = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data } = await getAllLeaveRequests();
    setRequests(data || []);
    setLoading(false);
  };

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const empName = req.profiles ? `${req.profiles.first_name} ${req.profiles.last_name}` : '';
    const matchesTab = activeTab === 'All' ? true : req.status === activeTab.toLowerCase();
    const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? req.profiles?.departments?.name === deptFilter : true;
    const matchesType = typeFilter ? req.leave_type === typeFilter : true;
    return matchesTab && matchesSearch && matchesDept && matchesType;
  });

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage) || 1;
  const currentRecords = filteredRequests.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const openDrawer = (req) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
    setAdminComment('');
  };

  const initiateAction = (req, action) => {
    setSelectedRequest(req);
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const confirmActionSubmit = async () => {
    setSubmitting(true);
    const newStatus = confirmAction === 'approve' ? 'approved' : 'rejected';
    const { data, error } = await updateLeaveStatus(selectedRequest.id, newStatus, user?.id);
    if (data) {
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: newStatus } : r));
    } else {
      alert('Error: ' + error?.message);
    }
    setIsConfirmModalOpen(false);
    setIsDrawerOpen(false);
    setAdminComment('');
    setConfirmAction(null);
    setSubmitting(false);
  };

  return (
    <motion.div 
      className="leave-requests-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Leave Requests</h1>
          <p>Review and manage employee leave applications</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="tabs-bar">
        {['Pending', 'Approved', 'Rejected', 'All'].map(tab => {
          const count = tab === 'All' 
            ? requests.length 
            : requests.filter(r => r.status === tab).length;
          
          return (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab} ({count})
            </button>
          )
        })}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchTerm}
            onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Operations', label: 'Operations' }
            ]}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Leave Types' },
              { value: 'Casual Leave', label: 'Casual Leave' },
              { value: 'Sick Leave', label: 'Sick Leave' },
              { value: 'Earned Leave', label: 'Earned Leave' },
              { value: 'Maternity Leave', label: 'Maternity Leave' },
              { value: 'Compensatory Off', label: 'Compensatory Off' }
            ]}
          />
        </div>
        <input type="date" className="filter-date" />
      </div>

      <div className="table-container">
        {filteredRequests.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No leave requests found"
            message="No requests match your current filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(req => (
              <tr key={req.id}>
                <td>
                  <div className="employee-cell">
                    <div className="emp-avatar">{req.avatar}</div>
                    <div>
                      <div>{req.empName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '400' }}>{req.empId} • {req.dept}</div>
                    </div>
                  </div>
                </td>
                <td>{req.type}</td>
                <td>{req.from}</td>
                <td>{req.to}</td>
                <td>{req.days}</td>
                <td>{req.appliedOn}</td>
                <td>
                  <span className={`badge ${req.status.toLowerCase()}`}>{req.status}</span>
                </td>
                <td>
                  <div className="lr-action-group">
                    {req.status === 'Pending' && (
                      <>
                        <button className="lr-btn-approve" title="Approve" onClick={() => initiateAction(req, 'approve')}>
                          <Check size={13} /> Approve
                        </button>
                        <button className="lr-btn-reject" title="Reject" onClick={() => initiateAction(req, 'reject')}>
                          <X size={13} /> Reject
                        </button>
                      </>
                    )}
                    {req.status === 'Rejected' && (
                      <button className="lr-btn-sendback" title="Reconsider" onClick={() => initiateAction(req, 'approve')}>
                        <Undo2 size={13} /> Send Back
                      </button>
                    )}
                    <button className="lr-btn-view" title="View Details" onClick={() => openDrawer(req)}>
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {filteredRequests.length > 0 && (
          <div className="pagination">
            <div className="page-info">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredRequests.length)} of {filteredRequests.length}
              <div style={{ marginLeft: '12px', display: 'inline-block', width: '100px', verticalAlign: 'middle' }}>
                <CustomDropdown
                  value={rowsPerPage}
                  onChange={(val) => { setRowsPerPage(Number(val)); setCurrentPage(1); }}
                  options={[
                    { value: 5, label: '5 / page' },
                    { value: 10, label: '10 / page' },
                    { value: 20, label: '20 / page' }
                  ]}
                  size="sm"
                />
              </div>
            </div>
            <div className="page-controls">
              <button 
                className="page-btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                ◀
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="page-btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedRequest && (
          <div className="drawer-overlay" onClick={closeDrawer}>
            <motion.div 
              className="drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h2>Leave Request Details</h2>
                <button className="close-btn" onClick={closeDrawer}><X size={24} /></button>
              </div>
              <div className="drawer-body">
                <div className="drawer-section">
                  <div className="employee-cell" style={{ marginBottom: '20px' }}>
                    <div className="emp-avatar" style={{ width: 48, height: 48, fontSize: '16px' }}>{selectedRequest.avatar}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedRequest.empName}</div>
                      <div style={{ color: 'var(--text-tertiary)' }}>{selectedRequest.empId} • {selectedRequest.dept}</div>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="label">Leave Type</div>
                    <div className="value">{selectedRequest.type}</div>
                  </div>
                  <div className="detail-row">
                    <div className="label">Duration</div>
                    <div className="value">{selectedRequest.from} — {selectedRequest.to}</div>
                  </div>
                  <div className="detail-row">
                    <div className="label">Total Days</div>
                    <div className="value">{selectedRequest.days} Days</div>
                  </div>
                  <div className="detail-row">
                    <div className="label">Reason</div>
                    <div className="value">"{selectedRequest.reason}"</div>
                  </div>
                </div>

                {selectedRequest.type === 'Sick Leave' && selectedRequest.days >= 3 && (
                  <div className="drawer-section">
                    <h3>Attachments</h3>
                    <div className="attachment-card">
                      <Paperclip size={18} color="#6b7280" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>medical_certificate.pdf</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>1.2 MB</div>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>View</button>
                    </div>
                  </div>
                )}

                <div className="drawer-section">
                  <h3>Approval History</h3>
                  <div className="detail-row">
                    <div className="label">Applied On</div>
                    <div className="value">{selectedRequest.appliedOn}</div>
                  </div>
                  <div className="detail-row">
                    <div className="label">Current Status</div>
                    <div className="value">
                      <span className={`badge ${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span>
                    </div>
                  </div>
                </div>

                {selectedRequest.status === 'Pending' && (
                  <div className="drawer-section">
                    <h3>Admin Comment (Optional)</h3>
                    <textarea 
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                      placeholder="Add a note before approving/rejecting..."
                      value={adminComment}
                      onChange={e => setAdminComment(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
              
              {selectedRequest.status === 'Pending' && (
                <div className="drawer-footer">
                  <button className="btn-reject" onClick={() => initiateAction(selectedRequest, 'reject')}>Reject</button>
                  <button className="btn-approve" onClick={() => initiateAction(selectedRequest, 'approve')}>Approve</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="modal-overlay" onClick={() => setIsConfirmModalOpen(false)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Confirm Action</h3>
              <p>Are you sure you want to {confirmAction} the leave request for <strong>{selectedRequest?.empName}</strong>?</p>
              
              {!isDrawerOpen && (
                <textarea 
                  placeholder="Optional comment..."
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                ></textarea>
              )}

              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
                <button className="modal-btn confirm" onClick={confirmActionSubmit}>Confirm {confirmAction === 'approve' ? 'Approval' : 'Rejection'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeaveRequests;
